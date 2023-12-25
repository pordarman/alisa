"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "otoisim", // Komutun ismi
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "otoisim",
        "otoname"
    ],
    description: "Yardımcı komut", // Komutun açıklaması
    category: "", // Komutun kategorisi (yardım menüsü için)
    usage: "", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: false, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

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

        return msg.client.prefixCommands[language].get("isim-özel").execute({
            alisa,
            guildDatabase,
            msg,
            msgMember,
            guildMe,
            guildId,
            guild,
            authorId,
            args: ["giriş", ...args],
            prefix,
            errorEmbed,
        });
    },
};