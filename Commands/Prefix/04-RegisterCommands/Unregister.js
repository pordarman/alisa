"use strict";
const database = require("../../../Helpers/Database.js");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtsız",
        en: "unregister"
    },
    id: "kayıtsız", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtsız",
            "kayıtsızat",
            "unregister"
        ],
        en: [
            "unregister"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı kayıtsıza atar",
        en: "Unregisters the user"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtsız <@kişi veya Kişi ID'si>",
        en: "<px>unregister <@user or User ID>"
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
                kayıtsız: messages
            },
            permissions: permissionMessages,
            members: memberMessages,
            roles: roleMessages,
            registers: registerMessages,
            missingDatas: missingDatasMessages,
            unknownErrors: unknownErrorMessages,
            others: {
                roleNames,
                commandNames
            }
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix,
                hasAdmin: msgMember.permissions.has("Administrator")
            })
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed(permissionMessages.manageNicknames, "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            roleMessages.roleNotSetRegister({
                roleName: roleNames.unregister,
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: commandNames.unregisterRole
                }
            })
        );

        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, args[0]);

        // Eğer kişiyi etiketlememişse
        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer komutu botun üzerinde denemeye çalışıyorsa
        if (member.user.bot) return errorEmbed(memberMessages.cantUseOn.bot);

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibini kayıtsıza atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

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
        if (member["_roles"].length == 1 && member["_roles"][0] == unregisterRoleId) return errorEmbed(messages.already);

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
                msg.reply(messages.success(memberId));

                const NOW_TIME = Date.now();

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const userLogObject = {
                    type: "unregister",
                    authorId,
                    timestamp: NOW_TIME
                };
                userLogs.unshift(userLogObject);
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0,
                        }
                    }
                });
            })
            // Eğer düzenleme başarısızsa
            .catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeRoleAndName({
                        memberId,
                        highestRoleId: Util.getBotOrHighestRole(guildMe).id
                    }),
                    allowedMentions: {
                        users: [],
                        roles: []
                    },
                    flags: MessageFlags.Ephemeral
                })

                console.error(err);
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                });
            });

    },
};