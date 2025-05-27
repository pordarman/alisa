"use strict";

const Util = require("../../../Helpers/Util.js");

const advertLang = {
    tr: "Reklam",
    en: "Advert"
};

module.exports = {
    name: { // Komutun ismi
        tr: "reklam",
        en: "ad"
    },
    id: "jail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "reklam"
        ],
        en: [
            "ad",
            "ads",
            "advert"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı \"Reklam\" sebebiyle jaile atar",
        en: "Jails the user for \"Advert\" reason"
    },
    category: "", // Komutun kategorisi (yardım menüsü için)
    usage: "", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: false, // Komutun yardım komutlarına eklenip eklenmeyeceğini gösterir

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute(params) {

        params.args.unshift(advertLang[params.language]);

        return Util.maps.prefixCommandIds.get("jail").execute(params);

    },
};