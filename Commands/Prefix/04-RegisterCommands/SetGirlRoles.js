"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kızrol",
        en: "girlrole"
    },
    id: "kızrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kızrol",
            "kız-rol",
            "kız-rol-ayarla",
            "kızrolayarla",
            "girlrole",
            "girl-role",
            "setgirlrole",
            "set-girl-role"
        ],
        en: [
            "girlrole",
            "girlroles",
            "girl-role",
            "girl-roles",
            "setgirlrole",
            "setgirlroles",
            "set-girl-role",
            "set-girl-roles"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kız rollerini ayarlarsınız",
        en: "You set the girl roles"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kızrol <@roller veya Rollerin ID'leri>",
        en: "<px>girlrole <@roles or Role IDs>"
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
        guildMe,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            permissions: permissionMessages,
            registers: registerMessages,
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

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(
            registerMessages.registerTypeIs.member({
                prefix,
                hasAdmin: msgMember.permissions.has("Administrator")
            })
        )

        const content = args.join(" ");
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kız rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (roleIds.girl.length == 0) return errorEmbed(roleMessages.alreadyReset(roleNames.girl));

            roleIds.girl = [];
            await database.updateGuild(guildId, {
                $set: {
                    "register.roleIds.girl": []
                }
            });
            return errorEmbed(roleMessages.successReset(roleNames.girl), "success");
        }

        // Rolü ayarla
        const allRoles = Util.fetchRoles(msg);
        if (allRoles.size == 0) return errorEmbed(
            roleMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                roleName: roleNames.girl
            }),
            "warn"
        );


        // Eğer rollerin içinde bot rolü varsa hata döndür
        if (allRoles.some(role => role.managed)) return errorEmbed(roleMessages.botRole);

        // Eğer rollerin içinde kayıtsız rolü varsa hata döndür
        const unregisterRoleId = roleIds.unregister
        if (allRoles.has(unregisterRoleId)) return errorEmbed(roleMessages.errorRole({
            roleId: unregisterRoleId,
            roleName: roleNames.unregister
        }));

        // Eğer rollerin içinde yetkili rolü varsa hata döndür
        const authorizedRoleId = roleIds.registerAuth
        if (allRoles.has(authorizedRoleId)) return errorEmbed(roleMessages.errorRole({
            roleId: authorizedRoleId,
            roleName: roleNames.registerAuth
        }));

        // Eğer çok fazla rol etiketlemişse hata döndür
        if (allRoles.size > Util.MAX.mentionRoleForRegister) return errorEmbed(roleMessages.maxRoleError(Util.MAX.mentionRoleForRegister),);

        // Bazı rollerin sırası botun rollerinden üstteyse hata döndür
        const highestRole = guildMe.roles.highest;
        const rolesAboveFromMe = allRoles.filter(role => role.position >= highestRole.position);
        if (rolesAboveFromMe.size != 0) return errorEmbed(roleMessages.rolesAreHigherThanMe({
            roleIds: Util.mapAndJoin(rolesAboveFromMe, role => `<@&${role.id}>`, " | "),
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }))

        roleIds.girl = allRoles.map(role => role.id);
        await database.updateGuild(guildId, {
            $set: {
                "register.roleIds.girl": roleIds.girl
            }
        });
        return errorEmbed(
            roleMessages.successSet({
                roleName: roleNames.girl,
                roleIds: allRoles
            }),
            "success"
        );

    },
};