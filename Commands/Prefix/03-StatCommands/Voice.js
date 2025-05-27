"use strict";
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const {
    EmbedBuilder
} = require("discord.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");

module.exports = {
    name: { // Komutun ismi
        tr: "ses",
        en: "voice"
    },
    id: "ses", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "ses",
            "s",
            "voice",
            "v"
        ],
        en: [
            "voice",
            "v",
            "vc"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki en çok sesli sohbet yapanları ve kanalları gösterir",
        en: "Shows the top voice chat users and channels in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>ses",
        en: "<px>voice"
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
        const channelVoiceTimes = {};
        let totalVoiceTimes = 0;

        const allVoiceDatas = [];

        const allStatDatas = Object.entries(guildDatabase.stats);

        for (let i = 0; i < allStatDatas.length; i++) {
            const [userId, data] = allStatDatas[i];

            let authorVoiceTime = 0;

            const authorData = JSON.parse(JSON.stringify(data));

            totalVoiceTimes += authorData.totals.voice;

            // Eğer şu anda bir ses kanalında varsa bunu da ekle
            if (authorData.currVoice.channelId) {
                const channelId = authorData.currVoice.channelId;
                const total = NOW_TIME - authorData.currVoice.startedTimestamp;
                totalVoiceTimes += total;
                authorVoiceTime += total;
                channelVoiceTimes[channelId] = channelVoiceTimes[channelId] + total || total;
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
                    total,
                    datas
                } = authorData.voice[channelId];
                channelVoiceTimes[channelId] = channelVoiceTimes[channelId] + total || total;
                authorVoiceTime += total;

                // Bütün ses verilerinde dolaş ve süreyi yazdır
                for (let i = 0; i < datas.length; i++) {
                    const {
                        duration,
                        endedTimestamp,
                        startedTimestamp
                    } = datas[i];

                    // Ses verisi son 1 saat içindeyse
                    if (NOW_TIME - TIMES.hour <= startedTimestamp) lastObject.hour += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.hour));

                    // Ses verisi son 12 saat içindeyse
                    if (NOW_TIME - TIMES.hour12 <= startedTimestamp) lastObject.hour12 += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.hour12));

                    // Ses verisi son 1 gün içindeyse
                    if (NOW_TIME - TIMES.day <= startedTimestamp) lastObject.day += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.day));

                    // Ses verisi son 1 hafta içindeyse
                    if (NOW_TIME - TIMES.week <= startedTimestamp) lastObject.week += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.week));

                    // Ses verisi son 1 ay içindeyse
                    if (NOW_TIME - TIMES.month <= startedTimestamp) lastObject.month += Math.min(duration, endedTimestamp - (NOW_TIME - TIMES.month));
                    // Eğer ses 1 aydan önceyse döngüyü bitir
                    else break;
                }

            }

            // Eğer ses sayısı 0'dan büyükse diziye ekle
            if (authorVoiceTime > 0) {
                allVoiceDatas.push([userId, authorVoiceTime]);
            }
        }

        allVoiceDatas.sort((a, b) => b[1] - a[1]);

        // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
        const authorPosition = Util.binarySearch(allVoiceDatas, guildDatabase.stats[authorId]?.totals?.voice ?? 0, authorId);
        const authorVoiceDataCopy = allVoiceDatas[authorPosition];
        const topVoices = allVoiceDatas.slice(0, USERS_IN_MESSAGE);
        if (authorPosition >= USERS_IN_MESSAGE) topVoices.push(authorVoiceDataCopy);

        const topVoiceChannels = Object.entries(channelVoiceTimes)
            .sort(([_, count1], [__, count2]) => count2 - count1)
            .slice(0, USERS_IN_MESSAGE);

        const statMessages = allStatMessages(language);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                statMessages.descriptions.allVoiceChannels(Time.duration(totalVoiceTimes, language))
            )
            .addFields(
                {
                    name: statMessages.field.names.topVoiceMember(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topVoices.map(
                            ([userId, voiceTime], index) => `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Time.duration(voiceTime, language)}**`
                        ).join("\n"),
                        language
                    )
                },
                {
                    name: statMessages.field.names.topVoiceChannel(USERS_IN_MESSAGE),
                    value: Util.stringOr(
                        topVoiceChannels.map(
                            ([channelId, voiceTime], index) => `• \`#${index + 1}\` <#${channelId}> **${Time.duration(voiceTime, language)}**`
                        ).join("\n"),
                        language
                    )
                },
                {
                    name: "\u200b",
                    value: statMessages.field.values.allVoice(lastObject),
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