"use strict";

const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "otoisim",
        en: "autoname"
    },
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "otoisim",
            "otoname"
        ],
        en: [
            "autoname",
            "auto-name",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya giren kullanıcılara otomatik isim verir",
        en: "Automatically assigns a name to users who join the server"
    },
    category: "", // Komutun kategorisi (yardım menüsü için)
    usage: "", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: false, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute(params) {

        return Util.maps.prefixCommandIds.get("isim-özel").execute(params);

    },
};