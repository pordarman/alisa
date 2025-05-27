"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtsızrol",
        en: "unregisterrole"
    },
    id: "kayıtsızrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtsızrol",
            "alınacakrol",
            "unregisterrole"
        ],
        en: [
            "unregisterrole",
            "unregisteredrole",
            "unregister-role",
            "unregistered-role"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıtsız rolünü ayarlarsınız",
        en: "You set the Unregistered role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtsızrol <@rol veya Rol ID'si>",
        en: "<px>unregisterrole <@role or Role ID>"
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
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.unregister) return errorEmbed(roleMessages.alreadyReset(roleNames.unregister));

            roleIds.unregister = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.roleIds.unregister": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.unregister), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.unregister
            }),
            "warn"
        );
        const roleId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (roleIds.unregister === roleId) return errorEmbed(roleMessages.sameRole(roleNames.unregister));

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(roleMessages.botRole);


        // Eğer rol başka bir role daha aitse hata döndür
        if (roleIds.boy.includes(roleId)) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.boy
        }));
        if (roleIds.girl.includes(roleId)) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.girl
        }));
        if (roleIds.member.includes(roleId)) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.member
        }));
        if (roleIds.bot.includes(roleId)) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.bot
        }));
        if (roleIds.registerAuth == roleId) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.registerAuth
        }));

        roleIds.unregister = roleId;
        await database.updateGuild(guildId, {
            $set: {
                "register.roleIds.unregister": roleId
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleIds: roleId,
                roleName: roleNames.unregister
            }),
            "success"
        );

    },
};