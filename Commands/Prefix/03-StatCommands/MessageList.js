"use strict";
const Util = require("../../../Helpers/Util.js");
const allStatMessages = require("../../../Helpers/Functions/ShowStats");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "mesajliste",
        en: "messagelist"
    },
    id: "mesajliste", // Komutun ID'si
    cooldown: 30, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "mesajliste",
            "ml",
            "messagelist",
            "msglist"
        ],
        en: [
            "messagelist",
            "ml",
            "msglist"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki mesaj atan bütün kişileri gösterir",
        en: "Shows all the people who send messages in the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>mesajliste",
        en: "<px>messagelist"
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
        language,
    }) {

        const sortUsers = Object.entries(guildDatabase.stats)
            .filter(([, datas]) => datas.totals.message)
            .sort((a, b) => b[1].totals.message - a[1].totals.message);

        const userIndex = Util.binarySearch(sortUsers, guildDatabase.stats[authorId]?.totals?.message ?? 0, authorId);
        const guildIcon = msg.guild.iconURL();

        const statMessages = allStatMessages(language);

        const {
            commands: {
                mesajliste: messages
            }
        } = allMessages[language];

        return createMessageArrows({
            msg,
            array: sortUsers,
            async arrayValuesFunc({ index, result: [userId, datas] }) {
                return `${userId == authorId ? "📌" : "•"} \`#${index + 1}\` <@${userId}> => **${Util.toHumanize(datas.totals.message, language)}** ${statMessages.message}`
            },
            embed: {
                author: {
                    name: guild.name,
                    iconURL: guildIcon
                },
                description: messages.embedDescription({
                    authorPosition: userIndex + 1,
                    authorMessageCount: Util.toHumanize(guildDatabase.stats[authorId]?.totals?.message ?? 0),
                }),
                thumbnail: guildIcon,
            },
            forwardAndBackwardCount: 20,
            VALUES_PER_PAGE: 20,
            language
        });

    },
};