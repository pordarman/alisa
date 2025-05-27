"use strict";
const allMessages = require("../../../Helpers/Localizations/Index.js");
const {
    topgglink
} = require("../../../settings.json");

module.exports = {
    name: { // Komutun ismi
        tr: "oy",
        en: "vote"
    },
    id: "oy", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "vote"
    ],
    description: { // Komutun açıklaması
        tr: "Bota oy verirsiniz",
        en: "You vote for the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>oy",
        en: "<px>vote"
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
        language
    }) {

        const {
            commands: {
                oy: messages
            }
        } = allMessages[language];

        return msg.reply(
            messages.voteMessage(topgglink)
        );

    },
};