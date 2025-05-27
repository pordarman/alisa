"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yetkilirol",
        en: "authrole"
    },
    id: "yetkilirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yetkilirol",
            "authrole",
            "authorizedrole"
        ],
        en: [
            "authrole",
            "authorizedrole"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Yetkili rolünü ayarlarsınız",
        en: "You set the registrar role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yetkilirol <@rol veya Rol ID'si>",
        en: "<px>authrole <@role or Role ID>"
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
            if (!roleIds.registerAuth) return errorEmbed(roleMessages.alreadyReset(roleNames.registerAuth));

            roleIds.registerAuth = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.roleIds.registerAuth": ""
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.registerAuth), "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.registerAuth
            }),
            "warn"
        );
        const roleId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (roleIds.registerAuth === roleId) return errorEmbed(roleMessages.sameRole(roleNames.registerAuth));

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
        if (roleIds.unregister == roleId) return errorEmbed(roleMessages.errorRole({
            roleId,
            roleName: roleNames.unregister
        }));

        roleIds.registerAuth = roleId;
        await database.updateGuild(guildId, {
            $set: {
                "register.roleIds.registerAuth": roleId
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleIds: roleId,
                roleName: roleNames.registerAuth
            }),
            "success"
        );

    },
};