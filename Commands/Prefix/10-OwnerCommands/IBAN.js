"use strict";
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "iban",
        en: "iban"
    },
    id: "iban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "iban"
        ],
        en: [
            "iban"
        ],
    },
    description: { // Komutun açıklaması
        tr: "IBAN ve Papara bilgilerini gösterir",
        en: "Shows IBAN and Papara information"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>iban",
        en: "<px>iban"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg
    }) {

        const embed = new EmbedBuilder()
            .setTitle("IBAN ve Papara Bilgileri")
            .setDescription(
                `**• Banka adı:** Ziraat Bankası\n` +
                `**• IBAN:** TR10 0001 0090 1060 4729 8050 02\n` +
                `**• Ad Soyad:** Ali İhsan Çelik\n\n` +
                `**• Banka adı:** Vakıfbank\n` +
                `**• IBAN:** TR68 0001 5001 5800 7306 5088 77\n` +
                `**• Ad Soyad:** Ali İhsan Çelik\n\n` +
                `**• Papara Numara:** 1836883977\n` +
                `**• Papara IBAN:** TR45 0082 9000 0949 1836 8839 77\n` +
                `**• Ad Soyad:** Ali İhsan Çelik`
            )
            .setColor("Blue")
            .setTimestamp();

        msg.reply({
            embeds: [
                embed
            ]
        });
    },
};