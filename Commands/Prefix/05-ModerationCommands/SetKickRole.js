"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kickyetkili",
        en: "kickauth"
    },
    id: "kickyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kickyetkili",
            "kickyetkilirolü",
            "kickauth",
        ],
        en: [
            "kickauth",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kick yetkili rolü ayarlarsınız",
        en: "You set the kick authorized role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kickyetkili <@rol veya Rol ID'si>",
        en: "<px>kickauth <@role or Role ID>"
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
        guildId,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            permissions: permissionMessages,
            roles: roleMessages,
            others: {
                roleNames
            },
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const content = args.join(" ");
        const roleIds = guildDatabase.moderation.roleIds;

        // Eğer ayarlanan kick rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.kickAuth) return errorEmbed(roleMessages.alreadyReset(roleNames.kickAuth));

            roleIds.kickAuth = "";
            await database.updateGuild(guildId, {
                $set: {
                    "moderation.roleIds.kickAuth": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.kickAuth), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.kickAuth
            }),
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(roleMessages.botRole);

        // Eğer etiketlediği rol kick yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.kickAuth) return errorEmbed(roleMessages.sameRole(roleNames.kickAuth));

        roleIds.kickAuth = role.id;
        await database.updateGuild(guildId, {
            $set: {
                "moderation.roleIds.kickAuth": role.id
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleIds: role.id,
                roleName: roleNames.kickAuth
            }),
            "success"
        );

    },
};