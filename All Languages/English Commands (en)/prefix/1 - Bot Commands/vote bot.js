"use strict";
const {
    vote
} = require("../../../../messages.json");
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "vote", // Komutun ismi
    id: "oy", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "vote"
    ],
    description: "You vote for the bot", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>vote", // Komutun kullanım şekli
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
        language
    }) {

        // Mesajda gösterilecek mesaj
        const randomMessage = vote[language][Math.floor(Math.random() * vote[language].length)];

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Vote me")
                    .setEmoji(shyEmoji)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`)
            );

        return msg.reply({
            content: randomMessage,
            components: [
                actionRow
            ]
        });

    },
};