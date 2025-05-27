"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "jailyetkili",
        en: "jailauth"
    },
    id: "jailyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "jailyetkili",
            "jailyetkilirolü",
            "jailauth",
        ],
        en: [
            "jailauth",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Jail yetkili rolü ayarlarsınız",
        en: "You set the jail authorized role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>jailyetkili <@rol veya Rol ID'si>",
        en: "<px>jailauth <@role or Role ID>"
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
        const jail = guildDatabase.jail;

        // Eğer ayarlanan mute rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!jail.authRoleId) return errorEmbed(roleMessages.alreadyReset(roleNames.jailAuth));

            jail.authRoleId = "";
            await database.updateGuild(guildId, {
                $set: {
                    "jail.authRoleId": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.jailAuth), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.jailAuth
            }),
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(roleMessages.botRole);

        // Eğer rol jail rolüyle aynıysa hata döndür
        if (role.id == jail.roleId) return errorEmbed(roleMessages.errorRole({
            roleId: role.id,
            roleName: roleNames.jail
        }));

        // Eğer etiketlediği rol mute yetkili rolüyle aynıysa hata döndür
        if (role.id == jail.authRoleId) return errorEmbed(roleMessages.sameRole(roleNames.jailAuth));

        jail.authRoleId = role.id;
        await database.updateGuild(guildId, {
            $set: {
                "jail.authRoleId": role.id
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleName: roleNames.jailAuth,
                roleIds: role.id
            }),
            "success"
        );

    },
};