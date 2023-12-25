"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");
const {
    EMOJIS,
    colors
} = require("../../../../settings.json");


module.exports = {
    name: "registerAgain", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı önceki verilerle yeniden kayıt eder", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        alisa,
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const intMember = int.member;
        const prefix = guildDatabase.prefix;

        // Önce yetkili rolü var mı onu kontrol ediyoruz, eğer yoksa hata, eğer varsa kişide rol var mı onu kontrol ediyoruz
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (!authorizedRoleId) return errorEmbed(
            `Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}kayıtayar aç** yazabilirsiniz` :
                "")
        );

        // Eğer önceki kaydı yoksa hata döndür
        const memberId = int.customId.split("-")[1];
        const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId];
        if (!memberPrevNames) return errorEmbed(`Şeyyy... Bu kişi bu sunucuda daha önceden kayıt olmadığı için bu komutu kullanamazsın :(`);

        const lastRegister = memberPrevNames[0];
        const type = lastRegister.gender;

        // Eğer önceki kaydı zamanınındaki seçenek ile şimdiki farklıya hata döndür
        if (
            (type == "normal" && guildDatabase.register.type != "normal") ||
            type != "normal" && guildDatabase.register.type != "gender"
        ) return hata(`Heyyy dur bakalım orada! Bu kişi daha önceden **Üye** olarak kayıt edilmiş ama şu anda Kayıt türüm __**Cinsiyet**__ olduğu için bu komutu kullanamazsın!`);

        const guildMe = guild.members.me;

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        // Hangi cinsiyeti kayıt ediyorsa ona uygun kontroller yap
        let genderObject;
        switch (type) {
            case "boy":
                genderObject = {
                    string: "Erkek",
                    stringLower: "erkek"
                }
                break;

            case "girl":
                genderObject = {
                    string: "Kız",
                    stringLower: "kız"
                }
                break;

            default:
                genderObject = {
                    string: "Üye",
                    stringLower: "üye"
                }
                break;
        }

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const givenRoleIds = guildDatabase.register.roleIds[type]
        if (givenRoleIds.length == 0) return errorEmbed(
            `Bu sunucuda herhangi bir ${genderObject.stringLower} rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}${genderObject.stringLower}-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        const unregisterRoleId = guildDatabase.register.roleIds.unregister
        if (!unregisterRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );
        const registerChannel = guildDatabase.register.channelIds.register
        if (!registerChannel) return errorEmbed(
            `Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}kayıtkanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
        );

        // Eğer kayıtlar kayıt kanalında yapmıyorsa hata döndür
        if (int.channelId !== registerChannel) return errorEmbed(`Lütfen kayıtları kayıt kanalı olan <#${registerChannel}> kanalında yapınız`);

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...givenRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`[${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(");

        // Kullanıcıyı hem butonla hem de komutla etmeye çalışırsa hata döndür
        const isButtonRegistering = int.client.buttonRegisterMember.get(`${guildId}.${memberId}`);
        if (isButtonRegistering) return errorEmbed(
            isButtonRegistering == authorId ?
                "Heyyy dur bakalım orada! Şu anda zaten bu kayıt işlemini gerçekleştiriyorsun!" :
                "Heyyy dur bakalım orada! Şu anda başkası kayıt işlemini gerçekleştiriyor!"
        );

        // Eğer kullanıcı kendi kendini kayıt etmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("Kendi kendini kayıt edemezsin şapşik şey seni :)")

        // Eğer sunucu sahibini kayıt etmeye çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini kayıt edemezsin şapşik şey seni :)");

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer kişi daha önceden kayıt olmuşsa hata döndür
        const girlRoleIds = guildDatabase.register.roleIds.girl;
        if (
            givenRoleIds.every(rolId => memberRolesSet.has(rolId)) ||
            (girlRoleIds.length && girlRoleIds.every(rolId => memberRolesSet.has(rolId)))
        ) return errorEmbed("Etiketlediğiniz kişi zaten daha önceden kayıt edilmiş");

        // Eğer kişide kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const guildTag = guildDatabase.register.tag;
        const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
        let memberName = lastRegister.name;

        // Kullanıcının ismindeki yaşı çek
        const inputAge = memberName.match(Util.regex.fetchAge);

        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
        if (!inputAge && guildDatabase.register.isAgeRequired) return int.reply({
            content: "Bu kullanıcının önceki kaydında yaş girilmemiş ve bu sunucuda yaş zorunluluğu aktif durumda! Lütfen kullanıcıyı normal kayıt ediniz",
            ephemeral: true
        });

        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
        const ageLimit = guildDatabase.register.ageLimit ?? -1;
        if (ageLimit > Number(inputAge?.[0])) return int.reply({
            content: `Bu kullanıcının önceki kaydında yaşı **${inputAge?.[0]}** girilmiş fakat şimdi sunucunun yaş limiti **${ageLimit}**! Lütfen kullanıcıyı normal kayıt ediniz`,
            ephemeral: true
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return int.reply({
            content: "Kullacının uzunluğu 32 karakteri geçiyor! Lütfen kullanıcıyı normal kayıt ediniz",
            ephemeral: true
        });

        // Kullanıcının rollerini düzenle
        const expectRoles = new Set([...givenRoleIds, unregisterRoleId]);
        const memberRoles = [];
        for (let i = 0; i < member["_roles"].length; ++i) {
            const roleId = member["_roles"][i];

            // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
            if (expectRoles.has(roleId)) continue;

            memberRoles.push(roleId);
        }

        // Ve en sonunda ise kullanıcıyı düzenle
        await member.edit({
            roles: [
                ...givenRoleIds,
                ...memberRoles
            ],
            nick: memberName
        })
            // Eğer kullanıcı düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const givenRolesString = givenRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
                const authorData = guildDatabase.register.authorizedInfos[authorId] ??= {
                    countables: {
                        girl: 0,
                        boy: 0,
                        normal: 0,
                        bot: 0,
                        total: 0
                    }
                };
                const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId] ??= [];
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                let embedDescription = null;

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                userLogs.unshift({
                    type: "register",
                    gender: type,
                    authorId,
                    timestamp: NOW_TIME
                });

                // Eğer kişi daha önceden kayıt olmuşsa kayıt sayısını arttırma
                if (memberPrevNames.length != 0) {
                    embedDescription = `• <@${memberId}> adlı kişi bu sunucuda daha önceden **${memberPrevNames.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberId}**)`
                } else {
                    authorData.countables[type] += 1
                    authorData.countables.total += 1;
                    const newRank = Util.getUserRank(authorData.countables.total, language);

                    // Eğer rankı atladıysa yeni rankını embed mesajda göster
                    if (newRank) {
                        embedDescription = `• <@${authorId}> Tebrikler **${newRank}** kümesine terfi ettin! 🎉`
                    }
                }

                const totalRegisterCount = authorData.countables.total;
                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, language);
                const clientAvatar = int.client.user.displayAvatarURL();
                const memberAvatar = member.displayAvatarURL();
                const allButtons = new ActionRowBuilder()
                    .addComponents(
                        // İsmini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("İsmini değiştir")
                            .setEmoji("📝")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(`changeName-${memberId}`),

                        // Cinsiyetini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("Cinsiyetini değiştir")
                            .setEmoji("♻️")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`changeGender-${memberId}`),

                        // Kayıtsıza atma butonu
                        new ButtonBuilder()
                            .setLabel("Kayıtsıza at")
                            .setEmoji("⚒️")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`kickUnregistered-${memberId}`),
                    );
                const recreateName = Util.recreateString(memberName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Kayıt yapıldı",
                        iconURL: guild.iconURL()
                    })
                    .setDescription(embedDescription)
                    .addFields(
                        {
                            name: "`Kayıt yapan`",
                            value: `> 👤 **Adı:** <@${authorId}>\n` +
                                `> 🔰 **Rankı:** ${Util.getUserRank(totalRegisterCount, language) || "Rankı yok"}\n` +
                                `> 📈 **Kayıt sayısı:** ${toHumanizeRegisterCount}`,
                            inline: true
                        },
                        {
                            name: "`Kayıt edilen`",
                            value: `> 👤 **Adı:** <@${memberId}>\n` +
                                `> 📝 **Yeni ismi:** ${recreateName}\n` +
                                `> ${EMOJIS.role} **Verilen rol(ler):** ${givenRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: "Alisa Kayıt sistemi",
                        iconURL: clientAvatar
                    })
                    .setColor(`#${colors[type]}`)
                    .setTimestamp();

                int.message.reply({
                    embeds: [
                        embed
                    ],
                    components: [
                        allButtons
                    ]
                });

                const recreateMemberName = Util.recreateString(member.user.displayName);
                const recreateAuthorName = Util.recreateString(int.user.displayName);

                const afterRegisterChannelId = guildDatabase.register.channelIds.afterRegister;

                if (afterRegisterChannelId) {
                    const allMessages = Util.afterRegisterMessages[language][type];
                    const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)].replace("<m>", `<@${memberId}>`);
                    const channel = guild.channels.cache.get(afterRegisterChannelId);
                    // Eğer kanal varsa alttaki kodları çalıştır
                    if (channel) {
                        const customAfterLoginMessage = guildDatabase.register.customAfterRegister;

                        // Eğer özel mesaj ayarlanmışsa ayarlanan mesajı düzenle ve gönder
                        if (customAfterLoginMessage.content.length > 0) {

                            // Mesajı düzenle
                            const resultMessage = Util.customMessages.afterRegisterMessage({
                                message: customAfterLoginMessage.content,
                                language,
                                memberId,
                                memberCount: guild.memberCount,
                                authorId,
                                recreateAuthorName,
                                recreateMemberName,
                                givenRolesString,
                                guildTag,
                                toHumanizeRegisterCount
                            });

                            // Mesajı gönder
                            channel.send(
                                customAfterLoginMessage.isEmbed ?
                                    // Eğer mesaj embed olarak gönderilecekse
                                    {
                                        content: randomMessage,
                                        embeds: [
                                            new EmbedBuilder()
                                                .setTitle(`Aramıza hoşgeldin ${recreateMemberName} ${EMOJIS.hi}`)
                                                .setDescription(resultMessage)
                                                .addFields(
                                                    {
                                                        name: "Kaydın bilgileri",
                                                        value: `**• Kayıt edilen kişi:** ${recreateMemberName}\n` +
                                                            `**• Kayıt eden yetkili:** ${recreateAuthorName}`
                                                    }
                                                )
                                                .setImage(customAfterLoginMessage.image ?? null)
                                                .setThumbnail(memberAvatar)
                                                .setColor(`#${colors[type]}`)
                                                .setFooter({
                                                    text: `Yetkilinin kayıt sayısı: ${toHumanizeRegisterCount}`
                                                })
                                        ]
                                    } :
                                    // Eğer mesaj normal gönderilecekse
                                    {

                                        content: resultMessage,
                                        files: customAfterLoginMessage.image ?
                                            [new AttachmentBuilder(customAfterLoginMessage.image)] :
                                            [],
                                        allowedMentions: {
                                            users: [
                                                memberId
                                            ],
                                            roles: []
                                        }
                                    }
                            );

                        }
                        // Eğer özel mesaj ayarlanmamışsa mesajı gönder
                        else {
                            const embed = new EmbedBuilder()
                                .setTitle(`Aramıza hoşgeldin ${recreateMemberName} ${EMOJIS.hi}`)
                                .setDescription(`${EMOJIS.crazy} **• <@${memberId}> aramıza ${givenRolesString} rolleriyle katıldı**`)
                                .addFields(
                                    {
                                        name: "Kaydın bilgileri",
                                        value: `**• Kayıt edilen kişi:** ${recreateMemberName}\n` +
                                            `**• Kayıt eden yetkili:** ${recreateAuthorName}`
                                    }
                                )
                                .setThumbnail(memberAvatar)
                                .setColor(`#${colors[type]}`)
                                .setFooter({
                                    text: `Yetkilinin kayıt sayısı: ${toHumanizeRegisterCount}`
                                });

                            // Mesajı gönder
                            channel.send({
                                content: randomMessage,
                                embeds: [
                                    embed
                                ],
                            });
                        }

                    }
                }

                // Database'ye kaydedilecek son veriler
                guildDatabase.register.lastRegisters.unshift({
                    gender: type,
                    authorId,
                    memberId,
                    isAgainRegister: memberPrevNames.length > 0,
                    timestamp: NOW_TIME
                })

                // Log kanalına mesaj atılacak mesaj
                const logChannelId = guildDatabase.register.channelIds.log;
                if (logChannelId) {
                    const logChannel = guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const NOW_TIME_IN_SECOND = Math.round(NOW_TIME / 1000);
                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**• Sunucuda toplam ${Util.toHumanize(guildDatabase.register.lastRegisters.length, language)} kişi kayıt edildi!**\n\n` +
                                `🧰 **KAYIT EDEN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${recreateAuthorName}\n` +
                                `**• Kayıt sayısı:** ${toHumanizeRegisterCount} - (${EMOJIS[type]} ${Util.toHumanize(authorData.countables[type] || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)})\n` +
                                `**• Nasıl kayıt etti:** Buton kullanarak\n` +
                                `**• Kayıt zamanı:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **KAYIT EDİLEN ÜYE**\n` +
                                `**• Adı:** <@${memberId}> - ${recreateMemberName}\n` +
                                `**• Alınan rol:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "Üyede kayıtsız rolü yoktu"}\n` +
                                `**• Verilen rol(ler):** ${givenRolesString}\n` +
                                `**• Yeni ismi:** ${recreateName}\n` +
                                `**• Kayıt şekli:** ${genderObject.string} ${EMOJIS[type]}\n` +
                                `**• Üye daha önceden kayıt edilmiş mi:** ${memberPrevNames.length > 0 ? `Evet ${memberPrevNames.length} kere` : "Hayır"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors[type]}`)
                            .setFooter({
                                text: `Alisa Log sistemi`,
                                iconURL: clientAvatar
                            })
                            .setTimestamp()

                        logChannel.send({
                            embeds: [
                                embed
                            ]
                        })
                    }
                }

                const lastAndFirstRegisterObject = {
                    memberId,
                    roles: givenRolesString,
                    timestamp: NOW_TIME
                };
                authorData.firstRegister ||= lastAndFirstRegisterObject;
                authorData.lastRegister = lastAndFirstRegisterObject;

                memberPrevNames.unshift({
                    gender: type,
                    name: memberName,
                    roles: givenRolesString,
                    authorId,
                    timestamp: NOW_TIME
                });


                // Kaydı kaydet
                const allRegistersFile = database.getFile("all registers", "other");
                const guildData = allRegistersFile[guildId] ??= {
                    boy: 0,
                    girl: 0,
                    normal: 0,
                    bot: 0,
                    total: 0
                }
                guildData[type] += 1;
                guildData.total += 1;
                alisa.registersCount.nowTotal += 1;

                // Eğer kayıt 100'ün katıysa database'ye kaydet
                if (alisa.registersCount.nowTotal % 100 == 0) {
                    alisa.registersCount[alisa.registersCount.nowTotal] = NOW_TIME
                }

                // En sonunda ise dosyaları kaydet
                database.writeFile(alisa, "alisa", "other");
                database.writeFile(allRegistersFile, "all registers", "other");
                return database.writeFile(guildDatabase, guildId);
            })
            // Eğer hata çıktıysa kullanıcıya bildir
            .catch(async err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return int.reply({
                    content: "• Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(",
                    ephemeral: true
                });

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `• <@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return int.reply({
                    content: `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};