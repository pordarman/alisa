"use strict";

module.exports = {
    name: "s-say", // Komutun ismi
    id: "s-say", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "s-say"
    ],
    description: "Kaç kullanıcıya ve sunucuya hizmet ettiğini gösterir", // Komutun açıklaması
    category: "Owner commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>s-say", // Komutun kullanım şekli
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
        language,
    }) {

        return msg.client.prefixCommands["tr"].get(this.name).execute({
            msg,
            language
        });

    },
};