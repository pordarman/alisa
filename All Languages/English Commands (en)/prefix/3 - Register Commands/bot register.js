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
    name: "bot", // Komutun ismi
    id: "bot", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "bot",
        "b",
    ],
    description: "Registers the person as a bot", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>bot <@bot or Bot ID> [New name]", // Komutun kullanım şekli
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
        language,
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

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        // Roller veya kanallar ayarlanmamışsa hata döndür
        const botRoleIds = guildDatabase.register.roleIds.bot
        if (botRoleIds.length == 0) return errorEmbed(
            `Bot roles are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}bot-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
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

        // Botta botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...botRoleIds, unregisterRoleId].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(`The rank of the role(s) named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

        const messageContent = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, messageContent);
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the bot you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag a bot or enter its ID"
        );

        // Eğer etiketlenen kişi bot değilse hata döndür
        if (!member.user.bot) return errorEmbed(
            `You can't register someone as a bot, you stupid thing\n\n` +
            `• If you want to register a person! Please use **${guildDatabase.register.type == "normal" ?
                `${prefix}member` :
                `${prefix}boy **or** ${prefix}girl`
            }** commands`
        );

        const memberId = member.id;

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Eğer bot daha önceden kayıt olmuşsa hata döndür
        if (
            botRoleIds.every(rolId => memberRolesSet.has(rolId))
        ) return errorEmbed("The bot you tagged has already been registered");

        // Eğer botta kayıtsız rolü yoksa hata döndürmek yerine kayıt etmeye devam et
        let isMemberHasUnregisterRole = true;
        if (!memberRolesSet.has(unregisterRoleId)) isMemberHasUnregisterRole = false;

        const hasGuildCustomRegisterName = guildDatabase.register.customNames.registerBot;
        let memberName = messageContent.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").trim() || member.user.displayName;

        memberName = Util.customMessages.registerName({
            message: hasGuildCustomRegisterName,
            memberName,
            guildDatabase,
            inputAge: null,
            isBot: true,
        });

        // Eğer ismi ismin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (memberName.length > 32) return errorEmbed("Server name cannot exceed 32 characters! Please reduce the number of characters");

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
            // Eğer bot düzgün bir şekilde kayıt edildiyse database'ye kaydet
            .then(async () => {
                const NOW_TIME = Date.now();
                const botRolesString = botRoleIds.map(roleId => `<@&${roleId}>`).join(", ");
                const authorData = guildDatabase.register.authorizedInfos[authorId] ??= {
                    countables: {
                        girl: 0,
                        bot: 0,
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
                    );
                const recreateName = Util.recreateString(memberName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Recorded",
                        iconURL: guild.iconURL()
                    })
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
                                `> ${EMOJIS.role} **Given role(s):** ${botRolesString}`,
                            inline: true
                        }
                    )
                    .setThumbnail(memberAvatar)
                    .setFooter({
                        text: `${msg.client.user.username} Register system`,
                        iconURL: clientAvatar
                    })
                    .setColor(`#${colors.bot}`)
                    .setTimestamp();

                msg.reply({
                    embeds: [
                        embed
                    ],
                    components: [
                        allButtons
                    ]
                });

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
                                `**• A total of ${Util.toHumanize(guildDatabase.register.lastRegisters.length, language)} people have been registered on the server!**\n\n` +
                                `🧰 **REGISTERING AUTHORITY**\n` +
                                `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                                `**• Register count:** ${toHumanizeRegisterCount} - (${guildDatabase.register.type == "normal" ?
                                    `${EMOJIS.normal} ${authorData.countables.normal || 0}` :
                                    `${EMOJIS.boy} ${Util.toHumanize(authorData.countables.boy || 0, language)}, ${EMOJIS.girl} ${Util.toHumanize(authorData.countables.girl || 0, language)}`
                                })\n` +
                                `**• How did the official record it:** Using command\n` +
                                `**• Registration time:** <t:${NOW_TIME_IN_SECOND}:F> - <t:${NOW_TIME_IN_SECOND}:R>\n\n` +
                                `👤 **REGISTERED BOT**\n` +
                                `**• Name:** <@${memberId}> - ${recreateName}\n` +
                                `**• Role taken:** ${isMemberHasUnregisterRole ? `<@&${unregisterRoleId}>` : "The bot had no unregistered role"}\n` +
                                `**• Given role(s):** ${botRolesString}\n` +
                                `**• New name:** ${memberName}\n` +
                                `**• Registration type:** Bot ${EMOJIS.bot}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor(`#${colors.bot}`)
                            .setFooter({
                                text: `${msg.client.user.username} Log system`,
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
                guildData.boy += 1;
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