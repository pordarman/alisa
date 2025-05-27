"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    botInviteLink,
    discordInviteLink
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kurallar",
        en: "rules"
    },
    id: "kurallar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kural",
            "botkuralları",
            "botkural",
            "bot-kurallar",
            "bot-kural",
            "bot-kurallari",
            "rules",
            "rule"
        ],
        en: [
            "rule",
            "botrules",
            "botrule",
            "bot-rules",
            "bot-rule"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Botun kurallarını gösterir",
        en: "Shows the rules of the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kurallar",
        en: "<px>rules"
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
                kurallar: messages
            }
        } = allMessages[language];
        const clientAvatar = msg.client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: messages.embed.author,
                iconURL: clientAvatar
            })
            .setDescription(
                messages.embed.description,
            )
            .setThumbnail(clientAvatar)
            .setColor("DarkRed")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};