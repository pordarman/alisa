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
            `The authorized role that registers members on this server is __not set__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}authorized-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer önceki kaydı yoksa hata döndür
        const memberId = int.customId.split("-")[1];
        const memberPrevNames = guildDatabase.register.prevNamesOfMembers[memberId];
        if (!memberPrevNames) return errorEmbed(`Wellyy... You cannot use this command because this person has not registered on this server before :(`);

        const lastRegister = memberPrevNames[0];
        const type = lastRegister.gender;

        // Eğer önceki kaydı zamanınındaki seçenek ile şimdiki farklıya hata döndür
        if (
            (type == "normal" && guildDatabase.register.type != "normal") ||
            type != "normal" && guildDatabase.register.type != "gender"
        ) return hata(`Heyyy, wait there! This person was previously registered as **Member**, but currently my Registration type is __**Gender**__ so you cannot use this command!`);

        const guildMe = guild.members.me;

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        // Hangi cinsiyeti kayıt ediyorsa ona uygun kontroller yap
        let genderObject;
        switch (type) {
            case "boy":
                genderObject = {
                    string: "Boy",
                    stringLower: "boy"
                }
                break;

            case "girl":
                genderObject = {
                    string: "Girl",
                    stringLower: "girl"
                }
                break;

            default:
                genderObject = {
                    string: "Member",
                    stringLower: "member"
                }
                break;
        }

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const givenRoleIds = guildDatabase.register.roleIds[type]
        if (givenRoleIds.length == 0) return errorEmbed(
            `${genderObject.string} roles are __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}${genderObject.stringLower}-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        const unregisterRoleId = guildDatabase.register.roleIds.unregister
        if (!unregisterRoleId) return errorEmbed(
            `Unregister role is __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it you can type **${prefix}unregister-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        const registerChannel = guildDatabase.register.channelIds.register
        if (!registerChannel) return errorEmbed(
            `Recording channel is __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}registerchannel #channel** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        // Eğer kayıtlar kayıt kanalında yapmıyorsa hata döndür
        if (int.channelId !== registerChannel) return errorEmbed(`Please make registrations in the registration channel <#${registerChannel}>`);

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...givenRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`The rank of the role(s) named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Wellyyy... I think this person is no longer on the server, you stupid thing :(");

        // Kullanıcıyı hem butonla hem de komutla etmeye çalışırsa hata döndür
        const isButtonRegistering = int.client.buttonRegisterMember.get(`${guildId}.${memberId}`);
        if (isButtonRegistering) return errorEmbed(
            isButtonRegistering == authorId ?
                "Heyyy, wait there! You are currently already performing this registration process!" :
                "Heyyy, wait there! Someone else is currently registering!"
        );

        // Eğer kullanıcı kendi kendini kayıt etmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't record yourself, you stupid thing :)")

        // Eğer sunucu sahibini kayıt etmeye çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't register the server owner, you stupid thing :)");

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer kişi daha önceden kayıt olmuşsa hata döndür
        const girlRoleIds = guildDatabase.register.roleIds.girl;
        if (
            givenRoleIds.every(rolId => memberRolesSet.has(rolId)) ||
            (girlRoleIds.length && girlRoleIds.every(rolId => memberRolesSet.has(rolId)))
        ) return errorEmbed("The person you tagged is already registered");

        // Eğer kişide kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const guildTag = guildDatabase.register.tag;
        let memberName = lastRegister.name;

        // Kullanıcının ismindeki yaşı çek
        const inputAge = memberName.match(Util.regex.fetchAge);

        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
        if (!inputAge && guildDatabase.register.isAgeRequired) return int.reply({
            content: "No age was entered in this user's previous registration and the age requirement is active on this server! Please register the user normally",
            ephemeral: true
        });

        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
        const ageLimit = guildDatabase.register.ageLimit ?? -1;
        if (ageLimit > Number(inputAge?.[0])) return int.reply({
            content: `In this user's previous registration, his age was entered as **${inputAge?.[0]}**, but now the server's age limit is **${ageLimit}**! Please register the user normally`,
            ephemeral: true
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return int.reply({
            content: "Username exceeds 32 characters in length! Please register the user normally",
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

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                userLogs.unshift({
                    type: "register",
                    gender: type,
                    authorId,
                    timestamp: NOW_TIME
                });

                const totalRegisterCount = authorData.countables.total;
                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, language);
                const clientAvatar = int.client.user.displayAvatarURL();
                const memberAvatar = member.displayAvatarURL();
                const allButtons = new ActionRowBuilder()
                    .addComponents(
                        // İsmini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("Change name")
                            .setEmoji("📝")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId(`changeName-${memberId}`),

                        // Cinsiyetini değiştirme butonu
                        new ButtonBuilder()
                            .setLabel("Change gender")
                            .setEmoji("♻️")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`changeGender-${memberId}`),

                        // Kayıtsıza atma butonu
                        new ButtonBuilder()
                            .setLabel("Kick unregister")
                            .setEmoji("⚒️")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`kickUnregistered-${memberId}`),
                    );
                const recreateName = Util.recreateString(memberName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Recorded",
                        iconURL: guild.iconURL()
                    })
                    .setDescription(
                        `• Since <@${memberId}> has been registered on this server **${memberPrevNames.length}** times before, registration points were not added (**${prefix}names ${memberId}**)`
                    )
                    .addFields(
                        {
                            name: "`Registrar`",
                            value: `> 👤 **Name:** <@${authorId}>\n` +
                                `> 🔰 **Rank:** ${Util.getUserRank(totalRegisterCount, language) || "No rank"}\n` +
                                `> 📈 **Register count:** ${toHumanizeRegisterCount}`,
                            inline: true
                        },
                        {
                            name: "`Registered`",
                            value: `> 👤 **Name:** <@${memberId}>\n` +
                                `> 📝 **New name:** ${recreateName}\n` +
                                `> ${EMOJIS.role} **Given role(s):** ${givenRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: "Alisa Register system",
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
                                                .setTitle(`Welcome aboard ${recreateMemberName} ${EMOJIS.hi}`)
                                                .setDescription(resultMessage)
                                                .addFields(
                                                    {
                                                        name: "Registration information",
                                                        value: `**• Registered person:** ${recreateMemberName}\n` +
                                                            `**• Registrar:** ${recreateAuthorName}`
                                                    }
                                                )
                                                .setImage(customAfterLoginMessage.image ?? null)
                                                .setThumbnail(memberAvatar)
                                                .setColor(`#${colors[type]}`)
                                                .setFooter({
                                                    text: `Number of registrations of the official: ${toHumanizeRegisterCount}`
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
                                .setTitle(`Welcome aboard ${recreateMemberName} ${EMOJIS.hi}`)
                                .setDescription(`${EMOJIS.crazy} **• <@${memberId}> joined us with the roles ${givenRolesString}**`)
                                .addFields(
                                    {
                                        name: "Registration information",
                                        value: `**• Registered person:** ${recreateMemberName}\n` +
                                            `**• Registrar:** ${recreateAuthorName}`
                                    }
                                )
                                .setThumbnail(memberAvatar)
                                .setColor(`#${colors[type]}`)
                                .setFooter({
                                    text: `Number of registrations of the official: ${toHumanizeRegisterCount}`
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
                                `**• A total of ${Util.toHumanize(guildDatabase.register.lastRegisters.length, language)} people have been registered on the server!**\n\n` +
                                `🧰 **REGISTERING AUTHORITY**\n` +
                                `**• Name:** <@${authorId}> - ${recreateAuthorName}\n` +
                                `**• Register count:** ${toHumanizeRegisterCount} - (${EMOJIS[type]} ${Util.toHumanize(authorData.countables[type] || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)})\n` +
                                `**• How did the official record it:** Using button\n` +
                                `**• Registration time:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **REGISTERED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${recreateMemberName}\n` +
                                `**• Role taken:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "The member had no unregistered role"}\n` +
                                `**• Given role(s):** ${givenRolesString}\n` +
                                `**• New name:** ${recreateName}\n` +
                                `**• Registration type:** ${genderObject.string} ${EMOJIS[type]}\n` +
                                `**• Has the member been registered before:** ${memberPrevNames.length > 0 ? `Yes ${memberPrevNames.length} times` : "No"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors[type]}`)
                            .setFooter({
                                text: `Alisa Log system`,
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
                    content: "• Wellyyy... I think this person is no longer on the server, you stupid thing :(",
                    ephemeral: true
                });

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `• I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return int.reply({
                    content: `Ummm... There was an error, can you try again later??\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};