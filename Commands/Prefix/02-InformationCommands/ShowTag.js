"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "tag",
        en: "tag"
    },
    id: "tag", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "tag",
        ],
        en: [
            "tag"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun tagını göster",
        en: "Show server's tag"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>tag",
        en: "<px>tag"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        msgMember,
        prefix,
        language,
        errorEmbed
    }) {

        const guildTag = guildDatabase.register.tag;

        // Eğer sunucuda tag ayarlıysa tagı döndür
        if (guildTag) return msg.reply(guildTag);

        const {
            commands: {
                tag: messages
            }
        } = allMessages[language];

        // Eğer tag ayarlı değilse ve kişi yönetici değilse
        if (!msgMember.permissions.has("Administrator")) {
            return Util.isMessage(msg) ?
                // Eğer mesaj bir Message objesi ise
                msg.react(EMOJIS.no) :
                // Eğer mesaj bir Interaction objesi ise
                errorEmbed(messages.noTag);
        }


        // Eğer yönetcisiyse tagı nasıl ayarlayacağını göster
        return Util.waitAndDeleteMessage(
            msg.reply(
                messages.tagNoSet(prefix)
            ),
            30 * 1000 // Mesajı 30 saniye boyunca göster
        );

    },
};