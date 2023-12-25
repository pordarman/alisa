"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes
} = require("discord.js");
const {
    EMOJIS,
    colors
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "girl", // Komutun ismi
    id: "kız", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "g",
        "girl",
        "female"
    ],
    description: "Registers the person as a girl", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>girl <@user or User ID> <New name>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildMePermissions,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Önce yetkili rolü var mı onu kontrol ediyoruz, eğer yoksa hata, eğer varsa kişide rol var mı onu kontrol ediyoruz
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (!authorizedRoleId) return errorEmbed(
            `The authorized role that registers members on this server is __not set__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}authorized-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(
            `My recording type is set to __**Normal Registration**__! Please use \`${prefix}member\` command` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• If you want to register as male or female, you can write **${prefix}registertype gender**` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const girlRoleIds = guildDatabase.register.roleIds.girl;
        if (girlRoleIds.length == 0) return errorEmbed(
            `Girl roles are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}girl-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        const unregisterRoleId = guildDatabase.register.roleIds.unregister
        if (!unregisterRoleId) return errorEmbed(
            `Unregister role is __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it you can type **${prefix}unregister-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );
        const registerChannel = guildDatabase.register.channelIds.register
        if (!registerChannel) return errorEmbed(
            `Recording channel is __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}registerchannel #channel** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        // Eğer kayıtlar kayıt kanalında yapmıyorsa hata döndür
        if (msg.channelId !== registerChannel) return errorEmbed(`Please make registrations in the registration channel <#${registerChannel}>`);

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...girlRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`The rank of the role(s) named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

        const messageContent = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, messageContent);
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        // Eğer etiketlenen kişi bot ise hata döndür
        if (member.user.bot) {
            if (guildDatabase.register.roleIds.bot) return errorEmbed(
                `You can't register a bot as girl, you stupid thing\n\n` +
                `• If you want to register the bot, you can write **${prefix}bot ${member.id}**`
            );

            if (msgMember.permissions.has("Administrator")) return errorEmbed(
                `You can't register a bot as girl, you stupid thing\n\n` +
                `• If you want to register the bot, you must first set a bot role with **${prefix}bot-role**`
            );

            return errorEmbed(
                `You can't register a bot as girl, you stupid thing\n\n` +
                `• If you want to register the bot, ask the authorities to set up a bot role`
            );
        }

        const memberId = member.id;

        // Kullanıcıyı hem butonla hem de komutla etmeye çalışırsa hata döndür
        const isButtonRegistering = msg.client.buttonRegisterMember.get(`${guildId}.${memberId}`);
        if (isButtonRegistering) return errorEmbed(
            isButtonRegistering == authorId ?
                "Heyyy, wait there! You cannot register with both button and command at the same time!" :
                "Heyyy, wait there! Someone else is currently registering!"
        );

        // Eğer kullanıcı kendi kendini kayıt etmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't record yourself, you stupid thing :)")

        // Eğer sunucu sahibini kayıt etmeye çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't register the server owner, you stupid thing :)");

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer kişi daha önceden kayıt olmuşsa hata döndür
        const boyRoleIds = guildDatabase.register.roleIds.boy
        if (
            girlRoleIds.every(rolId => memberRolesSet.has(rolId)) ||
            (boyRoleIds.length && boyRoleIds.every(rolId => memberRolesSet.has(rolId)))
        ) return errorEmbed("The person you tagged is already registered");

        // Eğer kişide kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const guildTag = guildDatabase.register.tag;
        const hasGuildCustomRegisterName = guildDatabase.register.customNames.register;
        let memberName = messageContent.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").trim();

        // Eğer kullanıcının ismini girmemişse hata döndür
        if (!memberName) return errorEmbed(
            `Please enter the name of the person you will register\n\n` +
            `**Example**\n` +
            `• ${prefix}girl ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}girl <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}girl Fearless Crazy 20 <@${memberId}>`
        );

        // Kullanıcının ismindeki yaşı çek
        let inputAge = memberName.match(Util.regex.fetchAge);

        // Eğer yaş girilmemişse ve yaş zorunluluğu varsa hata döndür
        if (!inputAge && guildDatabase.register.isAgeRequired) return errorEmbed("Heyyy, wait there! You must enter a valid age when registering on this server!");

        // Eğer yaş sınırı varsa ve yaşı sınırın altındaysa hata döndür
        const ageLimit = guildDatabase.register.ageLimit ?? -1;
        if (ageLimit > Number(inputAge?.[0])) return errorEmbed(`Heyyy, wait there! You cannot register anyone under the age of **${ageLimit}** on this server!`);

        // Eğer özel olarak yaş diye bir değişken varsa yaşı <yaş> olarak yerden çıkar
        if (hasGuildCustomRegisterName.search(/<(ya[sş]|age)>/) != -1) {
            memberName = memberName.replace(inputAge?.[0], "").replace(/ +/g, " ");
        }
        memberName = Util.customMessages.registerName({
            message: hasGuildCustomRegisterName,
            memberName,
            guildDatabase,
            inputAge,
            isBot: false
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed("Server name cannot exceed 32 characters! Please reduce the number of characters");

        // Kullanıcının rollerini düzenle
        const expectRoles = new Set([...girlRoleIds, unregisterRoleId]);
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
                ...girlRoleIds,
                ...memberRoles
            ],
            nick: memberName
        })
            // Eğer kullanıcı düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const girlRolesString = girlRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
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
                    gender: "girl",
                    authorId,
                    timestamp: NOW_TIME
                });

                // Eğer kişi daha önceden kayıt olmuşsa kayıt sayısını arttırma
                if (memberPrevNames.length != 0) {
                    embedDescription = `• Since <@${memberId}> has been registered on this server **${memberPrevNames.length}** times before, registration points were not added (**${prefix}names ${memberId}**)`
                } else {
                    authorData.countables.girl += 1
                    authorData.countables.total += 1;
                    const newRank = Util.getUserRank(authorData.countables.total, language);

                    // Eğer rankı atladıysa yeni rankını embed mesajda göster
                    if (newRank) {
                        embedDescription = `• <@${authorId}> Congratulations, you have been promoted to **${newRank}**! 🎉`
                    }
                }

                const totalRegisterCount = authorData.countables.total;
                const toHumanizeRegisterCount = Util.toHumanize(totalRegisterCount, language);
                const clientAvatar = msg.client.user.displayAvatarURL();
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
                    .setDescription(embedDescription)
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
                                `> ${EMOJIS.role} **Given role(s):** ${girlRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: "Alisa Register system",
                        iconURL: clientAvatar
                    })
                    .setColor(`#${colors.girl}`)
                    .setTimestamp();

                msg.reply({
                    embeds: [
                        embed
                    ],
                    components: [
                        allButtons
                    ]
                });

                const recreateMemberName = Util.recreateString(member.user.displayName);
                const recreateAuthorName = Util.recreateString(msg.author.displayName);

                const afterRegisterChannelId = guildDatabase.register.channelIds.afterRegister;

                if (afterRegisterChannelId) {
                    const allMessages = Util.afterRegisterMessages[language].girl;
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
                                givenRolesString: girlRolesString,
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
                                                .setColor(`#${colors.girl}`)
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
                                .setDescription(`${EMOJIS.crazy} **• <@${memberId}> joined us with the roles ${girlRolesString}**`)
                                .addFields(
                                    {
                                        name: "Registration information",
                                        value: `**• Registered person:** ${recreateMemberName}\n` +
                                            `**• Registrar:** ${recreateAuthorName}`
                                    }
                                )
                                .setThumbnail(memberAvatar)
                                .setColor(`#${colors.girl}`)
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
                    gender: "girl",
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
                                `**• Register count:** ${toHumanizeRegisterCount} - (${EMOJIS.boy} ${Util.toHumanize(authorData.countables.boy || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)})\n` +
                                `**• How did the official record it:** Using command\n` +
                                `**• Registration time:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **REGISTERED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${recreateMemberName}\n` +
                                `**• Role taken:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "The member had no unregistered role"}\n` +
                                `**• Given role(s):** ${girlRolesString}\n` +
                                `**• New name:** ${recreateName}\n` +
                                `**• Registration type:** Girl ${EMOJIS.girl}\n` +
                                `**• Has the member been registered before:** ${memberPrevNames.length > 0 ? `Yes ${memberPrevNames.length} times` : "No"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors.girl}`)
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
                    roles: girlRolesString,
                    timestamp: NOW_TIME
                };
                authorData.firstRegister ||= lastAndFirstRegisterObject;
                authorData.lastRegister = lastAndFirstRegisterObject;

                memberPrevNames.unshift({
                    gender: "girl",
                    name: memberName,
                    roles: girlRolesString,
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
                guildData.girl += 1;
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
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                console.log(err);
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};