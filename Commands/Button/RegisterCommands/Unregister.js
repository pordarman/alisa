"use strict";
const database = require("../../../Helpers/Database.js");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: "kickUnregistered", // Butonun ismi
    id: "kayıtsız", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı kayıtsıza atar", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        guild,
        splitCustomId,
        guildId,
        authorId,
        errorEmbed,
        language
    }) {

        const intMember = int.member;
        const {
            commands: {
                kayıtsız: messages
            },
            roles: roleMessages,
            registers: registerMessages,
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

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix: guildDatabase.prefix,
                hasAdmin: intMember.permissions.has("Administrator")
            })
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMe = guild.members.me;
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed(permissionMessages.manageNicknames, "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;
        const roleNames = otherMessages.roleNames;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            roleMessages.roleNotSetRegister({
                roleName: roleNames.unregister,
                hasAdmin: intMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix: guildDatabase.prefix,
                    commandName: otherMessages.commandNames.unregisterRole
                }
            })
        );

        const memberId = splitCustomId[1];
        const member = await Util.fetchMemberForce(int.guild, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(memberMessages.isNotInGuild.member);

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibini kayıtsıza atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Kişinin rolü botun sırasının üstündeyse hata döndür
        const highestRole = guildMe.roles.highest;
        if (memberHighestRolePosition >= highestRole.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Eğer kayıtsız rolünün sırası botun üstündeyse hata döndür
        if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) return errorEmbed(roleMessages.roleIsHigherThanMe({
            roleId: unregisterRoleId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Eğer kişi zaten kayıtsıza atılmışsa
        if (member["_roles"].length == 1 && member["_roles"].includes(unregisterRoleId)) return errorEmbed(messages.already);

        // Kişinin ismini ayarla
        const memberName = Util.customMessages.unregisterName({
            message: guildDatabase.register.customNames.guildAdd,
            guildDatabase,
            name: member.user.displayName
        }).slice(0, Util.MAX.usernameLength);

        // Kişiyi düzenle
        member.edit({
            roles: Util.setMemberRolesWithInputRoles(member.roles.cache, [unregisterRoleId]),
            nick: memberName
        })
            // Eğer düzenleme başarılıysa
            .then(async () => {
                int.message.reply(messages.successButton({
                    authorId,
                    memberId
                }));

                const NOW_TIME = Date.now();

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const userLogObject = {
                    type: "unregister",
                    authorId,
                    timestamp: NOW_TIME,
                };
                userLogs.unshift(userLogObject);
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0
                        }
                    }
                });
            })
            // Eğer düzenleme başarısızsa
            .catch(err => {
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
                            content: memberMessages.memberIsHigherThanMeRoleAndName({
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