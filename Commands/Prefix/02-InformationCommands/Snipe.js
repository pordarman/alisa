"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "snipe",
        en: "snipe"
    },
    id: "snipe", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "snipe"
        ],
        en: [
            "snipe"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kanalda silinen son mesajı gösterir (Eğer bir kişiyi etiketlerseniz onun son mesajını gösterir)",
        en: "Shows the last deleted message in the channel (If you tag a person, it shows his last message)"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>snipe [@kişi veya Kişi ID'si]",
        en: "<px>snipe [@user or User ID]"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece snipeAuthorlere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        msgMember,
        args,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                snipe: messages
            },
            permissions: permissionMessages,
        } = allMessages[language];

        // Eğer kullanıcıda "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed(permissionMessages.manageMessages, "memberPermissionError");

        // Eğer dosya bulunamadıysa veya hiç mesaj silinmemişse sadece mesaja tepki at
        const snipeObject = guildDatabase.snipe;
        if (!snipeObject[msg.channelId] || !("lastUserId" in snipeObject[msg.channelId])) {
            return Util.isMessage(msg) ?
                // Eğer mesaj bir Message objesi ise
                msg.react(EMOJIS.no) :
                // Eğer mesaj bir Interaction objesi ise
                errorEmbed(messages.noData.channel);
        }

        const snipeDatabase = snipeObject[msg.channelId];
        let snipeContent;
        let snipeAuthor;

        // Eğer kullanıcı etiketlediyse kullanıcının son mesajını getir
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args.join(" "));
        if (user) {
            snipeContent = snipeDatabase[user.id];

            // Eğer kullanıcı hiç mesaj silmemişse sadece mesaja tepki at
            if (!snipeContent) {
                return Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.no) :
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(messages.noData.user);
            }

            snipeAuthor = user.id;
        }
        // Eğer hiç kimseyi etiketlememişse son mesajı getir
        else {
            snipeAuthor = snipeDatabase.lastUserId
            snipeContent = snipeDatabase[snipeAuthor];
        };

        const messageContent = snipeContent.content ? Util.truncatedString(snipeContent.content, Util.MAX.contentForSnipe) : messages.messageUnknown;

        // Mesajdaki dosyalarını kontrol eder ve neler olduğunu yazar
        const contentArray = [];
        const englishToTurkish = messages.data;
        for (const type in snipeContent.attachments) {
            if (snipeContent.attachments[type] > 0) {
                contentArray.push(`${snipeContent.attachments[type]} ${englishToTurkish[type]}`);
            }
        }

        const extraInformation = Util.formatArray(contentArray, language);

        // Silinen mesajın sahibinin ismini ve resmini embed'in üst kısmına ekle
        const deletedMessageAuthor = await Util.fetchUserForce(msg.client, snipeAuthor);

        const embed = new EmbedBuilder()
            .setAuthor(
                deletedMessageAuthor ?
                    {
                        name: deletedMessageAuthor.displayName,
                        iconURL: deletedMessageAuthor.displayAvatarURL()
                    } :
                    {
                        name: "deleted_user",
                        iconURL: "https://cdn.discordapp.com/embed/avatars/1.png"
                    }
            )
            .setDescription(
                messages.titles.description({
                    snipeAuthor,
                    extraInformation,
                    createdTimestamp: Util.msToSecond(snipeContent.createdTimestamp),
                    deletedTimestamp: Util.msToSecond(snipeContent.deletedTimestamp)
                })
            )
            .addFields(
                {
                    name: messages.titles.content,
                    value: messageContent
                }
            )
            .setColor("#980d9e")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};