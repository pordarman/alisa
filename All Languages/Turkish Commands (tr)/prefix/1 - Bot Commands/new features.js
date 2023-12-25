"use strict";
const {
    EmbedBuilder
} = require("discord.js")
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "yenilik", // Komutun ismi
    id: "yenilik", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yenilik",
        "yenilikler",
        "feature",
        "features",
    ],
    description: "Bota eklenen son güncellemeleri gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yenilik", // Komutun kullanım şekli
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

        const {
            newCodes,
            newFeatures,
            fixes,
            timestamp
        } = alisa.commandHelpers.features[language];

        // Embed'de gözükecek veriler
        const fields = [];

        // Eğer yeni eklenen kodlar varsa diziye ekle
        if (newCodes.length > 0) fields.push({
            name: "🆕 Yeni komutlar",
            value: newCodes.map((newCode, index) => `**• \`#${index + 1}\`: ${newCode.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer yeni eklenen özellikler varsa diziye ekle
        if (newFeatures.length > 0) fields.push({
            name: "🪄 Yenilikler ve düzenlemeler",
            value: newFeatures.map((newFeature, index) => `**• \`#${index + 1}\`: ${newFeature.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer düzeltilen hatalar varsa diziye ekle
        if (fixes.length > 0) fields.push({
            name: "🛠️ Hata düzeltmeleri",
            value: fixes.map((fix, index) => `**• \`#${index + 1}\`: ${fix.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer diziye hiçbir veri yoksa "Botta yeni güncelleme yok" diye mesaj döndür
        if (fields.length == 0) return msg.reply(`• Botta şu anlık yeni güncelleme yok!`);

        const embed = new EmbedBuilder()
            .setTitle("Botun yenilikleri")
            .addFields(...fields)
            .setThumbnail(msg.client.user.displayAvatarURL())
            .setColor("#e41755")
            .setFooter({
                text: `Son güncelleme`
            })
            .setTimestamp(timestamp);

        msg.reply({
            embeds: [
                embed
            ]
        });

    },
};