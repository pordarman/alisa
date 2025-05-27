"use strict";
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const {
    EmbedBuilder
} = require("discord.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");

module.exports = {
    name: { // Komutun ismi
        tr: "ben",
        en: "me"
    },
    id: "ben", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "ben",
            "me",
        ],
        en: [
            "me",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucunuzdaki bir üyenin mesaj ve ses istatistiklerini gösterir",
        en: "Shows the message and voice statistics of a member in your server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>ben [@kişi veya Kişi ID'si]",
        en: "<px>me [@user or User ID]"
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
        guild,
        msgMember,
        args,
        language,
        errorEmbed,
    }) {

        const member = msg.mentions.members.first() || await Util.fetchMember(guild, args[0]) || msgMember;

        const statMessages = allStatMessages(language);

        // Eğer kişi botsa
        if (member.user.bot) return errorEmbed(statMessages.botError);

        const memberId = member.id;
        const memberAvatar = member.displayAvatarURL();

        const NOW_TIME = Date.now();

        const DATAS_IN_MESSAGE = 8;
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
        const memberData = guildDatabase.stats[memberId] ??= Util.DEFAULTS.memberStat;

        const authorData = JSON.parse(JSON.stringify(memberData));

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

        const topTextChannels = Object.entries(channelMessagesCount)
            .sort(([_, count1], [__, count2]) => count2 - count1)
            .slice(0, DATAS_IN_MESSAGE);

        const topVoiceChannels = Object.entries(channelVoiceTimes)
            .sort(([_, count1], [__, count2]) => count2 - count1)
            .slice(0, DATAS_IN_MESSAGE);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.guild.name,
                iconURL: memberAvatar
            })
            .setDescription(
                statMessages.descriptions.me(memberId)
            )
            .addFields(
                {
                    name: statMessages.field.names.messageStats,
                    value: statMessages.field.values.meMessage(Util.toHumanize(totalMessagesCount)) +
                        Util.stringOr(
                            topTextChannels.map(
                                ([channelId, messagesCount], index) => `• \`#${index + 1}\` <#${channelId}> **${Util.toHumanize(messagesCount)}** ${statMessages.message}`
                            ).join("\n"),
                            language
                        )
                },
                {
                    name: statMessages.field.names.voiceStats,
                    value: statMessages.field.values.meVoice(Time.duration(totalVoiceTimes, language)) +
                        Util.stringOr(
                            topVoiceChannels.map(
                                ([channelId, voiceTime], index) => `• \`#${index + 1}\` <#${channelId}> **${Time.duration(voiceTime, language)}**`
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
            .setThumbnail(memberAvatar)
            .setColor("Random")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};