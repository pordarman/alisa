"use strict";
const Time = require("../../../Helpers/Time");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "seskliste",
        en: "voiceclist"
    },
    id: "seskliste", // Komutun ID'si
    cooldown: 10, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "seskanalliste",
            "seskliste",
            "skl",
            "voiceclist",
            "voicekliste"
        ],
        en: [
            "voicechannelist",
            "voiceclist",
            "vclist",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki en çok seste durulan kanalları gösterir",
        en: "Shows the top voice channels in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>seskliste",
        en: "<px>voiceclist"
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
        language,
    }) {

        const channelDatas = {};

        for (const userId in guildDatabase.stats) {
            const datas = guildDatabase.stats[userId];

            for (const channelId in datas.voice) {
                const length = datas.voice[channelId].total;

                // Kanala atılan mesaj sayısını kaydet
                channelDatas[channelId] = channelDatas[channelId] + length || length;
            }
        };
        const sortChannels = Object.entries(channelDatas).sort((a, b) => b[1] - a[1]);

        const guildIcon = msg.guild.iconURL();

        return createMessageArrows({
            msg,
            array: sortChannels,
            async arrayValuesFunc({ index, result: [channelId, duration] }) {
                return `• \`#${index + 1}\` <#${channelId}> => **${Time.duration(duration, language)}**`
            },
            embed: {
                author: {
                    name: guild.name,
                    iconURL: guildIcon
                },
                thumbnail: guildIcon,
            },
            forwardAndBackwardCount: 20,
            VALUES_PER_PAGE: 20,
            language
        });

    },
};