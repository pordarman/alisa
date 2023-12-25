"use strict";
const {
    discordInviteLink,
    supportGuildId
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "support", // Komutun ismi
    id: "destek", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "support"
    ],
    description: "You get support about the bot", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>support", // Komutun kullanım şekli
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
        msgMember,
        prefix,
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL();
        const supportGuild = await Util.getGuild(msg.client, supportGuildId);
        const supportGuildIcon = supportGuild.iconURL;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: supportGuild.name,
                iconURL: supportGuildIcon
            })
            .setDescription(
                `• Looks like you need some help, I can help you out if you want?\n\n` +
                `• You can come to **[My support server](${discordInviteLink})** and ask the authorities to help\n\n` +
                `• By the way, if you want to get help without coming to my support server, you can quickly setup the entire registration system by using the **${prefix}setup** command and answering all the questions\n\n` +
                `• And if possible, start using **${prefix}help** after seeing all my commands, because many of my commands make your operations easier and more practical. **__So don't forget to check out all my commands.__**\n\n` +
                `• If you need more help, don't forget to come to my **[Support server](${discordInviteLink})** ^^\n\n` +
                `• And most importantly *I love you...* :)`
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