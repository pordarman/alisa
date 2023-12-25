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
    name: "ban", // Komutun ismi
    id: "ban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "ban",
        "banla",
        "yasakla"
    ],
    description: "Etiketlediğiniz üyeyi sunucudan yasaklar", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>ban <@kişi veya Kişi ID'si> [Sebep]", // Komutun kullanım şekli
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
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("BanMembers")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Üyeleri Yasakla`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri Yasakla" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("BanMembers")) return errorEmbed("Üyeleri Yasakla", "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMe.permissions.has("BanMembers")) return errorEmbed("Üyeleri Yasakla", "botPermissionError");

        const content = args.join(" ");
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, content);

        if (!user) return errorEmbed(
            user === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const userId = user.id;

        // Eğer kendini yasaklamaya çalışıyorsa
        if (userId == authorId) return errorEmbed("Kendini sunucudan yasaklayamazsın şapşik şey seni :)");

        // Eğer kullanıcı sunucuda bulunuyorsa
        const guildMember = await Util.fetchMemberForce(msg, userId);
        if (guildMember) {

            // Eğer sunucu sahibini yasaklamaya çalışıyorsa
            if (guildMember.id == guild.ownerId) return errorEmbed("Sunucu sahibini yasaklayamazsın şapşik şey seni :)");

            // Eğer kendi rolünün üstündeyse
            const memberHighestRolePosition = guildMember.roles.highest.position;
            if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId != guild.ownerId) return errorEmbed("Yasaklamaya çalıştığınız kişinin sizin rolünüzden üstte bu yüzden bu kişiyi yasaklayamazsınız");

            // Eğer botun rolünün üstündeyse
            if (memberHighestRolePosition >= guildMe.roles.highest.position) return errorEmbed("Yasaklamaya çalıştığınız kişinin rolü benim rolümden üste, lütfen rolümü üste çekiniz ve tekrar deneyiniz");
        }

        const reason = content.replace(
            new RegExp(`<@!?${userId}>|${userId}`, "gi"),
            ""
        ).replace(/ +/g, " ").trim();

        // Üyeyi sunucudan yasaklama
        await guild.members.ban(userId, {
            reason: `Yasaklayan: ${msg.author.displayName} | Sebebi: ${reason || "Sebep belirtilmemiş"}`
        })
            // Eğer yasaklama başarılı olursa
            .then(() => {
                const NOW_TIME = Date.now();

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!user.bot) {
                    penaltyNumber = guildDatabase.penaltyNumber++;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[userId] ??= [];

                userLogs.unshift({
                    type: "ban",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                const recreateUserName = Util.recreateString(user.displayName)

                msg.reply(`${EMOJIS.yes} **${recreateUserName} - (${userId})** başarıyla sunucudan yasaklandı, tadını çıkar 🥳${penaltyNumber ? ` **Ceza numarası:** \`#${penaltyNumber}\`` : ""}${!guildMember ? " - *( Bu kişi sunucuda değildi )*" : ""}`)

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal yoksa hiçbir şey döndürme
                    if (!modChannel) return;

                    const userAvatar = user.displayAvatarURL();

                    // Milisaniyeden saniyeye çevirme fonksiyonu
                    function msToSecond(milisecond) {
                        return Math.round(milisecond / 1000);
                    }

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: user.displayName,
                            iconURL: userAvatar
                        })
                        .setDescription(
                            `**${EMOJIS.ban} <@${userId}> adlı üye __kalıcı__ olarak sunucudan yasaklandı**\n\n` +
                            `🧰 **BANLAYAN YETKİLİ**\n` +
                            `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                            `**• Ban tarihi:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                            `👤 **BANLANAN ÜYE**\n` +
                            `**• Adı:** <@${userId}> - ${recreateUserName}\n` +
                            `**• Banlanma sebebi:** ${reason || "Sebep belirtilmemiş"}` +
                            (penaltyNumber ?
                                `\n• **Ceza numarası:** \`#${penaltyNumber}\`` :
                                "")
                        )
                        .setThumbnail(userAvatar)
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