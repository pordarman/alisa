"use strict";
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kişilog",
        en: "userlog"
    },
    id: "kişilog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kişilog",
            "klog",
            "userlog",
            "userlogs",
            "memberlog",
            "memberlogs"
        ],
        en: [
            "userlog",
            "userlogs",
            "memberlog",
            "memberlogs"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının bütün loglarını gösterir",
        en: "Shows all logs of the user"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kişilog <@kişi veya Kişi ID'si>",
        en: "<px>userlog <@user or User ID>"
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
                kişilog: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDataMessages
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

        // Eğer bir kişiyi etiketlememişse veya ID'sini girmemişse hata döndür
        if (!user) return errorEmbed(
            user === null ?
                missingDataMessages.wrongId :
                missingDataMessages.tag
        );

        const userLogs = guildDatabase.userLogs[user.id];

        // Eğer kullanıcı daha önceden hiç kayıt edilmemişse hata döndür
        if (!userLogs) return errorEmbed(messages.noData);

        const userAvatar = user.displayAvatarURL();
        return createMessageArrows({
            msg,
            array: userLogs,
            async arrayValuesFunc({
                result: input,
                length,
                index
            }) {
                return `• \`#${length - index}\` ${messages.typeToText(input)} - <t:${Util.msToSecond(input.timestamp)}:F>`
            },
            embed: {
                author: {
                    name: user.displayName,
                    iconURL: userAvatar
                },
                description: messages.description({
                    userId: user.id,
                    length: Util.toHumanize(userLogs.length, language)
                }),
                thumbnail: userAvatar,
            },
            forwardAndBackwardCount: 20,
            pageJoin: "\n\n",
            VALUES_PER_PAGE: 10,
            language
        });
    },
};