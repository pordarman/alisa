"use strict";

module.exports = {
    name: "y", // Komutun ismi
    id: "y", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "y",
        "addfeature",
        "addfeatures",
        "yenilikekle"
    ],
    description: "Bottaki güncellemeler kısmını günceller", // Komutun açıklaması
    category: "Owner commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>y <add|remove|change> <kod|yenilik|hata> <Mesajınız>", // Komutun kullanım şekli
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
        prefix,
        errorEmbed,
        language,
    }) {

        return msg.client.prefixCommands["tr"].get(this.name).execute({
            alisa,
            msg,
            args,
            prefix,
            errorEmbed,
            language,
        });

    },
};