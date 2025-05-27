"use strict";
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const {
    EmbedBuilder,
    ChannelType
} = require("discord.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");

module.exports = {
    name: { // Komutun ismi
        tr: "kanal",
        en: "channel"
    },
    id: "kanal", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kanal",
            "channel",
        ],
        en: [
            "channel",
            "chn"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Yazı ve ses kanallarında atılan mesaj ve durulan süreleri gösterir",
        en: "Shows the messages and time spent in text and voice channels"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kanal [#kanal veya Kanal ID'si]",
        en: "<px>channel [#channel or Channel ID]"
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

        const channel = Util.fetchChannel(msg);
        const guildIcon = msg.guild.iconURL();
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
        const channelMessagesCount = {};
        const channelVoiceTimes = {};
        let totalMessagesCount = 0;
        let totalVoiceTimes = 0;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.guild.name,
                iconURL: guildIcon
            })
            .setThumbnail(guildIcon)
            .setColor("Blue")
            .setTimestamp();

        const statMessages = allStatMessages(language);

        switch (channel?.type) {
            // Eğer yazı kanalı etiketlemişse
            case ChannelType.GuildText: {
                const USERS_IN_MESSAGE = 8;
                const allMessageDatas = [];
                let messageAuthorMessageCount = 0;

                const allStatDatas = Object.entries(guildDatabase.stats);

                // Bütün mesajları çek
                for (let i = 0; i < allStatDatas.length; i++) {
                    const [userId, data] = allStatDatas[i];

                    let messageCount = 0;
                    totalMessagesCount += data.totals.message;

                    // Kanalın bilgisini çek
                    const channelData = data.messages[channel.id];

                    // Eğer kanalın bilgisi varsa
                    if (channelData) {
                        const length = channelData.length;
                        messageCount += length;

                        // Bütün mesajlarda dolaş ve atılan süreye göre mesaj sayısını kaydet
                        for (let i = 0; i < length; i++) {
                            const timestamp = channelData[i];

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
                    if (messageCount > 0) {
                        allMessageDatas.push([userId, messageCount]);

                        // Eğer mesajı atan kişi ise mesaj sayısını kaydet
                        if (userId == authorId) messageAuthorMessageCount = messageCount;
                    }
                }

                allMessageDatas.sort((a, b) => b[1] - a[1]);

                // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
                const authorPosition = Util.binarySearch(allMessageDatas, messageAuthorMessageCount, authorId);
                const authorDataCopy = allMessageDatas[authorPosition];
                const topMessages = allMessageDatas.slice(0, USERS_IN_MESSAGE);
                if (authorPosition > USERS_IN_MESSAGE) topMessages.push(authorDataCopy);

                embed
                    .setDescription(
                        statMessages.descriptions.textChannel(channel.id, Util.toHumanize(totalMessagesCount))
                    )
                    .addFields(
                        {
                            name: statMessages.field.names.topMessageMember(USERS_IN_MESSAGE),
                            value: Util.stringOr(
                                topMessages.map(
                                    ([userId, messagesCount], index) => `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Util.toHumanize(messagesCount)}** ${statMessages.message}`
                                ).join("\n"),
                                language
                            )
                        },
                        {
                            name: "\u200b",
                            value: statMessages.field.values.allMessages(lastMessagesObject),
                            inline: true
                        }
                    )
            }
                break;

            // Eğer ses kanalı etiketlemişse
            case ChannelType.GuildVoice: {
                const USERS_IN_MESSAGE = 8;
                const allVoiceDatas = [];
                let messageAuthorVoiceTime = 0;

                const allStatDatas = Object.entries(guildDatabase.stats);

                // Bütün ses verilerini çek
                for (let i = 0; i < allStatDatas.length; i++) {
                    const [userId, data] = allStatDatas[i];
                    let authorVoiceTime = 0;

                    const authorData = JSON.parse(JSON.stringify(data));
                    totalVoiceTimes += authorData.totals.voice;

                    // Eğer şu anda bir ses kanalında varsa bunu da ekle
                    if (authorData.currVoice.channelId == channel.id) {
                        const channelId = authorData.currVoice.channelId;
                        const total = NOW_TIME - authorData.currVoice.startedTimestamp;
                        totalVoiceTimes += total;
                        authorVoiceTime += total;
                        authorData.voice[channelId] ??= Util.DEFAULTS.memberVoiceStat;
                        authorData.voice[channelId].datas.unshift({
                            duration: total,
                            startedTimestamp: authorData.currVoice.startedTimestamp,
                            endedTimestamp: NOW_TIME
                        })
                    }

                    // Kanalın bilgisini çek
                    const channelData = authorData.voice[channel.id];

                    // Eğer kanalın bilgisi varsa
                    if (channelData) {
                        authorVoiceTime += channelData.total;

                        // Bütün ses verilerinde dolaş ve süreyi yazdır
                        for (let i = 0; i < channelData.datas.length; i++) {
                            const {
                                duration,
                                endedTimestamp,
                                startedTimestamp
                            } = channelData.datas[i];

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

                    // Eğer ses süresi 0'dan büyükse ekle
                    if (authorVoiceTime > 0) {
                        allVoiceDatas.push([userId, authorVoiceTime]);

                        // Eğer mesajı atan kişi ise süreyi kaydet
                        if (userId === authorId) messageAuthorVoiceTime = authorVoiceTime;
                    }
                }

                allVoiceDatas.sort((a, b) => b[1] - a[1]);

                // Komutu kullanan kişinin sırasını çek, eğer mesajda gözükmeyecekse en sona ekle
                const authorPosition = Util.binarySearch(allVoiceDatas, messageAuthorVoiceTime, authorId);
                const authorDataCopy = allVoiceDatas[authorPosition];
                const topVoices = allVoiceDatas.slice(0, USERS_IN_MESSAGE);
                if (authorPosition >= USERS_IN_MESSAGE) topVoices.push(authorDataCopy);

                embed
                    .setDescription(
                        statMessages.descriptions.voiceChannel(channel.id, Time.duration(totalVoiceTimes, language))
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
                            name: "\u200b",
                            value: statMessages.field.values.allVoice(lastVoicesObject),
                            inline: true
                        }
                    )
            }
                break;

            // Eğer kanal veya geçerli bir kanal etiketlememişse hem ses hem de yazı kanal verilerini göster
            default: {
                const USERS_IN_MESSAGE = 8;

                const allStatDatas = Object.entries(guildDatabase.stats);

                // Bütün ses ve mesaj verilerini çek
                for (let i = 0; i < allStatDatas.length; i++) {
                    const [_, data] = allStatDatas[i];

                    const authorData = JSON.parse(JSON.stringify(data));
                    totalMessagesCount += authorData.totals.message;
                    totalVoiceTimes += authorData.totals.voice;

                    // Eğer şu anda bir ses kanalında varsa bunu da ekle
                    if (authorData.currVoice.channelId) {
                        const channelId = authorData.currVoice.channelId;
                        const total = NOW_TIME - authorData.currVoice.startedTimestamp;
                        totalVoiceTimes += total;
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

                        // Kanala atılan mesaj sayısını kaydet
                        channelMessagesCount[channelId] = channelMessagesCount[channelId] + length || length;

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
                }

                const topTextChannels = Object.entries(channelMessagesCount)
                    .sort(([_, count1], [__, count2]) => count2 - count1)
                    .slice(0, USERS_IN_MESSAGE);

                const topVoiceChannels = Object.entries(channelVoiceTimes)
                    .sort(([_, count1], [__, count2]) => count2 - count1)
                    .slice(0, USERS_IN_MESSAGE);

                embed
                    .setDescription(
                        statMessages.descriptions.allChannels
                    )
                    .addFields(
                        {
                            name: statMessages.field.names.message,
                            value: statMessages.field.values.messageSent(Util.toHumanize(totalMessagesCount))
                        },
                        {
                            name: statMessages.field.names.voice,
                            value: statMessages.field.values.voiceTime(Time.duration(totalVoiceTimes, language))
                        },
                        {
                            name: statMessages.field.names.topMessageChannel(USERS_IN_MESSAGE),
                            value: Util.stringOr(
                                topTextChannels.map(
                                    ([channelId, messagesCount], index) => `• \`#${index + 1}\` <#${channelId}> **${Util.toHumanize(messagesCount)}** ${statMessages.message}`
                                ).join("\n"),
                                language
                            )
                        },
                        {
                            name: statMessages.field.names.topVoiceChannel(USERS_IN_MESSAGE),
                            value: Util.stringOr(
                                topVoiceChannels.map(
                                    ([channelId, voiceCount], index) => `• \`#${index + 1}\` <#${channelId}> **${Time.duration(voiceCount, language)}**`
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
            }
                break;
        }

        return msg.reply({
            embeds: [
                embed
            ]
        });
    },
};