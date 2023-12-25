"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {
    botInviteLink,
    discordInviteLink,
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "invite", // Komutun ismi
    id: "davet", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [
        "invite",
        "link",
    ], // Komutun diğer çağırma isimleri
    description: "Shows the bot's invitation links", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>invite", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
    }) {

        // Butonları oluşturma
        const allButtons = new ActionRowBuilder()
            .addComponents(
                // Botun davet linki
                new ButtonBuilder()
                    .setLabel("Invite me")
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel("Vote me")
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel("My support server")
                    .setEmoji("🎉")
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordInviteLink)
            );

        return msg.reply({
            content: "Here you go, you stupid thing :)",
            components: [
                allButtons
            ]
        })

    },
};