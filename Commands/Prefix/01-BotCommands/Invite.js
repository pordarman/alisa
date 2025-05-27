"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {
    botInviteLink,
    discordInviteLink,
    EMOJIS,
    topgglink
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "davet",
        en: "invite"
    },
    id: "davet", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "davet",
            "link",
            "davetlinki"
        ],
        en: [
            "invite",
            "link"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botun davet linklerini gösterir",
        en: "Shows the bot's invitation links"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>davet",
        en: "<px>invite"
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

        // Dil verilerini seç
        const {
            commands: {
                davet: messages
            }
        } = allMessages[language];

        // Butonları oluşturma
        const allButtons = new ActionRowBuilder()
            .addComponents(
                // Botun davet linki
                new ButtonBuilder()
                    .setLabel(messages.inviteButtons.invite)
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel(messages.inviteButtons.vote)
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(topgglink),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel(messages.inviteButtons.support)
                    .setEmoji("🎉")
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordInviteLink)
            );

        return msg.reply({
            content: messages.invite,
            components: [
                allButtons
            ]
        });
    },
};