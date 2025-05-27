"use strict";
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "isimler",
        en: "names"
    },
    id: "isimler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: {  // Komutun diğer çağırma isimleri
        tr: [
            "isimler",
            "isimleri",
            "names"
        ],
        en: [
            "names"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının daha önceki isimlerini gösterir",
        en: "Shows the user's previous names"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>isimler <@kişi veya Kişi ID'si>",
        en: "<px>names <@user or User ID>"
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
        msgMember,
        args,
        language,
        errorEmbed,
    }) {
        const {
            commands: {
                isimler: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDatasMessages
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
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const prevNames = guildDatabase.register.prevNamesOfMembers[user.id];

        // Eğer kullanıcı daha önceden hiç kayıt edilmemişse hata döndür
        if (!prevNames) return errorEmbed(messages.missingDatas);

        const userAvatar = user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: prevNames,
            async arrayValuesFunc({
                result: {
                    gender,
                    name,
                    roles,
                    authorId,
                    timestamp,
                },
                length,
                index
            }) {
                return `• \`#${length - index}\` ${Util.textToEmoji(gender)} **${Util.escapeMarkdown(name)}** (${roles}) (**${messages.registrar}:** <@${authorId}>) - <t:${Util.msToSecond(timestamp)}:F>`
            },
            embed: {
                author: {
                    name: user.displayName,
                    iconURL: userAvatar
                },
                description: messages.embedDescription({
                    userId: user.id,
                    length: prevNames.length
                })
            },
            pageJoin: "\n\n",
            VALUES_PER_PAGE: 10,
            language
        });

    },
};