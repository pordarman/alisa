"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "ping", // Komutun ismi
    id: "ping", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "ping"
    ],
    description: "Botun ping değerini gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>ping", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        msg.reply(`🏓 Pong! **${msg.client.ws.ping}** ms!`);

    },
};