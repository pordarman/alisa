"use strict";

module.exports = {
    name: "skişi", // Komutun ismi
    id: "skişi", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "skişi",
        "ssunucu",
        "sunucu",
        "kişi"
    ],
    description: "Bir kullanıcının veya sunucunun kaç komut kullandığını gösterir", // Komutun açıklaması
    category: "Owner commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>skişi <@kişi veya Kişi ID'si veya Sunucu ID'si>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        msg,
        args,
        language,
    }) {

        return msg.client.prefixCommands["tr"].get(this.name).execute({
            alisa,
            msg,
            args,
            language
        });

    },
};