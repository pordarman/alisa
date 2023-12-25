"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "snipe", // Komutun ismi
    id: "snipe", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "snipe"
    ],
    description: "Shows the last deleted message in the channel (If you tag a person, it shows his last message)", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>snipe [@user or User ID]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece snipeAuthorlere özel olup olmadığını ayarlar
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
        language,
    }) {

        // Eğer kullanıcıda "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed("Mesajları Yönet", "memberPermissionError");

        // Eğer dosya bulunamadıysa veya hiç mesaj silinmemişse sadece mesaja tepki at
        const snipeObject = guildDatabase.snipe;
        if (!snipeObject[msg.channelId] || !("lastUserId" in snipeObject[msg.channelId])) return msg.react(EMOJIS.no);

        const snipeDatabase = snipeObject[msg.channelId];
        let snipeContent;
        let snipeAuthor;

        // Eğer kullanıcı etiketlediyse kullanıcının son mesajını getir
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args.join(" "));
        if (user) {
            snipeContent = snipeDatabase[user.id];

            // Eğer kullanıcı hiç mesaj silmemişse sadece mesaja tepki at
            if (!snipeContent) return msg.react(EMOJIS.no);

            snipeAuthor = user.id;
        }
        // Eğer hiç kimseyi etiketlememişse son mesajı getir
        else {
            snipeAuthor = snipeDatabase.lastUserId
            snipeContent = snipeDatabase[snipeAuthor];
        };

        // Eğer mesaj belirli bir karakter sınırının üstündeyse mesajı ayır
        function truncatedString(string, maxLength) {
            if (string.length <= maxLength) return string;

            let truncated = string.slice(0, maxLength);

            // Eğer kelimenin tam sonuna geldiyse olduğu gibi döndür
            if (
                !/[a-zA-ZığüşçöİĞÜŞÖÇ]/.test(string[maxLength])
            ) return `${truncated}...`;

            const lastSpaceIndex = truncated.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
                truncated = truncated.slice(0, lastSpaceIndex).trim();
            }

            return `${truncated}...`;
        }

        const messageContent = snipeContent.content ? truncatedString(snipeContent.content, Util.MAX.contentForSnipe) : "> *message unknown???*";

        // Mesajdaki dosyalarını kontrol eder ve neler olduğunu yazar
        let extraInformation;
        const contentArray = [];
        const englishToTurkish = {
            image: "Picture",
            video: "Video",
            audio: "Sound",
            text: "Text",
            font: "font",
            other: "Other"
        }
        for (const type in snipeContent.attachments) {
            if (snipeContent.attachments[type] > 0) {
                contentArray.push(`${snipeContent.attachments[type]} ${englishToTurkish[type]}`);
            }
        }
        const lastElement = contentArray.pop();
        extraInformation = contentArray.length ? `• ${contentArray.join(", ")} ve ${lastElement}` : lastElement;

        // Milisaniyeden saniyeye çevirme fonksiyonu
        function msToSeconds(milisecond) {
            return Math.round(milisecond / 1000);
        }

        // Silinen mesajın sahibinin ismini ve resmini embed'in üst kısmına ekle
        const deletedMessageAuthor = await Util.fetchUserForce(msg.client, snipeAuthor);

        const embed = new EmbedBuilder()
            .setAuthor(
                deletedMessageAuthor ?
                    {
                        name: deletedMessageauthor.displayName,
                        iconURL: deletedMessageAuthor.displayAvatarURL()
                    } :
                    {
                        name: "deleted_user",
                        iconURL: "https://cdn.discordapp.com/embed/avatars/1.png"
                    }
            )
            .setDescription(
                `• **Post owner:** <@${snipeAuthor}>${extraInformation ?
                    (`\n\n**The message contained the following contents::**\n` +
                        `${extraInformation}`) :
                    ""}\n\n` +
                `• **Time the message was written <t:${msToSeconds(snipeContent.createdTimestamp)}:R>**\n` +
                `• **Message deletion time <t:${msToSeconds(snipeContent.deletedTimestamp)}:R>**`
            )
            .addFields(
                {
                    name: "Content of the message",
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