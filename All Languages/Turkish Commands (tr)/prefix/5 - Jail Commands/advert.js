"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "reklam", // Komutun ismi
    id: "jail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "reklam"
    ],
    description: "Yardımcı komut", // Komutun açıklaması
    category: "", // Komutun kategorisi (yardım menüsü için)
    usage: "", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: false, // Komutun yardım komutlarına eklenip eklenmeyeceğini gösterir

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

        return msg.client.prefixCommands[language].get("jail").execute({
            alisa,
            guildDatabase,
            msg,
            msgMember,
            guildMe,
            guildId,
            guild,
            authorId,
            args: ["Reklam", ...args],
            prefix,
            errorEmbed,
        })

    },
};