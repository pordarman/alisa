"use strict";

module.exports = {
    name: { // Komutun ismi
        tr: "ping",
        en: "ping"
    },
    id: "ping", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "ping"
        ],
        en: [
            "ping"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botun pingini gösterir",
        en: "Shows the bot's ping"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>ping",
        en: "<px>ping"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
    }) {

        msg.reply(`🏓 Pong! **${msg.client.ws.ping}** ms!`);

    },
};