"use strict";
const Util = require("../../../Helpers/Util");
const {
    parseEmoji,
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "emoji",
        en: "emoji"
    },
    id: "emoji", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "emojibilgi",
            "emoji-bilgi",
            "emoji-info",
            "emojib",
            "ebilgi",
            "eb",
        ],
        en: [
            "emojiinfo",
            "emoji-info",
            "einfo",
        ],
    },
    description: { // Komutun açıklaması
        tr: "İsmi girilen, etiketlenen veya ID'si girilen emoji hakkında bilgi verir",
        en: "Gives information about the emoji whose name, tag or ID is entered"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>emoji <emoji>",
        en: "<px>emoji <emoji>"
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
        language,
        guild,
        prefix,
        args,
        errorEmbed
    }) {

        const {
            commands: {
                emoji: messages
            }
        } = allMessages[language];

        const emojiContent = args[0];
        if (!emojiContent) return errorEmbed(messages.enter(prefix))

        const allEmojis = guild.emojis.cache;

        // Eğer emoji parse edilebilirse parse et
        const parsedEmoji = parseEmoji(emojiContent);
        const emoji = parsedEmoji && parsedEmoji.id ? allEmojis.get(parsedEmoji.id) : allEmojis.find(e => e.name == emojiContent || e.id == emojiContent);

        // Eğer emoji bulunamadıysa hata ver
        if (!emoji) return errorEmbed(messages.notFound);

        const emojiImage = emoji.imageURL();
        const authorOfEmoji = await emoji.fetchAuthor();
        const createdTimestampInSecond = Util.msToSecond(emoji.createdTimestamp);
        const emojiRawName = emoji.toString();

        let emojiType;
        let emojiTypeEmoji;

        if (emoji.animated) {
            emojiType = messages.animated;
            emojiTypeEmoji = EMOJIS.active;
        } else {
            emojiType = messages.notAnimated;
            emojiTypeEmoji = EMOJIS.unactive;
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: emoji.name || `(${emoji.id})`,
                iconURL: emojiImage,
                url: emoji.url
            })
            .setDescription(
                messages.embedDescription({
                    emojiName: emoji.name,
                    emojiId: emoji.id,
                    createdTimestampInSecond,
                    authorOfEmojiTag: authorOfEmoji.tag,
                    authorOfEmojiId: authorOfEmoji.id,
                    emojiType,
                    emojiImage,
                    emojiTypeEmoji,
                    emojiRawName
                })
            )
            .setThumbnail(emojiImage)
            .setImage(emojiImage)
            .setColor("Random")
            .setTimestamp();

        msg.reply({
            embeds: [
                embed
            ]
        })

    },
};