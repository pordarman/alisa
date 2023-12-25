"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "komut", // Komutun ismi
    id: "komut", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "komut",
        "komutkullanım",
        "komutbilgi",
        "bilgikomut",
        "command",
        "commandinfo"
    ],
    description: "Komut hakkında bilgiler verir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>komut <Komutun adı>", // Komutun kullanım şekli
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
        isOwner
    }) {

        const commandName = args[0]?.toLocaleLowerCase(language);
        if (!commandName) return errorEmbed(`Lütfen bir komut adı giriniz!`);

        const command = msg.client.prefixCommands[language].get(commandName);
        if (!command || !command.addHelpCommand || (command.ownerOnly && !isOwner)) return errorEmbed(`**${commandName}** adlı komutu bulamadım, lütfen komutun adını doğru yazdığınızdan emin olunuz`);

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
                `**‼️ Komutun kullanımında gösterilen [] işareti "isteğe bağlı", <> işareti ise "zorunlu" anlamına geliyor**\n\n` +
                `✏️ **Komutun adı:** ${name}\n` +
                `⏳ **Komutun bekleme süresi:** ${cooldown} saniye\n` +
                `📝 **Komutun açıklaması:** ${description}\n` +
                `${Util.helpCommandHelper[language][category].emoji} **Komutun kategorisi:** ${category}\n\n` +
                `📍 **Komutun kullanımı:** ${usage.replace("<px>", prefix)}\n` +
                `🌐 **Komutun diğer kullanım şekilleri:** ${aliases.map(commandName => `${prefix}${commandName}`).join(" | ")}\n\n` +
                `👑 **Komut sahibe özel mi:** ${ownerOnly ? "Evet" : "Hayır"}\n` +
                `${EMOJIS.premiumCommands} **Komut premium komutu mu:** ${premium ? "Evet" : "Hayır"}`
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