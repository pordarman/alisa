"use strict";
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sonkayıtlar",
        en: "lastregisters"
    },
    id: "sonkayıtlar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: ["sonkayıtlar",
            "sonkayıt",
            "kayıtson",
            "lastregister",
            "lastregisters"
        ],
        en: [
            "lastregisters",
            "lastregister",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun veya kullanıcının son kayıtlarını gösterir",
        en: "Shows the server's or user's last logs"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sonkayıtlar [@kişi veya Kişi ID'si]",
        en: "<px>lastregisters [@user or User ID]"
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
        args,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                "sonkayıtlar": messages
            }
        } = allMessages[language];

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]);

        let lastRegisters = [...guildDatabase.register.lastRegisters];

        // Eğer bir kişiyi etiketlemişse son kayıtları sadece onun yaptığı kayıtları göster
        if (user) {
            lastRegisters = lastRegisters.filter(({ authorId: userId }) => userId == user.id);
        }

        const length = lastRegisters.length;

        // Eğer kullanıcı daha önceden hiç kayıt etmemişse hata döndür
        if (!length) return errorEmbed(
            user ?
                messages.noRecordsUser :
                messages.noRecords
        );

        let authorName;
        let image;
        // Eğer kişiyi etiketlemişse
        if (user) {
            authorName = user.displayName;
            image = user.displayAvatarURL();
        } else {
            authorName = guild.name;
            image = guild.iconURL();
        }
        let embedDescription = user ? messages.totalUser(user.id) : messages.totalGuild

        return createMessageArrows({
            msg,
            array: lastRegisters,
            async arrayValuesFunc({
                result: {
                    gender,
                    memberId,
                    timestamp,
                    isAgainRegister
                }
            }) {
                return `• ${isAgainRegister ? "🔁 " : ""}(${Util.textToEmoji(gender)}) ${!user ? `<@${authorId}> => ` : ""}<@${memberId}> - <t:${Util.msToSecond(timestamp)}:F>`
            },
            embed: {
                author: {
                    name: authorName,
                    iconURL: image
                },
                description: `**• ${embedDescription} __${Util.toHumanize(length, language)}__ ${messages.recordFound}**`
            },
            forwardAndBackwardCount: 20,
            language,
            VALUES_PER_PAGE: 15
        });

    },
};