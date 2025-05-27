"use strict";
const Util = require("../../../Helpers/Util.js");
const {
    EmbedBuilder
} = require("discord.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");

module.exports = {
    name: { // Komutun ismi
        tr: "mesaj",
        en: "message"
    },
    id: "mesaj", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "mesaj",
            "m",
            "message",
            "msg",
        ],
        en: [
            "message",
            "m",
            "msg"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki en çok mesaj atanları ve kanalları gösterir",
        en: "Shows the top message senders and channels in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>mesaj",
        en: "<px>message"
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
        guildDatabase,
        authorId,
        language,
    }) {

        const NOW_TIME = Date.now();

        const guildIcon = msg.guild.iconURL();

        const USERS_IN_MESSAGE = 8;
        const lastObject = {
            hour: 0,
            hour12: 0,
            day: 0,
            week: 0,
            month: 0
        };
        const TIMES = {
            hour: 60 * 60 * 1000,
            hour12: 12 * 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };
        const channelMessagesCount = {};
        let totalMessagesCount = 0;
        const allMessageDatas = [];

        const allStatDatas = Object.entries(guildDatabase.stats);

        for (let i = 0; i < allStatDatas.length; i++) {
            const [userId, data] = allStatDatas[i];

            let messageCount = 0;
            totalMessagesCount += data.totals.message;
            for (const channelId in data.messages) {
                const length = data.messages[channelId].length;
                messageCount += length;

                // Kanala atılan mesaj sayısını kaydet
                channelMessagesCount[channelId] = channelMessagesCount[channelId] + length || length;

                // Bütün mesajlarda dolaş ve atılan süreye göre mesaj sayısını kaydet
                for (let i = 0; i < length; i++) {
                    const timestamp = data.messages[channelId][i];

                    // Mesaj son 1 saatte atıldıysa
                    if (NOW_TIME - TIMES.hour <= timestamp) lastObject.hour += 1;

                    // Mesaj son 12 saatte atıldıysa
                    if (NOW_TIME - TIMES.hour12 <= timestamp) lastObject.hour12 += 1;

                    // Mesaj son 1 günde atıldıysa
                    if (NOW_TIME - TIMES.day <= timestamp) lastObject.day += 1;

                    // Mesaj son 1 haftada atıldıysa
                    if (NOW_TIME - TIMES.week <= timestamp) lastObject.week += 1;

                    // Mesaj son 1 ayda atıldıysa
                    if (NOW_TIME - TIMES.month <= timestamp) lastObject.month += 1;
                    // Eğer mesaj son 1 aydan daha sonra atıldıysa döngüyü bitir
                    else break;
                }
            }

            // Eğer mesaj sayısı 0'dan büyükse diziye ekle
            if (messageCount > 0) {
                allMessageDatas.push([userId, messageCount]);
            }
        }

        allMessageDatas.sort((a, b) => b[1] - a[1]);

        // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
        const authorPosition = Util.binarySearch(allMessageDatas, guildDatabase.stats[authorId]?.totals?.message ?? 0, authorId);
        const authorDataCopy = allMessageDatas[authorPosition];
        const topMessages = allMessageDatas.slice(0, USERS_IN_MESSAGE);
        if (authorPosition >= USERS_IN_MESSAGE) topMessages.push(authorDataCopy)

        const topChannels = Object.entries(channelMessagesCount)
            .sort(([_, count1], [__, count2]) => count2 - count1)
            .slice(0, USERS_IN_MESSAGE);

        const statMessages = allStatMessages(language);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                statMessages.descriptions.allTextChannels(Util.toHumanize(totalMessagesCount))
            )
            .addFields(
                {
                    name: statMessages.field.names.topMessageMember(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topMessages.map(
                            ([userId, messagesCount], index) => `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Util.toHumanize(messagesCount)}** ${statMessages.message}`
                        ).join("\n"),
                        language
                    ),
                },
                {
                    name: statMessages.field.names.topMessageChannel(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topChannels.map(
                            ([channelId, messagesCount], index) => `• \`#${index + 1}\` <#${channelId}> **${Util.toHumanize(messagesCount)}** ${statMessages.message}`
                        ).join("\n"),
                        language
                    ),
                },
                {
                    name: "\u200b",
                    value: statMessages.field.values.allMessages(lastObject),
                    inline: true
                },
            )
            .setThumbnail(guildIcon)
            .setColor("Random")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};