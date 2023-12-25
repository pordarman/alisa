"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    RESTJSONErrorCodes,
    AttachmentBuilder
} = require("discord.js");
const photoFile = new AttachmentBuilder("https://i.hizliresim.com/s190sc5.png", {
    name: "ornek_kullanim.png",
    description: "Komutun nasıl kullanılacağına dair örnek"
})
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "changeName", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcının ismini değiştirir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        registerDatas
    }) {

        // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        const intMember = int.member;
        const [_, memberId] = customId.split("-");
        const guildMe = guild.members.me;
        const highestRole = guildMe.roles.highest;

        async function changeName({
            memberId,
            member,
            authorId,
        }) {
            return await int.channel.awaitMessages({
                filter: message => message.author.id === authorId,
                max: 1,
                time: 30 * 1000 // 30 saniye boyunca kullanıcının işlem yapmasını bekle
            })
                // Eğer mesaj attıysa
                .then(async messages => {
                    // Eğer mesajı attıysa database'den kullanıcının verisini sil
                    delete guildDatabase.waitMessageCommands.changeName[memberId];
                    database.writeFile(guildDatabase, guildId);

                    // Buton süre verisini 1 saniye sonra sil
                    setTimeout(() => {
                        int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                    }, 1000);

                    const waitMessage = messages.first()
                    if (waitMessage.content.length == 0) return waitMessage.reply("Like you should have written a name, what are you saying??");

                    const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
                    let memberName = waitMessage.content;
                    let inputAge;

                    // Eğer kişi bot değilse yaş kontrolünü gerçekleştir
                    if (!member.user.bot) {

                        // Kullanıcının ismindeki yaşı çek
                        inputAge = memberName.match(Util.regex.fetchAge);

                        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
                        if (!inputAge && guildDatabase.register.isAgeRequired) return waitMessage.reply("Heyyy, wait there! You must enter a valid age when registering on this server!");

                        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
                        const ageLimit = guildDatabase.register.ageLimit ?? -1;
                        if (ageLimit > Number(inputAge?.[0])) return waitMessage.reply(`Heyyy, wait there! You cannot register anyone under the age of **${ageLimit}** on this server!`);

                        // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
                        if (hasGuildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
                            memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
                        }
                    }

                    memberName = Util.customMessages.registerName({
                        message: hasGuildCustomRegisterName,
                        memberName,
                        guildDatabase,
                        inputAge,
                        isBot: member.user.bot
                    });

                    // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
                    if (memberName.length > 32) return waitMessage.reply("Server name cannot exceed 32 characters! Please reduce the number of characters");

                    // Eğer kişinin ismi yazılan isimle aynıysa
                    if (member.nickname === memberName) return errorEmbed(`<@${memberId}>'s name is already the same as the name you wrote`);

                    // Kullanıcıyı düzenle
                    return await member.setNickname(memberName)
                        // Eğer düzenleme başarılıysa
                        .then(() => {
                            waitMessage.reply(`• I changed the name of <@${memberId}> to **${memberName}**. Be more careful next time <@${authorId}> :)`)

                            const userLogs = guildDatabase.userLogs[memberId] ??= [];

                            // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                            const NOW_TIME = Date.now();
                            userLogs.unshift({
                                type: "changeName",
                                newName: memberName,
                                authorId,
                                timestamp: NOW_TIME
                            });
                            return database.writeFile(guildDatabase, guildId);

                        }).catch(err => {
                            // Eğer yetki hatası verdiyse
                            if (err.code == RESTJSONErrorCodes.MissingPermissions) return waitMessage.reply(`• I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

                            console.log(err)
                            return waitMessage.reply(
                                `Ummm... There was an error, can you try again later??\n` +
                                `\`\`\`js\n` +
                                `${err}\`\`\``
                            );
                        })
                })
                // Eğer süre bittiyse bilgilendirme mesajı gönder
                .catch(_err => {
                    int.channel?.send(`⏰ <@${authorId}>, your time is up!`)

                    // Eğer mesajı atmadıysa database'den kullanıcının verisini sil
                    int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
                    delete guildDatabase.waitMessageCommands.buttonChangeName[memberId];
                    database.writeFile(guildDatabase, guildId);
                })
        }

        // Eğer bot yeniden başlatılmadan önce mesaj bekleniyorsa komutu tekrardan çalıştır
        if (registerDatas) {
            const {
                authorId,
                memberId
            } = registerDatas;

            // Hata çıkmaması için butonla ismini değiştirdiğini önbelleğe kaydet
            int.client.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);

            // Hata çıkmaması için önbelleği 35 saniye sonra sil
            setTimeout(() => {
                int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`);
            }, 35 * 1000);

            return changeName({
                memberId,
                member: await Util.fetchMemberForce(int, memberId),
                authorId
            });
        }

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Wellyyy... I think this person is no longer on the server, you stupid thing :(");

        // Kullanıcının ismini başka birisi daha değiştirmeye çalışıyorsa
        const isButtonChangeName = int.client.buttonChangeNameMember.get(`${guildId}.${memberId}`);
        if (isButtonChangeName) return errorEmbed(
            isButtonChangeName == authorId ?
                "Heyyy, wait there! You are currently already performing this registration process!" :
                "Heyyy, wait there! Someone else is currently registering!"
        );

        // Eğer sunucu sahibinin ismini değiştirmeye çalışıyorsa 
        if (memberId === guild.ownerId) return errorEmbed(`I can't change the server owner's name, you stupid thing :(`);

        // Eğer kendi ismini değiştirmeye çalışıyorsa ve yetkisi yoksa
        if (memberId === authorId && !intMember.permissions.has("ChangeNickname")) return errorEmbed(`You can't change your own name you stupid thing :(`);

        // Eğer etiketlediği kişinin rolünün sırası bottan yüksekse hata döndür
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= highestRole.position && memberId !== guildMe.id) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        // Eğer kendi rolünün üstünde bir kişiyi değiştirmeye çalışıyorsa
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId && memberId !== authorId) return errorEmbed(`The person you tagged is higher than your role, so you cannot change their name`)

        // Hata çıkmaması için butonla ismini değiştirdiğini ettiğini önbelleğe kaydet
        int.client.buttonChangeNameMember.set(`${guildId}.${memberId}`, authorId);
        return int.message.reply({
            content: `• 📝 <@${authorId}>, Please write **ONLY THE NAME** of the person named <@${memberId}> whose name you want to change`,
            files: [
                photoFile
            ]
        })
            // Eğer mesaj gönderildiyse önbelleğe kaydet
            .then(message => {
                guildDatabase.waitMessageCommands.changeName[memberId] = {
                    commandName: this.name,
                    authorId,
                    messageId: message.id,
                    channelId: int.channelId,
                    timestamp: Date.now(),
                }
                database.writeFile(guildDatabase, guildId);

                // Hata çıkmaması için önbelleği 35 saniye sonra sil
                setTimeout(() => {
                    int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
                }, 35 * 1000);

                return changeName({
                    memberId,
                    member,
                    authorId,
                });
            })
            // Eğer bir hata olurda mesajı atamazsa hiçbir şey yapma
            .catch(() => {
                int.client.buttonChangeNameMember.delete(`${guildId}.${memberId}`)
            })
    },
};