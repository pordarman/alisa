"use strict";
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "şüpheli",
        en: "suspicious"
    },
    id: "şüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "şüpheli",
            "şüpheliat",
            "suspicious"
        ],
        en: [
            "suspicious"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı şüpheliye atar",
        en: "Kick user to suspect"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>şüpheli <@kişi veya Kişi ID'si>",
        en: "<px>suspicious <@user or User ID>"
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
        guildMePermissions,
        guild,
        msgMember,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                şüpheli: messages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            missingDatas: missingDatasMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

        const member = await Util.fetchMemberForce(msg.guild, args[0]);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kullanıcı kendi kendini şüpheliye atmaya çalışıyorsa
        if (memberId === authorId) return errorEmbed(memberMessages.cantUseOn.yourself)

        // Eğer sunucu sahibini şüpheliye atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer şüpheli rolü ayarlanmamışsa
        const suspiciousRoleId = guildDatabase.suspicious.roleId;
        if (!suspiciousRoleId) return errorEmbed(
            roleMessages.roleNotSet({
                roleName: otherMessages.roleNames.suspicious,
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: otherMessages.commandNames.suspiciousRole
                }
            })
        );

        // Eğer kullanıcıda şüpheli rol zate varsa
        if (member["_roles"].includes(suspiciousRoleId)) return errorEmbed(messages.alreadySuspect);

        // Kullanıcıyı düzenle
        member.edit({
            roles: Util.setMemberRolesWithInputRoles(member.roles.cache, [suspiciousRoleId])
        })
            // Eğer düzenleme başarılıysa
            .then(async () => {
                msg.reply(messages.success({
                    memberId,
                    authorId
                }));

                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "suspicious",
                    author: authorId,
                    timestamp: NOW_TIME,
                };
                userLogs.unshift(userLogObject);

                // Database'yi kaydet
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0,
                        }
                    }
                });

                return;
            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeRole({
                        memberId,
                        highestRoleId: Util.getBotOrHighestRole(guildMe).id
                    }),
                    allowedMentions: {
                        users: [],
                        roles: []
                    },
                    flags: MessageFlags.Ephemeral
                });

                console.error(err)
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                });
            });

    },
};