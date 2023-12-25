"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "tag", // Komutun ismi
    id: "tag", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "tag"
    ],
    description: "Show server's tag", // Komutun açıklaması
    category: "Information commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>tag", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        prefix,
    }) {

        const guildTag = guildDatabase.register.tag;

        // Eğer sunucuda tag ayarlıysa tagı döndür
        if (guildTag) return msg.reply(guildTag);

        // Eğer tag ayarlı değilse ve kişi yönetici değilse
        if (!msgMember.permissions.has("Administrator")) return msg.react(EMOJIS.no);

        // Eğer yönetcisiyse tagı nasıl ayarlayacağını göster
        return Util.waitAndDeleteMessage(
            await msg.reply(
                `• Tag is not set on the server. To set it, you can type **${prefix}${this.name}** \`yourtag\``
            ),
            15 * 1000 // Mesajı 15 saniye boyunca göster
        );

    },
};