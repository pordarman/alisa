"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "command", // Komutun ismi
    id: "komut", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "command",
        "commandinfo"
    ],
    description: "Provides information about the command", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>command <Command name>", // Komutun kullanım şekli
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
        args,
        prefix,
        errorEmbed,
        language,
        isOwner
    }) {

        const commandName = args[0]?.toLocaleLowerCase(language);
        if (!commandName) return errorEmbed(`Please enter a command name!`);

        const command = msg.client.prefixCommands[language].get(commandName);
        if (!command || !command.addHelpCommand || (command.ownerOnly && !isOwner)) return errorEmbed(`I couldn't find the command named **${commandName}**, please make sure you typed the name of the command correctly`);

        const {
            name,
            aliases,
            cooldown,
            description,
            category,
            usage,
            ownerOnly,
            premium
        } = command;
        const memberAvatar = msgMember.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name,
                iconURL: memberAvatar
            })
            .setDescription(
                `**‼️ The [] sign shown when using the command means "optional" and the <> sign means "mandatory"**\n\n` +
                `✏️ **Name of the command:** ${name}\n` +
                `⏳ **Command waiting time:** ${cooldown} second\n` +
                `📝 **Description of the command:** ${description}\n` +
                `${Util.helpCommandHelper[language][category].emoji} **Category of the command:** ${category}\n\n` +
                `📍 **Usage of the command:** ${usage.replace("<px>", prefix)}\n` +
                `🌐 **Other uses of the command:** ${aliases.map(commandName => `${prefix}${commandName}`).join(" | ")}\n\n` +
                `👑 **Is the command owner specific:** ${ownerOnly ? "Yes" : "No"}\n` +
                `${EMOJIS.premiumCommands} **Is the command a premium command:** ${premium ? "Yes" : "No"}`
            )
            .setColor("Blue")
            .setTimestamp()

        return msg.reply({
            embeds: [
                embed
            ]
        })
    },
};