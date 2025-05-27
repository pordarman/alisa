"use strict";
const {
    supportGuildId
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "destek",
        en: "support"
    },
    id: "destek", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: {  // Komutun diğer çağırma isimleri
        tr: [
            "destek",
            "support",
            "sup"
        ],
        en: [
            "support",
            "sup"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bot hakkında destek alırsınız",
        en: "You get support about the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>destek",
        en: "<px>support"
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
        msgMember,
        prefix,
        language
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL();
        const supportGuild = await Util.getGuild(msg.client, supportGuildId);
        const supportGuildIcon = supportGuild.iconURL;
        const {
            commands: {
                destek: messages
            }
        } = allMessages[language];

        const embed = new EmbedBuilder()
            .setAuthor({
                name: supportGuild.name,
                iconURL: supportGuildIcon
            })
            .setDescription(
                messages.description(prefix)
            )
            .setColor(msgMember.displayHexColor ?? "#9e02e2")
            .setThumbnail(clientAvatar)
            .setTimestamp()
        msg.reply({
            embeds: [
                embed
            ]
        });

    },
};