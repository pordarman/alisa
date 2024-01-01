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
    name: "mute", // Komutun ismi
    id: "mute", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "mute",
        "sustur",
    ],
    description: "Kullanıcıyı susturur", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>mute <@kişi veya Kişi ID'si> <Süre> [Sebebi]", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.register.roleIds.banAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("ModerateMembers")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Üyelere zaman aşımı uygula`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyelere zaman aşımı uygula" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("ModerateMembers")) return errorEmbed("Üyelere zaman aşımı uygula", "memberPermissionError");

        // Eğer botta "Üyelere zaman aşımı uygula" yetkisi yoksa
        if (!guildMe.permissions.has("ModerateMembers")) return errorEmbed("Üyelere zaman aşımı uygula", "botPermissionError");

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kendine mute atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("Kendine mute atamazsın şapşik şey seni :)");

        // Eğer sunucu sahibine mute atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibine mute atamazsın şapşik şey seni :)");

        // Eğer susturmaya çalıştığı kişide "Yönetici" yetkisi varsa
        if (member.permissions.has("Administrator")) return errorEmbed(`Şeyyy... **Yönetici** yetkisine sahip birisini susturamazsın şapşik şey seni :(`);

        // Eğer susturmaya çalıştığı kişi botun rolünün üstündeyse
        const highestRole = guildMe.roles.highest;
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        let muteTime = 0;

        const TIMES = {
            SECOND: 1000,
            MINUTE: 60 * 1000,
            HOUR: 60 * 60 * 1000,
            DAY: 24 * 60 * 60 * 1000,
            WEEK: 7 * 24 * 60 * 60 * 1000,
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

                default:
                    return match;
            }

            muteTime += num * multi;
            return "";
        })
            // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
            .replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").replace(/ {2,}/, "").trim();

        // Eğer susturma zamanını girmemişse hata döndür
        if (muteTime == 0) return errorEmbed(
            `Lütfen bir süre giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}mute <@${memberId}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n` +
            `• ${prefix}mute <@${memberId}> 30 dakika`,
            "warn",
            20 * 1000 // Mesajı 20 saniye boyunca göster
        );

        // Eğer süre 1 saniyeden azsa veya 27 günden fazlaysa
        if (muteTime < TIMES.SECOND || muteTime > 27 * TIMES.DAY) return errorEmbed(`Lütfen en az 1 saniye en fazla 27 gün arasında bir zaman giriniz`);

        const msToHumanize = Time.duration(muteTime, language);

        // Kullanıcıyı sustur
        await member.timeout(muteTime, `Mute atan yetkili: ${msg.author.displayName} | Süre: ${muteTime} | Sebebi: ${reason}`)
            // Eğer susturma başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!member.user.bot) {
                    penaltyNumber = guildDatabase.moderation.penaltyNumber++;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "mute",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber,
                    duration: muteTime
                });

                const message = await msg.reply({
                    content: `${EMOJIS.yes} <@${memberId}> adlı kişi **${msToHumanize}** boyunca __**${reason || "Sebep belirtilmemiş"}**__ sebebinden yazı ve ses kanallarından men edildi!${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}`,
                    allowedMentions: {
                        users: [memberId],
                        roles: [],
                        repliedUser: true
                    }
                });

                // Kişinin mute bilgilerini Database'ye kaydet
                guildDatabase.moderation.nowMutedMembers[memberId] = {
                    timestamp: NOW_TIME,
                    expiresTimestamp: NOW_TIME + muteTime,
                    messageId: message.id || msg.id,
                    authorId,
                    channelId: msg.channelId
                };

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal varsa işlemleri devam ettir
                    if (modChannel) {
                        const memberAvatar = member.displayAvatarURL();

                        // Milisaniyeden saniyeye çevirme fonksiyonu
                        function msToSecond(milisecond) {
                            return Math.round(milisecond / 1000);
                        }

                        const muteOpenAt = Date.now() + muteTime;

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**🔇 <@${memberId}> adlı üye __geçici__ olarak susturuldu**\n\n` +
                                `🧰 **SUSTURAN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                                `**• Mute tarihi:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                                `👤 **SUSTURULAN ÜYE**\n` +
                                `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Susturulma sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                                `**• Susturulma süresi:** ${msToHumanize}\n` +
                                `**• Susturulmanın açılacağı tarih:** <t:${msToSecond(muteOpenAt)}:F> - <t:${msToSecond(muteOpenAt)}:R>` +
                                (penaltyNumber ?
                                    `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                                    "")
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `${msg.client.user.username} Log sistemi`,
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
                msg.client.mutedMembers.set(`${guildId}.${memberId}`,
                    Util.setTimeout(() => {
                        // Önbellekteki veriyi sil
                        msg.client.mutedMembers.delete(`${guildId}.${memberId}`);

                        // Kişinin mutesi bittiği için Database'deki veriyi sil
                        delete guildDatabase.moderation.nowMutedMembers[memberId];

                        // Kullanıcının log bilgilerini güncelle
                        const userLogs = guildDatabase.userLogs[memberId] ??= [];

                        userLogs.unshift({
                            type: "unmute",
                            authorId,
                            timestamp: NOW_TIME,
                        });

                        // Database'yi güncelle
                        database.writeFile(guildDatabase, guildId);

                        // Kişinin susturulması kaldırıldığında mesajı gönder
                        message.reply(`• <@${memberId}> adlı kişinin susturulması başarıyla kaldırıldı!`);

                        // Eğer mod log kanalı varsa o kanala mesaj at
                        const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                        if (modLogChannelId) {
                            const modChannel = guild.channels.cache.get(modLogChannelId);

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
                                    `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**\n\n` +
                                    `🧰 **SUSTURMAYI AÇAN YETKİLİ**\n` +
                                    `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                                    `**• Mute tarihi:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                                    `👤 **SUSTURULMASI AÇILAN ÜYE**\n` +
                                    `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                    `**• Susturulma sebebi:** ${reason || "Sebep belirtilmemiş"}\n` +
                                    `**• Susturulma süresi:** ${msToHumanize}\n` +
                                    `**• Susturulmanın atıldığı tarih:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>` +
                                    (penaltyNumber ?
                                        `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                                        "")
                                )
                                .setThumbnail(memberAvatar)
                                .setColor("#b90ebf")
                                .setFooter({
                                    text: `${msg.client.user.username} Log sistemi`,
                                    iconURL: msg.client.user.displayAvatarURL()
                                })
                                .setTimestamp()

                            modChannel.send({
                                embeds: [
                                    embed
                                ]
                            })
                        }
                    }, muteTime)
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