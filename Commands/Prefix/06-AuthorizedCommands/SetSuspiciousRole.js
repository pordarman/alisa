"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "şüphelirol",
        en: "suspiciousrole"
    },
    id: "şüphelirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "şüphelirol",
            "şüpheli-rol",
            "suspiciousrole",
            "suspicious-role"
        ],
        en: [
            "suspiciousrole",
            "suspicious-role"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Şüpheli rolünü ayarlarsınız",
        en: "You set the suspect role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>şüphelirol <@rol veya Rol ID'si>",
        en: "<px>suspiciousrole <@role or Role ID>"
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
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan ban rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.roleId) return errorEmbed(roleMessages.alreadyReset(roleNames.suspicious));

            suspicious.roleId = "";
            await database.updateGuild(guildId, {
                $set: {
                    "suspicious.roleId": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.suspicious), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.suspicious
            }),
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(roleMessages.botRole);

        suspicious.roleId = role.id;
        await database.updateGuild(guildId, {
            $set: {
                "suspicious.roleId": role.id
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleIds: role.id,
                roleName: roleNames.suspicious
            }),
            "success"
        );

    },
};