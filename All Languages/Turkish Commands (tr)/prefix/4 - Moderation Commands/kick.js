"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kick", // Komutun ismi
    id: "kick", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kick",
        "at",
        "sunucudanat"
    ],
    description: "Etiketlediğiniz üyeyi sunucudan atar", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kick <@kişi veya Kişi ID'si> [Sebep]", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.register.roleIds.kickAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("KickMembers")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Üyeleri At`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri At" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("KickMembers")) return errorEmbed("Üyeleri At", "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMe.permissions.has("KickMembers")) return errorEmbed("Üyeleri At", "botPermissionError");

        const content = args.join(" ")
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kendini yasaklamaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("Kendini sunucudan yasaklayamazsın şapşik şey seni :)");

        // Eğer sunucu sahibini yasaklamaya çalışıyorsa
        if (member.id == guild.ownerId) return errorEmbed("Sunucu sahibini yasaklayamazsın şapşik şey seni :)");

        // Eğer kendi rolünün üstündeyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId != guild.ownerId) return errorEmbed("Yasaklamaya çalıştığınız kişinin sizin rolünüzden üstte bu yüzden bu kişiyi yasaklayamazsınız");

        // Eğer botun rolünün üstündeyse
        if (memberHighestRolePosition >= guildMe.roles.highest.position) return errorEmbed("Yasaklamaya çalıştığınız kişinin rolü benim rolümden üste, lütfen rolümü üste çekiniz ve tekrar deneyiniz");

        const reason = content.replace(
            new RegExp(`<@!?${memberId}>|${memberId}`, "gi"),
            ""
        ).replace(/ +/g, " ").trim();

        // Üyeyi sunucudan yasaklama
        await guild.members.kick(memberId, `Yasaklayan: ${msg.author.displayName} | Sebebi: ${reason || "Sebep belirtilmemiş"}`)
            // Eğer yasaklama başarılı olursa
            .then(() => {
                const NOW_TIME = Date.now();

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!member.bot) {
                    penaltyNumber = guildDatabase.penaltyNumber++;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "kick",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                const recreateUserName = Util.recreateString(member.user.displayName)

                msg.reply(`${EMOJIS.yes} **${recreateUserName} - (${memberId})** başarıyla sunucudan atıldı, tadını çıkar 🥳${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}`)

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
                            `**👟 <@${memberId}> adlı üye olarak sunucudan atıldı**\n\n` +
                            `🧰 **ATAN YETKİLİ**\n` +
                            `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                            `**• Atılma tarihi:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                            `👤 **ATILAN ÜYE**\n` +
                            `**• Adı:** <@${memberId}> - ${recreateUserName}\n` +
                            `**• Atılma sebebi:** ${reason || "Sebep belirtilmemiş"}` +
                            (penaltyNumber ?
                                `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                                "")
                        )
                        .setThumbnail(memberAvatar)
                        .setColor("#b90ebf")
                        .setFooter({
                            text: `${msg.client.user.username} Log sistemi`,
                            iconURL: msg.client.member.displayAvatarURL()
                        })
                        .setTimestamp()

                    modChannel.send({
                        embeds: [
                            embed
                        ]
                    })
                }
            })
            // Eğer yasaklama başarısız olursa
            .catch(err => {
                return errorEmbed(
                    "Yasaklamak istediğiniz üyeyi sunucudan yasaklayamadım :(\n\n" +
                    "**Sebebi:**" +
                    `• ${err}`,
                    "error",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
            })

    },
};