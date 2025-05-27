"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "öneri",
        en: "suggestion"
    },
    id: "öneri", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "öneri",
            "sugges",
            "öner",
            "önerme"
        ],
        en: [
            "suggestion",
            "sugges"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bot hakkında öneriler yaparsınız",
        en: "You can make suggestions about the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>öneri <Mesajınız>",
        en: "<px>suggestion <Your message>"
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
        authorId,
        prefix,
        language,
        errorEmbed
    }) {

        const {
            commands: {
                "öneri": messages
            }
        } = allMessages[language];

        const suggestionMessage = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);
        if (!suggestionMessage) return errorEmbed(messages.enterMessage);

        const embed = new EmbedBuilder()
            .setTitle("💬 Bir yeni öneri var")
            .addFields(
                {
                    name: "Kullanıcı",
                    value: `**${Util.escapeMarkdown(msg.author.displayName)}** - (${authorId})`
                },
                {
                    name: "Öneri mesajı",
                    value: suggestionMessage
                }
            )
            .setColor("#41b6cc")
            .setFooter({
                text: `${msg.client.user.tag} teşekkür eder...`
            });

        // Mesajı destek sunucusunun kanalına gönder
        Util.webhooks.suggestion.send({
            embeds: [
                embed
            ]
        });

        return msg.reply(messages.success);

    },
};