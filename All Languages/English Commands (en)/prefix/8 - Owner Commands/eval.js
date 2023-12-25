"use strict";

module.exports = {
    name: "eval", // Komutun ismi
    id: "eval", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "eval"
    ],
    description: "eval fonksiyonunu kullanırsınız", // Komutun açıklaması
    category: "Owner commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>eval <İstediğiniz bir komut>", // Komutun kullanım şekli
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

        return msg.client.prefixCommands["tr"].get(this.name).execute({
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
        });

    },
};