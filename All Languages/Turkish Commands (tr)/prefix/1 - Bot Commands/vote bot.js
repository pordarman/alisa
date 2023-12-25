"use strict";
const {
    vote
} = require("../../../../messages.json");
const {
    EMOJIS: {
        shy: shyEmoji
    }
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "oy", // Komutun ismi
    id: "oy", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "oy",
        "oyver",
        "vote"
    ],
    description: "Bota oy verirsiniz", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>oy", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
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
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Mesajda gösterilecek mesaj
        const randomMessage = vote[language][Math.floor(Math.random() * vote[language].length)];

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Bana oy ver")
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