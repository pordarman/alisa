"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "hata",
        en: "error"
    },
    id: "hata", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "hata",
            "error"
        ],
        en: [
            "error"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bottaki bir hatayı bildirirsiniz",
        en: "You report a bug in the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>hata <Mesajınız>",
        en: "<px>error <Error message>"
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
                hata: messages
            }
        } = allMessages[language];

        const bugMessage = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);
        if (!bugMessage) return errorEmbed(messages.enterMessage);

        const embed = new EmbedBuilder()
            .setTitle("📢 Bir yeni hata var")
            .addFields(
                {
                    name: "Kullanıcı",
                    value: `**${Util.escapeMarkdown(msg.author.displayName)}** - (${authorId})`
                },
                {
                    name: "Hata mesajı",
                    value: bugMessage
                }
            )
            .setColor("#41b6cc")
            .setFooter({
                text: `${msg.client.user.tag} teşekkür eder...`
            });

        // Mesajı destek sunucusunun kanalına gönder
        Util.webhooks.reportBug.send({
            embeds: [
                embed
            ]
        });

        return msg.reply(messages.success);

    },
};