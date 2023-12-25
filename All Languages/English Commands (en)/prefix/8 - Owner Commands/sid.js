"use strict";

module.exports = {
    name: "sid", // Komutun ismi
    id: "sid", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sid"
    ],
    description: "Girilen ID'nin bilgilerini döndürür", // Komutun açıklaması
    category: "Owner commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sid <ID veya isim>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        args,
        errorEmbed,
        language
    }) {

        return msg.client.prefixCommands["tr"].get(this.name).execute({
            msg,
            args,
            errorEmbed,
            language
        });

    },
};