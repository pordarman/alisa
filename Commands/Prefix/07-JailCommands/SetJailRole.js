"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "jailrol",
        en: "jailrole"
    },
    id: "jailrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "jailrol",
            "jailrole",
        ],
        en: [
            "jailrole",
            "jail-role"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Jail rolü ayarlarsınız",
        en: "You set the jail role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>jailrol <@rol veya Rol ID'si>",
        en: "<px>jailrole <@role or Role ID>"
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

        // Eğer ayarlanan jail  kanalını sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!jail.roleId) return errorEmbed(roleMessages.alreadyReset(roleNames.jail));

            jail.roleId = "";
            await database.updateGuild(guildId, {
                $set: {
                    "jail.roleId": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.jail), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.jail
            }),
            "warn"
        );

        // Eğer rol bir bot rolüylse
        if (role.managed) return errorEmbed(roleMessages.botRole);

        // Eğer rol yetkili rolüyle aynıysa
        if (role.id == jail.authRoleId) return errorEmbed(roleMessages.errorRole({
            roleId: role.id,
            roleName: roleNames.jailAuth
        }));

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (role.id == jail.roleId) return errorEmbed(roleMessages.sameRole(roleNames.jail));

        jail.roleId = role.id;
        await database.updateGuild(guildId, {
            $set: {
                "jail.roleId": role.id
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleName: roleNames.jail,
                roleIds: role.id
            }),
            "success"
        );

    },
};