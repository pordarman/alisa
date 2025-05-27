"use strict";
const Time = require("../../../Helpers/Time");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "sesliste",
        en: "voicelist"
    },
    id: "sesliste", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sesliste",
            "sl",
            "seslistesi",
            "voicelist",
        ],
        en: [
            "voicelist",
            "vl",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki en çok seste duran kişileri gösterir",
        en: "Shows the people who are in the most voice channels in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sesliste",
        en: "<px>voicelist"
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
        guild,
        guildDatabase,
        authorId,
        language
    }) {
        const NOW_TIME = Date.now();

        const sortUsers = [];
        let messageAuthorVoiceTime = 0;

        for (const userId in guildDatabase.stats) {
            const datas = guildDatabase.stats[userId];
            let totalVoiceTime = datas.totals.voice;

            // Eğer şu anda bir ses kanalında varsa bunu da ekle
            if (datas.currVoice.channelId) {
                const total = NOW_TIME - datas.currVoice.startedTimestamp;
                totalVoiceTime += total;
            }

            // Eğer ses süresi 0'dan büyükse ekle
            if (totalVoiceTime > 0) {
                sortUsers.push([userId, totalVoiceTime]);

                // Eğer mesajı atan kişi ise süresini kaydet
                if (userId == authorId) messageAuthorVoiceTime = totalVoiceTime;
            }
        }

        const userIndex = Util.binarySearch(sortUsers, messageAuthorVoiceTime, authorId);
        const guildIcon = msg.guild.iconURL();

        const {
            commands: {
                sesliste: messages
            }
        } = allMessages[language];

        return createMessageArrows({
            msg,
            array: sortUsers,
            async arrayValuesFunc({ index, result: [userId, totalVoiceTime] }) {
                return `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> **${Time.duration(totalVoiceTime, language)}**`
            },
            embed: {
                author: {
                    name: guild.name,
                    iconURL: guildIcon
                },
                description: messages.embedDescription({
                    authorPosition: userIndex + 1,
                    authorDuration: Time.duration(guildDatabase.stats[authorId]?.totals?.voice ?? 0, language, { dateStyle: "short" }),
                }),
                thumbnail: guildIcon,
            },
            forwardAndBackwardCount: 10,
            VALUES_PER_PAGE: 15,
            language
        });

    },
};