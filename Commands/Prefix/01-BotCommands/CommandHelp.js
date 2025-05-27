"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "komutbilgi",
        en: "commandinfo"
    },
    id: "komutbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "komut",
            "komutkullanım",
            "komutbilgi",
            "bilgikomut",
            "command",
            "commandinfo"
        ],
        en: [
            "command",
            "commandinfo"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Komut hakkında bilgiler verir",
        en: "Provides information about the command"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>komut <Komutun adı>",
        en: "<px>command <Command name>"
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
        args,
        prefix,
        language,
        errorEmbed,
        isOwner
    }) {

        const {
            commands: {
                komut: messages
            },
            others: otherMessages
        } = allMessages[language];

        const commandName = args[0]?.toLocaleLowerCase(language);
        if (!commandName) return errorEmbed(messages.enter);

        const command = Util.getCommand(Util.maps.prefixCommands.get(language), commandName);
        if (!command || !command.addHelpCommand || (command.ownerOnly && !isOwner)) return errorEmbed(messages.notFound(commandName));

        const memberAvatar = msgMember.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: command.name[language],
                iconURL: memberAvatar
            })
            .setDescription(
                messages.commandInfo({
                    ...command,
                    aliases: Util.mapAndJoin(command.aliases[language], commandName => `${prefix}${commandName}`, " | "),
                    usage: command.usage[language].replace("<px>", prefix),
                    language,
                    categoryEmoji: otherMessages.helpCommandHelper[command.category[language]].emoji,
                    prefix,
                    language
                })
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