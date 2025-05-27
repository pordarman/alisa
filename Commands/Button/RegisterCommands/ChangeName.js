"use strict";
const database = require("../../../Helpers/Database.js");
const {
    RESTJSONErrorCodes,
    AttachmentBuilder
} = require("discord.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const allPhotos = {
    tr: new AttachmentBuilder("https://i.hizliresim.com/s190sc5.png", {
        name: "ornek_kullanim.png",
        description: "Komutun nasıl kullanılacağına dair örnek"
    }),
    en: new AttachmentBuilder("https://i.hizliresim.com/s190sc5.png", {
        name: "example_usage.png",
        description: "Example of how to use the command"
    })
};
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: "changeName", // Butonun ismi
    id: "isim", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcının ismini değiştirir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        splitCustomId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        extras,
        language
    }) {

        // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        const intMember = int.member;
        const [_, memberId] = splitCustomId;
        const guildMe = guild.members.me;
        const highestRole = guildMe.roles.highest;
        const {
            commands: {
                isim: messages
            },
            registers: registerMessages,
            permissions: permissionMessages,
            members: memberMessages,
            others: otherMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        async function changeName({
            memberId,
            member,
            authorId,
        }) {
            int.channel.awaitMessages({
                filter: message => message.author.id === authorId && message.content?.trim()?.length > 0,
                max: 1,
                time: 30 * 1000, // 30 saniye boyunca kullanıcının işlem yapmasını bekle
                errors: ["time"]
            })
                // Eğer mesaj attıysa
                .then(async discordMessages => {
                    // Eğer mesajı attıysa database'den kullanıcının verisini sil
                    delete guildDatabase.waitMessageCommands.changeName[memberId];
                    await database.updateGuild(guildId, {
                        $unset: {
                            [`waitMessageCommands.changeName.${memberId}`]: ""
                        }
                    });

                    // Buton süre verisini 1 saniye sonra sil
                    setTimeout(() => {
                        Util.maps.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                    }, 1000);

                    const waitMessage = discordMessages.first()

                    const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
                    let memberName = waitMessage.content;
                    let age;

                    // Eğer bir kişinin ismini değiştirmeye çalışıyorsa
                    if (!member.user.bot) {

                        // Kullanıcının ismindeki yaşı çek
                        age = memberName.match(Util.regex.fetchAge)?.[0];

                        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
                        if (!age && guildDatabase.register.isAgeRequired) return errorEmbed(registerMessages.enterAge);

                        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
                        const ageLimit = guildDatabase.register.ageLimit;
                        if (ageLimit && ageLimit > Number(age)) return errorEmbed(registerMessages.underAge(ageLimit));

                        // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
                        if (hasGuildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
                            memberName = memberName.replace(age, "").replace(/ +/g, " ");
                        }
                    }

                    memberName = Util.customMessages.registerName({
                        message: hasGuildCustomRegisterName,
                        name: memberName,
                        guildDatabase,
                        age,
                        isBot: member.user.bot
                    });

                    // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
                    if (memberName.length > 32) return errorEmbed(registerMessages.discordNameError);

                    // Eğer kişinin ismi yazılan isimle aynıysa
                    if (member.nickname === memberName) return errorEmbed(messages.sameName(memberId));

                    // Kullanıcıyı düzenle
                    member.setNickname(memberName)
                        // Eğer düzenleme başarılıysa
                        .then(async () => {
                            waitMessage.reply(registerMessages.successChangeName({
                                authorId,
                                memberId,
                                memberName
                            }))

                            const userLogs = guildDatabase.userLogs[memberId] ??= [];

                            // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                            const NOW_TIME = Date.now();

                            const userLogObject = {
                                type: "changeName",
                                newName: memberName,
                                authorId,
                                timestamp: NOW_TIME
                            };
                            userLogs.unshift(userLogObject);
                            await database.updateGuild(guildId, {
                                $push: {
                                    [`userLogs.${memberId}`]: {
                                        $each: [userLogObject],
                                        $position: 0,
                                    }

                                }
                            });

                        }).catch(err => {
                            switch (err.code) {
                                // Eğer kişi sunucuda değilse
                                case RESTJSONErrorCodes.UnknownMember:
                                    return waitMessage.reply(memberMessages.isNotInGuild.member);

                                // Eğer botun rolü yüksekse
                                case RESTJSONErrorCodes.MissingPermissions:
                                    return waitMessage.reply({
                                        content: memberMessages.memberIsHigherThanMeName({
                                            memberId,
                                            highestRoleId: Util.getBotOrHighestRole(guildMe).id,
                                        }),
                                        allowedMentions: {
                                            users: [],
                                            roles: [],
                                            repliedUser: false
                                        }
                                    });

                                // Eğer hatanın sebebi başka bir şeyse
                                default:
                                    console.error(err)
                                    return waitMessage.reply(
                                        unknownErrorMessages.unknownError(err)
                                    );
                            }
                        })
                })
                // Eğer süre bittiyse bilgilendirme mesajı gönder
                .catch(async () => {
                    int.channel?.send(otherMessages.timeIsUp(authorId))

                    // Eğer mesajı atmadıysa database'den kullanıcının verisini sil
                    Util.maps.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
                    delete guildDatabase.waitMessageCommands.changeName[memberId];
                    await database.updateGuild(guildId, {
                        $unset: {
                            [`waitMessageCommands.changeName.${memberId}`]: ""
                        }
                    });
                })
        }

        // Eğer bot yeniden başlatılmadan önce mesaj bekleniyorsa komutu tekrardan çalıştır
        if (extras) {
            const {
                authorId,
                memberId
            } = extras;

            // Hata çıkmaması için butonla ismini değiştirdiğini önbelleğe kaydet
            Util.maps.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);

            // Hata çıkmaması için önbelleği 35 saniye sonra sil
            setTimeout(() => {
                Util.maps.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
            }, 35 * 1000);

            const member = await Util.fetchMemberForce(int.guild, memberId);

            if (!member) return int.reply(registerMessages.notInGuild(memberId));

            return changeName({
                memberId,
                member,
                authorId
            });
        }

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix,
                hasAdmin: intMember.permissions.has("Administrator")
            })
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed(permissionMessages.manageNicknames, "botPermissionError");

        const member = await Util.fetchMemberForce(int.guild, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(memberMessages.isNotInGuild.member);

        // Kullanıcının ismini başka birisi daha değiştirmeye çalışıyorsa
        const isButtonChangeName = Util.maps.buttonChangeNameMember.get(`${guildId}.${memberId}`);
        if (isButtonChangeName) return errorEmbed(
            isButtonChangeName == authorId ?
                registerMessages.whileChangeName.you :
                registerMessages.whileChangeName.other
        );

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !intMember.permissions.has("ChangeNickname")) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(
            memberMessages.memberIsHigherThanMe({
                memberId,
                highestRoleId: Util.getBotOrHighestRole(guildMe).id
            })
        );

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId))

        // Hata çıkmaması için butonla ismini değiştirdiğini ettiğini önbelleğe kaydet
        Util.maps.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);
        int.message.reply({
            content: registerMessages.enterOnlyName({
                authorId,
                memberId
            }),
            files: [
                allPhotos[language]
            ]
        })
            // Eğer mesaj gönderildiyse önbelleğe kaydet
            .then(async message => {
                guildDatabase.waitMessageCommands.changeName[memberId] = {
                    commandName: this.name,
                    authorId,
                    messageId: message.id,
                    channelId: int.channelId,
                    timestamp: Date.now(),
                }
                await database.updateGuild(guildId, {
                    $set: {
                        [`waitMessageCommands.changeName.${memberId}`]: guildDatabase.waitMessageCommands.changeName[memberId]
                    }
                });

                // Hata çıkmaması için önbelleği 35 saniye sonra sil
                setTimeout(() => {
                    Util.maps.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                }, 35 * 1000);

                return changeName({
                    memberId,
                    member,
                    authorId,
                });
            })
            // Eğer bir hata olurda mesajı atamazsa hiçbir şey yapma
            .catch(() => {
                Util.maps.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
            })
    },
};