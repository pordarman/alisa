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
        "sürelijail",
    ],
    description: "Kullanıcıyı geçici olarak Jail'e atar", // Komutun açıklaması
    category: "Jail komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>tempjail <@kişi veya Kişi ID'si> <Süre> [Sebebi]", // Komutun kullanım şekli
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
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

        // Eğer jail rolü ayarlı değilse
        const jailRoleId = guildDatabase.jail.roleId;
        if (!jailRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir Jail rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}jailrol @rol** yazabilirsiniz` :
                "")
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(`Ayarlanan Jail rolü benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kendini Jail'e atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("Kendini Jail'e atamazsın şapşik şey seni :)");

        // Eğer sunucu sahibini Jail'e atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini Jail'e atamazsın şapşik şey seni :)");

        // Eğer kişi zaten jailde ise
        if (member["_roles"].length == 1 && member["_roles"].includes(jailRoleId)) return errorEmbed(`Etiketlediğiniz kişi zaten jailde!`);

        // Eğer Jail'e atmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

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
            `Lütfen bir süre giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}tempjail <@${memberId}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n` +
            `• ${prefix}tempjail <@${memberId}> 30 dakika`,
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
                    content: `${EMOJIS.yes} <@${memberId}> adlı kişi **${msToHumanize}** boyunca __**${reason || "Sebep belirtilmemiş"}**__ sebebinden Jail'e atıldı!`,
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
                                `**🔇 <@${memberId}> adlı üye __geçici__ olarak Jail'e atıldı**\n\n` +
                                `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **JAIL'E ATILAN KİŞİ**\n` +
                                `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Verilen rol:** <@&${jailRoleId}>\n` +
                                `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                                `**• Jail rolünün alınacağı tarih:** <t:${msToSecond(jailOpenAt)}:F> - <t:${msToSecond(jailOpenAt)}:R>`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `Alisa Log sistemi`,
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
                                message.reply(`• <@${memberId}> adlı kişinin Jail rolü başarıyla kaldırıldı!`);

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
                                            `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**\n` +
                                            `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                            `👤 **JAIL'DEN ÇIKARILAN KİŞİ**\n` +
                                            `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                            `**• Alınan rol:** <@&${jailRoleId}>\n` +
                                            `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                                            `**• Jail' e atıldığı tarih:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>`
                                        )
                                        .setThumbnail(memberAvatar)
                                        .setColor("#b90ebf")
                                        .setFooter({
                                            text: `Alisa Log sistemi`,
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
                                    `• <@${memberId}> adlı kişiyi jail'den çıkarırken bir hata oluştu!\n\n` +
                                    `**Hata:**\n` +
                                    `\`\`\`js\n` +
                                    `${err}\`\`\``
                                );
                            })
                    }, jailTime)
                );

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişiyi susturmaya yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                console.log(err);
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};