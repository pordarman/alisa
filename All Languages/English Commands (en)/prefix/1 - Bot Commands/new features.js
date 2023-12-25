"use strict";
const {
    EmbedBuilder
} = require("discord.js")

module.exports = {
    name: "features", // Komutun ismi
    id: "yenilik", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "features",
        "feature",
    ],
    description: "Shows the latest updates added to the bot", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>features", // Komutun kullanım şekli
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
        msg,
        prefix,
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
            name: "🆕 New commands",
            value: newCodes.map((newCode, index) => `**• \`#${index + 1}\`: ${newCode.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer yeni eklenen özellikler varsa diziye ekle
        if (newFeatures.length > 0) fields.push({
            name: "🪄 Innovations and regulations",
            value: newFeatures.map((newFeature, index) => `**• \`#${index + 1}\`: ${newFeature.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer düzeltilen hatalar varsa diziye ekle
        if (fixes.length > 0) fields.push({
            name: "🛠️ Bug fixes",
            value: fixes.map((fix, index) => `**• \`#${index + 1}\`: ${fix.replace(/<px>/g, prefix)}**`).join("\n")
        });

        // Eğer diziye hiçbir veri yoksa "Botta yeni güncelleme yok" diye mesaj döndür
        if (fields.length == 0) return msg.reply(`• There are no new updates on the bot at the moment!`);

        const embed = new EmbedBuilder()
            .setTitle("What's new in the bot?")
            .addFields(...fields)
            .setThumbnail(msg.client.user.displayAvatarURL())
            .setColor("#e41755")
            .setFooter({
                text: `Last update`
            })
            .setTimestamp(timestamp);

        msg.reply({
            embeds: [
                embed
            ]
        });

    },
};