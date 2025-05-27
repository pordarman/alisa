"use strict";
const Util = require("../../../Helpers/Util.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "mesajkliste",
        en: "messageclist"
    },
    id: "mesajkliste", // Komutun ID'si
    cooldown: 30, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "mesajkanalliste",
            "mesajkliste",
            "mkl",
            "msgclist",
            "msgkliste"
        ],
        en: [
            "messagechannelist",
            "messageclist",
            "msgclist",
            "msgkliste"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki mesaj atılan bütün kanalları gösterir",
        en: "Shows all the channels where messages are sent in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>mesajkliste",
        en: "<px>messageclist"
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

            for (const channelId in datas.messages) {
                const length = datas.messages[channelId].length;

                // Kanala atılan mesaj sayısını kaydet
                channelDatas[channelId] = channelDatas[channelId] + length || length;
            }
        };
        const sortChannels = Object.entries(channelDatas).sort((a, b) => b[1] - a[1]);

        const guildIcon = msg.guild.iconURL();

        const statMessages = allStatMessages(language);

        return createMessageArrows({
            msg,
            array: sortChannels,
            async arrayValuesFunc({ index, result: [channelId, messageCount] }) {
                return `• \`#${index + 1}\` <#${channelId}> => **${Util.toHumanize(messageCount, language)}** ${statMessages.message}`
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