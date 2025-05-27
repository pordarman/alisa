"use strict";
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sıra",
        en: "leaderboard"
    },
    id: "sıra", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sıra",
            "kayıtsıra",
            "leaderboard",
            "leader",
            "lb",
            "sunucusıra",
            "sunucusıralama",
        ],
        en: [
            "leaderboard",
            "leader",
            "lb"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun kayıt sıralamasını gösterir",
        en: "Shows the server's registration order"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sıra",
        en: "<px>leaderboard"
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
        guildMe,
        guild,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                "sıra": messages
            }
        } = allMessages[language];

        // Eğer komutu kullanan kişi de kayıt yapmışsa sunucuda kaçıncı olduğunu göster
        let guildRank;

        // Kayıt yetkililerini en fazladan en az olacak şekilde sırala
        const allRegisterAuths = Object.entries(guildDatabase.register.authorizedInfos)
            .filter(([_, { countables }]) => countables.total !== undefined)
            .sort(([_, { countables: countablesA }], [__, { countables: countablesB }]) => countablesB.total - countablesA.total)
            .map(([userId, { countables }], index) => {
                switch (userId) {

                    // Eğer kullanıcı komutu kullanan kişiyse
                    case authorId:
                        guildRank = index + 1;
                        return messages.rank.author({
                            userId,
                            total: countables.total,
                            indexEmoji: Util.stringToEmojis(index + 1)
                        });

                    // Eğer kullanıcı bot ise (Yani Alisa ise)
                    case guildMe.id:
                        return messages.rank.alisa({
                            userId,
                            total: countables.total,
                            indexEmoji: Util.stringToEmojis(index + 1)
                        });

                    default:
                        return messages.rank.user({
                            userId,
                            total: countables.total,
                            indexEmoji: Util.stringToEmojis(index + 1)
                        });
                }
            });

        const length = allRegisterAuths.length;

        // Eğer bu sunucuda daha önceden hiç kimse kayıt edilmemişse hata döndür
        if (!length) return errorEmbed(messages.noRecord);

        const guildIcon = guild.iconURL();

        return createMessageArrows({
            msg,
            array: allRegisterAuths,
            async result({
                startIndex,
                limit
            }) {
                return allRegisterAuths.slice(startIndex, startIndex + limit)
            },
            embed: {
                author: {
                    name: guild.name,
                    iconURL: guildIcon
                },
                description: messages.embedDescription({
                    length,
                    userRank: guildRank
                })
            },
            VALUES_PER_PAGE: 15,
            language
        });

    },
};