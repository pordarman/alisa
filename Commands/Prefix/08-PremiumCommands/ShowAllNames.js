"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "tümisimler",
        en: "allnames"
    },
    id: "tümisimler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "tümisimler",
            "tümisimleri",
        ],
        en: [
            "allnames"
        ]
    },
    description: { // Komutun açıklaması
        tr: "ID'si girdiğiniz kişinin kayıt edildiği bütün isimleri görürsünüz",
        en: "You will see all the names registered for the person whose ID you entered"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>tümisimler <@kişi veya Kişi ID'si>",
        en: "<px>tümisimler <@user or User ID>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        msgMember,
        args,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                tümisimler: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDataMessages,
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]);

        // Eğer kişi belirtilmemişse hata döndür
        if (!user) return errorEmbed(
            user === null ?
                missingDataMessages.wrongId :
                missingDataMessages.tag
        );

        const nameFiles = await database.getFile("members names");
        const nameData = nameFiles[user.id];

        // Eğer kişinin isim verisi yoksa hata döndür
        if (!nameData) return errorEmbed(messages.noData);

        const sortedNameData = [];
        for (const guildId in nameData) {
            sortedNameData.push(...nameData[guildId]);
        }
        sortedNameData.sort((a, b) => b.timestamp - a.timestamp);

        const userAvatar = user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: sortedNameData,
            async arrayValuesFunc({
                result: {
                    gender,
                    name,
                    timestamp
                },
                index,
                length
            }) {
                return `• \`#${length - index}\` ${Util.textToEmoji(gender)} **${Util.escapeMarkdown(name)}** - <t:${Util.msToSecond(timestamp)}:F>`
            },
            embed: {
                author: {
                    name: user.displayName,
                    iconURL: userAvatar
                },
                description: messages.description({
                    userId: user.id,
                    length: sortedNameData.length
                })
            },
            VALUES_PER_PAGE: 15,
            language
        });
    },
};