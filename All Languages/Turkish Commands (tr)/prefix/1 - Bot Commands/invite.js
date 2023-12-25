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
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "davet", // Komutun ismi
    id: "davet", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [
        "davet",
        "link",
        "davetet",
        "botlink"
    ], // Komutun diğer çağırma isimleri
    description: "Botun davet linklerini gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>davet", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Butonları oluşturma
        const allButtons = new ActionRowBuilder()
            .addComponents(
                // Botun davet linki
                new ButtonBuilder()
                    .setLabel("Beni davet et")
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel("Bana oy ver")
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel("Destek sunucum")
                    .setEmoji("🎉")
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordInviteLink)
            );

        return msg.reply({
            content: "Al bakalım şapşik şey seni :)",
            components: [
                allButtons
            ]
        })

    },
};