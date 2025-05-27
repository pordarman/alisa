"use strict";
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const {
    EmbedBuilder
} = require("discord.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");

module.exports = {
    name: { // Komutun ismi
        tr: "topüye",
        en: "topmembers"
    },
    id: "topüye", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "topüye",
            "topüyeler",
            "topmembers"
        ],
        en: [
            "topmembers"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucuda en çok mesaj atan ve en çok ses kanalında bulunan üyeleri gösterir",
        en: "Shows the members who send the most messages and are in the voice channel the most"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>topüye",
        en: "<px>topmembers"
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

        const USERS_IN_MESSAGE = 15;
        const lastMessagesObject = {
            hour: 0,
            hour12: 0,
            day: 0,
            week: 0,
            month: 0
        };
        const lastVoicesObject = {
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

        const allMessageDatas = [];
        const allVoiceDatas = [];

        const allStatDatas = Object.entries(guildDatabase.stats);

        for (let i = 0; i < allStatDatas.length; i++) {
            const [userId, data] = allStatDatas[i];

            let authorVoiceTime = 0;
            let authorMessagesCount = 0;

            const authorData = JSON.parse(JSON.stringify(data));

            authorMessagesCount += authorData.totals.message;
            authorVoiceTime += authorData.totals.voice

            // Eğer şu anda bir ses kanalında varsa bunu da ekle
            if (authorData.currVoice.channelId) {
                const channelId = authorData.currVoice.channelId;
                const total = NOW_TIME - authorData.currVoice.startedTimestamp;
                authorVoiceTime += total;
                authorData.voice[channelId] ??= Util.DEFAULTS.memberVoiceStat;
                authorData.voice[channelId].datas.unshift({
                    duration: total,
                    startedTimestamp: authorData.currVoice.startedTimestamp,
                    endedTimestamp: NOW_TIME
                })
            }

            // Kullanıcının ses verisini çek
            for (const channelId in authorData.voice) {
                const {
                    datas
                } = authorData.voice[channelId];

                // Bütün ses verilerinde dolaş ve süreyi yazdır
                for (let i = 0; i < datas.length; i++) {
                    const {
                        duration,
                        endedTimestamp,
                        startedTimestamp
                    } = datas[i];

                    // Ses verisi son 1 saat içindeyse
                    if (NOW_TIME - TIMES.hour <= startedTimestamp) lastVoicesObject.hour += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.hour));

                    // Ses verisi son 12 saat içindeyse
                    if (NOW_TIME - TIMES.hour12 <= startedTimestamp) lastVoicesObject.hour12 += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.hour12));

                    // Ses verisi son 1 gün içindeyse
                    if (NOW_TIME - TIMES.day <= startedTimestamp) lastVoicesObject.day += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.day));

                    // Ses verisi son 1 hafta içindeyse
                    if (NOW_TIME - TIMES.week <= startedTimestamp) lastVoicesObject.week += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.week));

                    // Ses verisi son 1 ay içindeyse
                    if (NOW_TIME - TIMES.month <= startedTimestamp) lastVoicesObject.month += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.month));
                    // Eğer ses 1 aydan önceyse döngüyü bitir
                    else break;
                }

            }

            // Kullanıcının mesaj verisini çek
            for (const channelId in authorData.messages) {
                const channelMessages = authorData.messages[channelId];
                const length = channelMessages.length;

                // Bütün mesajlarda dolaş ve atılan süreye göre mesaj sayısını kaydet
                for (let i = 0; i < length; i++) {
                    const timestamp = channelMessages[i];

                    // Mesaj son 1 saatte atıldıysa
                    if (NOW_TIME - TIMES.hour <= timestamp) lastMessagesObject.hour += 1;

                    // Mesaj son 12 saatte atıldıysa
                    if (NOW_TIME - TIMES.hour12 <= timestamp) lastMessagesObject.hour12 += 1;

                    // Mesaj son 1 günde atıldıysa
                    if (NOW_TIME - TIMES.day <= timestamp) lastMessagesObject.day += 1;

                    // Mesaj son 1 haftada atıldıysa
                    if (NOW_TIME - TIMES.week <= timestamp) lastMessagesObject.week += 1;

                    // Mesaj son 1 ayda atıldıysa
                    if (NOW_TIME - TIMES.month <= timestamp) lastMessagesObject.month += 1;
                    // Eğer mesaj son 1 aydan daha sonra atıldıysa döngüyü bitir
                    else break;
                }
            }

            // Eğer mesaj sayısı 0'dan büyükse ekle
            if (authorMessagesCount > 0) {
                allMessageDatas.push([userId, authorMessagesCount]);
            }

            // Eğer ses süresi 0'dan büyükse ekle
            if (authorVoiceTime > 0) {
                allVoiceDatas.push([userId, authorVoiceTime]);
            }
        }

        // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
        const authorMessagePosition = Util.binarySearch(allMessageDatas, guildDatabase.stats[authorId]?.totals?.message ?? 0, authorId);
        const authorMessageDataCopy = allMessageDatas[authorMessagePosition];
        const topMessages = allMessageDatas.slice(0, USERS_IN_MESSAGE);
        if (authorMessagePosition >= USERS_IN_MESSAGE) topMessages.push(authorMessageDataCopy);

        // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
        const authorVoicePosition = Util.binarySearch(allVoiceDatas, guildDatabase.stats[authorId]?.totals?.voice ?? 0, authorId);
        const authorVoiceDataCopy = allVoiceDatas[authorVoicePosition];
        const topVoices = allVoiceDatas.slice(0, USERS_IN_MESSAGE);
        if (authorVoicePosition >= USERS_IN_MESSAGE) topVoices.push(authorVoiceDataCopy);

        const statMessages = allStatMessages(language);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                statMessages.descriptions.allMembers
            )
            .addFields(
                {
                    name: statMessages.field.names.topMessageMemberExtra(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topMessages.map(
                            ([userId, messages], index) => `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Util.toHumanize(messages)}** ${statMessages.message}`
                        ).join("\n"),
                        language
                    )
                },
                {
                    name: statMessages.field.names.topVoiceMemberExtra(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topVoices.map(
                            ([userId, voice], index) => `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Time.duration(voice, language)}**`
                        ).join("\n"),
                        language
                    )
                },
                {
                    name: "\u200b",
                    value: statMessages.field.values.allMessages(lastMessagesObject),
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: "\u200b",
                    value: statMessages.field.values.allVoice(lastVoicesObject),
                    inline: true
                }
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