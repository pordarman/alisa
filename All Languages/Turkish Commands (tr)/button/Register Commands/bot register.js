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
    name: "registerBot", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Botu bot olarak kayıt eder", // Butonun açıklaması
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
        language
    }) {

        const prefix = guildDatabase.prefix;
        const intMember = int.member;

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

        const guildMe = guild.members.me;

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const botRoleIds = guildDatabase.register.roleIds.bot
        if (botRoleIds.length == 0) return errorEmbed(
            `Bu sunucuda herhangi bir bot rolü __ayarlanmamış__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}bot-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
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

        // Botta botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...botRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`[${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`)

        const [_, memberId] = customId.split("-");
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Şeyyyy... Sanırım bu bot artık sunucuda değil şapşik şey seni :(");

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer bot daha önceden kayıt olmuşsa hata döndür
        if (
            botRoleIds.every(rolId => memberRolesSet.has(rolId))
        ) return errorEmbed("Etiketlediğiniz bot zaten daha önceden kayıt edilmiş");

        // Eğer botta kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const memberName = Util.customMessages.registerName({
            message: guildDatabase.register.customNames.registerBot,
            memberName: member.user.displayName,
            guildDatabase,
            inputAge: null,
            isBot: true
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return int.message.reply(`• <@${authorId}>, Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz`);

        // Botun rollerini düzenle
        const expectRoles = new Set([...botRoleIds, unregisterRoleId]);
        const memberRoles = [];
        for (let i = 0; i < member["_roles"].length; ++i) {
            const roleId = member["_roles"][i];

            // Eğer rol hariç tutulan rollerden birisiyse döngünü geç
            if (expectRoles.has(roleId)) continue;

            memberRoles.push(roleId);
        }

        // Ve en sonunda ise botu düzenle
        await member.edit({
            roles: [
                ...botRoleIds,
                ...memberRoles
            ],
            nick: memberName
        })
            // Eğer botu düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const botRolesString = botRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
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

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                userLogs.unshift({
                    type: "register",
                    gender: "bot",
                    authorId,
                    timestamp: NOW_TIME
                });

                // Kayıt ettiğimiz kişi bot olduğu için sadece kayıt sayısını arttır
                authorData.countables.bot += 1;

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
                    );
                const recreateName = Util.recreateString(memberName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Kayıt yapıldı",
                        iconURL: guild.iconURL()
                    })
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
                                `> ${EMOJIS.role} **Verilen rol(ler):** ${botRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: `${int.client.user.username} Kayıt sistemi`,
                        iconURL: clientAvatar
                    })
                    .setColor(`#${colors.bot}`)
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

                // Database'ye kaydedilecek son veriler
                guildDatabase.register.lastRegisters.unshift({
                    gender: "bot",
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
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(int.user.displayName)}\n` +
                                `**• Kayıt sayısı:** ${toHumanizeRegisterCount} - (${guildDatabase.register.type == "normal" ?
                                    `${EMOJIS.normal} ${authorData.countables.normal || 0}` :
                                    `${EMOJIS.boy} ${Util.toHumanize(authorData.countables.boy || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)}`
                                })\n` +
                                `**• Nasıl kayıt etti:** Buton kullanarak\n` +
                                `**• Kayıt zamanı:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **KAYIT EDİLEN BOT**\n` +
                                `**• Adı:** <@${memberId}> - ${recreateMemberName}\n` +
                                `**• Alınan rol:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "Botta kayıtsız rolü yoktu"}\n` +
                                `**• Verilen rol(ler):** ${botRolesString}\n` +
                                `**• Yeni ismi:** ${recreateName}\n` +
                                `**• Kayıt şekli:** Bot ${EMOJIS.bot}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors.bot}`)
                            .setFooter({
                                text: `${int.client.user.username} Log sistemi`,
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
                    roles: botRolesString,
                    timestamp: NOW_TIME
                };
                authorData.firstRegister ||= lastAndFirstRegisterObject;
                authorData.lastRegister = lastAndFirstRegisterObject;

                memberPrevNames.unshift({
                    gender: "bot",
                    name: memberName,
                    roles: botRolesString,
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
                guildData.bot += 1;

                // En sonunda ise dosyaları kaydet
                database.writeFile(allRegistersFile, "all registers", "other");
                return database.writeFile(guildDatabase, guildId);
            })
            // Eğer hata çıktıysa kullanıcıya bildir
            .catch(async err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return int.reply({
                    content: "• Şeyyyy... Sanırım bu bot artık sunucuda değil şapşik şey seni :(",
                    ephemeral: true
                });

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `• <@${memberId}> adlı botun ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    ephemeral: true,
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