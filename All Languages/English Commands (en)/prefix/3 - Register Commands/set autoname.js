"use strict";

module.exports = {
    name: "autoname", // Komutun ismi
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "autoname",
        "auto-name",
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
        guildDatabase,
        msg,
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        return msg.client.prefixCommands[language].get("customname").execute({
            guildDatabase,
            msg,
            msgMember,
            guildId,
            args,
            prefix,
            errorEmbed,
            language
        });

    },
};