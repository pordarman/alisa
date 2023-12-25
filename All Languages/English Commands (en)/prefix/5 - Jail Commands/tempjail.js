"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    RESTJSONErrorCodes
} = require("discord.js");


module.exports = {
    name: "tempjail", // Komutun ismi
    id: "tempjail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "tempjail",
    ],
    description: "Temporarily Jail the user", // Komutun açıklaması
    category: "Jail commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>tempjail <@user or User ID> <Duration> [Reason]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        // Eğer jail rolü ayarlı değilse
        const jailRoleId = guildDatabase.jail.roleId;
        if (!jailRoleId) return errorEmbed(
            `Jail role are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}jail-role @role**` :
                "")
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(`The set jail role is higher than my role's rank! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer kendini Jail'e atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("You can't put yourself in Jail, you stupid thing :)");

        // Eğer sunucu sahibini Jail'e atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't jail the server owner, you stupid thing :)");

        // Eğer kişi zaten jailde ise
        if (member["_roles"].length == 1 && member["_roles"].includes(jailRoleId)) return errorEmbed(`The person you tagged is already in jail!`);

        // Eğer Jail'e atmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        let jailTime = 0;

        const TIMES = {
            SECOND: 1000,
            MINUTE: 60 * 1000,
            HOUR: 60 * 60 * 1000,
            DAY: 24 * 60 * 60 * 1000,
            WEEK: 7 * 24 * 60 * 60 * 1000,
            MONTH: 30 * 24 * 60 * 60 * 1000,
            YEAR: 365.25 * 24 * 60 * 60 * 1000,
        }

        // Yazının içindeki bütün zaman değerlerini çek ve sil
        const reason = content.replace(/(?<!\d)\d{1,5} ?\S+/gi, match => {
            let multi;

            const [num, unit] = match.split(" ");

            switch (unit) {
                case "saniye":
                case "sn":
                case "second":
                case "sec":
                case "seconds":
                case "s":
                    multi = TIMES.SECOND;
                    break;

                case "dakika":
                case "minute":
                case "min":
                case "minutes":
                case "dk":
                case "m":
                    multi = TIMES.MINUTE;
                    break;

                case "saat":
                case "hour":
                case "hours":
                case "h":
                    multi = TIMES.HOUR;
                    break;

                case "gün":
                case "gun":
                case "day":
                case "days":
                case "d":
                    multi = TIMES.DAY;
                    break;

                case "hafta":
                case "week":
                case "weeks":
                case "w":
                    multi = TIMES.WEEK;
                    break;

                case "ay":
                case "month":
                case "months":
                    multi = TIMES.MONTH;
                    break;

                case "yıl":
                case "y":
                case "year":
                case "years":
                    multi = TIMES.YEAR;
                    break;

                default:
                    return match;
            }

            jailTime += num * multi;
            return "";
        })
            // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
            .replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").replace(/ {2,}/, "").trim();

        // Eğer jail zamanını girmemişse hata döndür
        if (jailTime == 0) return errorEmbed(
            `Please enter a time\n\n` +
            `**Example**\n` +
            `• ${prefix}tempjail <@${memberId}> 1 day, 5 hours, 6 minutes and 30 seconds, rest your mind for a while\n` +
            `• ${prefix}tempjail <@${memberId}> 30 minutes`,
            "warn",
            20 * 1000 // Mesajı 20 saniye boyunca göster
        );

        // Kullanıcının şimdiki rollerini Database'ye kaydet
        const memberPrevRoles = member["_roles"];
        guildDatabase.jail.prevRoles[memberId] = memberPrevRoles;

        const msToHumanize = Time.duration(jailTime, language);

        // Kullanıcının bütün rollerini al ve Jail'e at
        await member.edit({
            roles: [jailRoleId]
        })
            // Eğer Jail'e atma başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "tempjail",
                    authorId,
                    timestamp: NOW_TIME,
                    duration: jailTime,
                    isJailed: true
                });

                const message = await msg.reply({
                    content: `${EMOJIS.yes} <@${memberId}> along **${msToHumanize}** sent to Jail for__**${reason || "Reason not stated"}**__!`,
                    allowedMentions: {
                        users: [memberId],
                        roles: [],
                        repliedUser: true
                    }
                });

                // Kişinin Jail'e atılma bilgilerini Database'ye kaydet
                guildDatabase.jail.nowJailedMembers[memberId] = {
                    timestamp: NOW_TIME,
                    expiresTimestamp: NOW_TIME + jailTime,
                    messageId: message.id || msg.id,
                    authorId,
                    channelId: msg.channelId
                };
                guildDatabase.jail.last.unshift({
                    timestamp: NOW_TIME,
                    reason,
                    authorId,
                    isTempJailed: true,
                    duration: jailTime,
                    isJailed: true,
                    memberId
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                // Eğer jail log kanalı varsa o kanala mesaj at
                const jailLogChannelId = guildDatabase.jail.logChannelId;
                if (jailLogChannelId) {
                    const modChannel = guild.channels.cache.get(jailLogChannelId);

                    // Eğer kanal varsa işlemleri devam ettir
                    if (modChannel) {
                        const memberAvatar = member.displayAvatarURL();

                        // Milisaniyeden saniyeye çevirme fonksiyonu
                        function msToSecond(milisecond) {
                            return Math.round(milisecond / 1000);
                        }

                        const jailOpenAt = Date.now() + jailTime;

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**🔇 <@${memberId}> has been __temporarily Jailed**\n\n` +
                                `🧰 **AUTHORITY WHO TEMPJAILED THE MEMBER**\n` +
                                `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **JAILED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Given role:** <@&${jailRoleId}>\n` +
                                `**• Reason:** ${reason || "Reason not stated"}\n` +
                                `**• Date of taking the role of Jail:** <t:${msToSecond(jailOpenAt)}:F> - <t:${msToSecond(jailOpenAt)}:R>`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `Alisa Log system`,
                                iconURL: msg.client.user.displayAvatarURL()
                            })
                            .setTimestamp()

                        modChannel.send({
                            embeds: [
                                embed
                            ]
                        })
                    }

                }

                // Kişinin susturulması açıldığında bilgilendirme mesajı gönder
                msg.client.jailedMembers.set(`${guildId}.${memberId}`,
                    Util.setTimeout(async () => {
                        // Önbellekteki veriyi sil
                        msg.client.jailedMembers.delete(`${guildId}.${memberId}`);

                        // Kişinin önceki rollerini geri vermeye çalış
                        await member.edit({
                            roles: memberPrevRoles
                        })
                            // Eğer rol verme başarılıysa
                            .then(() => {

                                // Kişinin jail süresi bittiği için Database'deki veriyi sil
                                delete guildDatabase.jail.nowJailedMembers[memberId];
                                delete guildDatabase.jail.prevRoles[memberId];

                                // Kullanıcının log bilgilerini güncelle
                                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                                userLogs.unshift({
                                    type: "unjail",
                                    authorId,
                                    timestamp: NOW_TIME,
                                });

                                // Jail'den çıkmasını database'ye kaydet
                                guildDatabase.jail.last.unshift({
                                    timestamp: NOW_TIME,
                                    reason,
                                    authorId,
                                    isTempJailed: true,
                                    isJailed: false,
                                    memberId
                                });

                                // Database'yi güncelle
                                database.writeFile(guildDatabase, guildId);

                                // Kişinin susturulması kaldırıldığında mesajı gönder
                                message.reply(`• <@${memberId}>'s Jail role has been successfully removed!`);

                                // Eğer jail log kanalı varsa o kanala mesaj at
                                const jailLogChannelId = guildDatabase.jail.logChannelId;
                                if (jailLogChannelId) {
                                    const modChannel = guild.channels.cache.get(jailLogChannelId);

                                    // Eğer kanal yoksa hiçbir şey döndürme
                                    if (!modChannel) return;

                                    const memberAvatar = member.displayAvatarURL();

                                    // Milisaniyeden saniyeye çevirme fonksiyonu
                                    function msToSecond(milisecond) {
                                        return Math.round(milisecond / 1000);
                                    }

                                    const embed = new EmbedBuilder()
                                        .setAuthor({
                                            name: member.user.displayName,
                                            iconURL: memberAvatar
                                        })
                                        .setDescription(
                                            `🧰 **AUTHORITY WHO TEMPJAILED THE MEMBER**\n` +
                                            `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                            `👤 **UNJAILED MEMBER**\n` +
                                            `**• Name:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                            `**• Role taken:** <@&${jailRoleId}>\n` +
                                            `**• Reason:** ${reason || "Reason not stated"}\n` +
                                            `**• Date he was put in jail:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>`
                                        )
                                        .setThumbnail(memberAvatar)
                                        .setColor("#b90ebf")
                                        .setFooter({
                                            text: `Alisa Log system`,
                                            iconURL: msg.client.user.displayAvatarURL()
                                        })
                                        .setTimestamp()

                                    modChannel.send({
                                        embeds: [
                                            embed
                                        ]
                                    })
                                }
                            })
                            // Eğer rol verme başarısızsa
                            .catch(err => {
                                return message.reply(
                                    `• An error occurred while jailbreaking <@${memberId}>!\n\n` +
                                    `**Hata:**\n` +
                                    `\`\`\`js\n` +
                                    `${err}\`\`\``
                                );
                            })
                    }, jailTime)
                );

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I don't have permission to edit <@${memberId}>'s roles. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                console.log(err);
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};