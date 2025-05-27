"use strict";
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: "suspicious", // Butonun ismi
    id: "şüpheli", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kick user to suspect", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        splitCustomId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const intMember = int.member;
        const {
            commands: {
                şüpheli: messages
            },
            roles: roleMessages,
            permissions: permissionMessages,
            members: memberMessages,
            others: otherMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        const guildMe = guild.members.me;
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

        const member = await Util.fetchMemberForce(guild, splitCustomId[1]);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(memberMessages.isNotInGuild.member);

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
                hasAdmin: intMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix: guildDatabase.prefix,
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
                int.message.reply(messages.success({
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
                            $position: 0
                        }
                    }
                });
                return;
            }).catch(err => {
                switch (err.code) {
                    // Eğer kişi sunucuda değilse
                    case RESTJSONErrorCodes.UnknownMember:
                        return int.reply({
                            content: memberMessages.isNotInGuild.member,
                            flags: MessageFlags.Ephemeral
                        });

                    // Eğer botun rolü yüksekse
                    case RESTJSONErrorCodes.MissingPermissions:
                        return int.reply({
                            content: memberMessages.memberIsHigherThanMeSuspicious({
                                memberId,
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id,
                            }),
                            flags: MessageFlags.Ephemeral
                        });

                    // Eğer hatanın sebebi başka bir şeyse
                    default:
                        console.error(err)
                        return int.reply({
                            content: unknownErrorMessages.unknownError(err),
                            flags: MessageFlags.Ephemeral
                        });
                }
            });
    },
};