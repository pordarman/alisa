"use strict";
const allMessages = require("../../../Helpers/Localizations/Index.js");
const Util = require("../../../Helpers/Util.js");
const axios = require("axios");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");

const emojiLimits = [50, 100, 150, 250];

module.exports = {
    name: { // Komutun ismi
        tr: "emojiekle",
        en: "createemoji"
    },
    id: "emojiekle", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "emojiekle",
            "emojie",
            "createemoji",
            "createmoji"
        ],
        en: [
            "createemoji",
            "createmoji",
            "addemoji",
            "emojiadd"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya emoji ekler",
        en: "Adds an emoji to the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "emojiekle <Emoji veya Emoji ID'si veya Emoji URL'si veya Dosya> [İsim]",
        en: "createemoji <Emoji or Emoji ID or Emoji URL or File> [Name]"
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
        guildMePermissions,
        guild,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                emojiekle: messages
            },
            permissions: permissionMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        // Eğer kişide "Emojileri yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageEmojisAndStickers")) return errorEmbed(permissionMessages.manageEmojisAndStickers, "memberPermissionError");

        // Eğer botun "Emojileri yönet" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("ManageEmojisAndStickers")) return errorEmbed(permissionMessages.manageEmojisAndStickers, "botPermissionError");

        function parseEmoji(content) {
            const match = content?.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
            return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
        }
        async function isValidImageURL(url) {
            try {
                if (!Util.regex.fetchURL.test(url)) return false;
                const response = await axios.head(url);
                if (response.status !== 200) return false;

                const contentType = response.headers["content-type"];
                if (!contentType.startsWith("image/")) return false;

                // Eğer resim tipi jpeg, jpg, png, gif değilse null döndür
                return /image\/(jpeg|jpg|png|gif)/.test(contentType) ? true : null;
            } catch (error) {
                // Eğer hata varsa false döndür
                return false;
            }
        }

        let emoji = parseEmoji(args[0]);
        let emojiUrl;

        if (emoji) {
            emoji.name = args.slice(1).join("_") || emoji.name;
        } else {
            // Eğer args[0] bir ID ise onu linke çevir
            if (/\d{17,20}/.test(args[0])) args[0] = `https://cdn.discordapp.com/emojis/${args[0]}.png?size=4096`;
            const validUrL = await isValidImageURL(args[0])
            if (validUrL === null) return errorEmbed(messages.invalidType);
            if (validUrL) {
                emojiUrl = args[0];
                emoji = {
                    id: null,
                    name: args.slice(1).join("_") || `emoji_${Date.now()}`,
                    animated: emojiUrl.endsWith(".gif")
                };
            } else {
                const [_, emojiId, emojiExtension] = args[0]?.match(/^https:\/\/cdn.discordapp.com\/emojis\/(\d{17,20}).(webp|png|jpg|gif)(\?.+)?$/) || [];

                if (emojiId) {
                    emoji = {
                        id: emojiId,
                        name: args[1] || `emoji_${emojiId}`,
                        animated: emojiExtension === "gif"
                    };
                } else {
                    let isFileEntered = false;
                    let isTrueFileEntered = false;
                    let file;

                    for (const attachment of msg.attachments.values()) {
                        if (attachment.contentType.startsWith("image/")) {
                            isFileEntered = true;

                            // Eğer dosya tipi jpeg, jpg, png, gif değilse döngüyü devam ettir
                            if (!/image\/(jpeg|jpg|png|gif)/.test(attachment.contentType)) continue;

                            isTrueFileEntered = true;
                            file = attachment;
                            break;
                        }
                    }

                    if (!isFileEntered) return errorEmbed(messages.enter(prefix));
                    if (!isTrueFileEntered) return errorEmbed(messages.invalidType);

                    // Eğer dosya boyutu 256 KB'dan büyükse hata döndür
                    const MAX_FILE_SIZE = 1024 * 256; // 256 KB
                    if (file.size > MAX_FILE_SIZE) return errorEmbed(messages.maxSize);

                    emojiUrl = file.url;
                    emoji = {
                        id: null,
                        name: args.join("_") || file.name.slice(0, 32) || `emoji_${Date.now()}`,
                        animated: file.contentType === "image/gif"
                    };
                }
            }
        }

        // Emojinin ismini discord emoji isimlerine uygun hale getir
        emoji.name = (emoji.name || "").replace(/[^a-zA-Z0-9\-]+/g, "_").toLowerCase();

        // Kontroller
        if (!emoji.name) return errorEmbed(messages.enterName);
        if (emoji.name.length > 32) return errorEmbed(messages.tooLongName);

        const allEmojis = guild.emojis.cache;

        // Bütün emojilerde dolaş ve aynı isimde emoji var mı kontrol et ve limit kontrolü yap
        const guildEmojis = [];

        for (const guildEmoji of allEmojis.values()) {
            if (guildEmoji.name === emoji.name) return errorEmbed(messages.sameName);

            if (guildEmoji.animated === emoji.animated) {
                guildEmojis.push(guildEmoji);

                if (guildEmojis.length >= emojiLimits[guild.premiumTier]) return errorEmbed(messages.tooMuchEmoji);
            }
        }

        if (!emojiUrl) {
            if (!emoji.id) return errorEmbed(messages.enter(prefix));
            emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=4096`;
        }

        const message = await msg.reply({
            content: messages.adding,
            withResponse: true,
        });

        // Emoji ekle
        guild.emojis.create({
            attachment: emojiUrl,
            name: emoji.name
        })
            // Eğer emoji eklenirse
            .then(emoji => {
                const replyMessage = Util.isMessage(message) ? message : message.resource.message;
                return replyMessage.edit(messages.success(emoji));
            })
            // Eğer hata olursa
            .catch(err => {
                switch (err.code) {
                    case RESTJSONErrorCodes.UnknownEmoji:
                        return message.edit(messages.invalidEmoji);

                    case RESTJSONErrorCodes.MaximumNumberOfEmojisReached:
                        return message.edit(messages.tooMuchEmoji);

                    case RESTJSONErrorCodes.InvalidFormBodyOrContentType:
                        return message.edit(messages.invalidForm);

                    default:
                        return message.edit({
                            content: unknownErrorMessages.unknownError(err),
                            flags: MessageFlags.Ephemeral
                        });
                }
            });
    }
}