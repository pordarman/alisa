"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS
} = require("../../../settings.json");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "vip",
        en: "vip"
    },
    id: "vip", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "vip",
            "viprol",
            "vip-rol",
            "vipyetkili",
            "vipver",
            "vip-ver"
        ],
        en: [
            "vip",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Vip ile ilgili komutları gösterir",
        en: "Shows VIP related commands"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>vip <Seçenekler>",
        en: "<px>vip <Options>"
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
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                vip: messages
            },
            roles: roleMessages,
            permissions: permissionMessages,
            members: memberMessages,
            missingDatas: missingDatasMessages,
            unknownErrors: unknownErrorMessages,
            others: {
                roleNames,
                commandHelpers
            },
            switchs: {
                vip: switchKey
            },
            sets: {
                resets: resetsSet
            }
        } = allMessages[language];

        // Girdiği seçeneklere göre kodu çalıştır
        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {

            // Eğer vip rolü ayarlamak istiyorsa
            case "role": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

                const content = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (resetsSet.has(content.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vip == "") return errorEmbed(roleMessages.alreadyReset(roleNames.vip));

                    // Database'ye kaydet
                    guildDatabase.roleIds.vip = "";
                    await database.updateGuild(guildId, {
                        $set: {
                            "roleIds.vip": ""
                        }
                    });

                    return errorEmbed(roleMessages.successReset(roleNames.vip), "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    roleMessages.ifYouSet({
                        prefix,
                        commandName: `${this.name[language]} ${commandHelpers.role}`,
                        roleName: roleNames.vip
                    }),
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(roleMessages.botRole);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vip === role.id) return errorEmbed(roleMessages.sameRole(roleNames.vip));

                // Eğer vip yetkili rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vipAuth) return errorEmbed(roleMessages.errorRole({
                    roleId: role.id,
                    roleName: roleNames.vipAuth
                }));

                // Database'ye kaydet
                guildDatabase.roleIds.vip = role.id;
                await database.updateGuild(guildId, {
                    $set: {
                        "roleIds.vip": role.id
                    }
                });
                return errorEmbed(roleMessages.successSet({
                    roleName: roleNames.vip,
                    roleIds: role.id
                }), "success");
            }

            // Eğer vip yetkili rolünü ayarlamak istiyorsa
            case "authorized": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

                const roleId = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (resetsSet.has(roleId.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vipAuth == "") return errorEmbed(roleMessages.alreadyReset(`VIP ${messages.authorized}`));

                    // Database'ye kaydet
                    guildDatabase.roleIds.vipAuth = "";
                    await database.updateGuild(guildId, {
                        $set: {
                            "roleIds.vipAuth": ""
                        }
                    });

                    return errorEmbed(roleMessages.successReset(`VIP ${messages.authorized}`), "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    roleMessages.ifYouSet({
                        prefix,
                        commandName: `${this.name[language]} ${commandHelpers.authorized}`,
                        roleName: roleNames.vipAuth,
                    }),
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(roleMessages.botRole);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vipAuth === role.id) return errorEmbed(roleMessages.sameRole(`VIP ${messages.authorized}`));

                // Eğer vip rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vip) return errorEmbed(roleMessages.errorRole({
                    roleId: role.id,
                    roleName: roleNames.vip
                }));

                // Database'ye kaydet
                guildDatabase.roleIds.vipAuth = role.id;
                await database.updateGuild(guildId, {
                    $set: {
                        "roleIds.vipAuth": role.id
                    }
                });
                return errorEmbed(roleMessages.successSet({
                    roleName: roleNames.vipAuth,
                    roleIds: role.id
                }), "success");
            }

            // Eğer vip rolünü almak istiyorsa
            case "take": {
                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

                const memberId = args[1];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed(missingDatasMessages.tag);

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: roleNames.vip,
                        hasAdmin: msgMember.permissions.has("Administrator"),
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.role}`
                        }
                    })
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        missingDatasMessages.tag :
                        missingDatasMessages.wrongId
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed(memberMessages.cantUseOn.bot);

                if (!member["_roles"].includes(vipRoleId)) return errorEmbed(messages.hasNoVipRole);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId)?.position >= highestRole.position) return errorEmbed(roleMessages.roleIsHigherThanMe({
                    roleId: vipRoleId,
                    highestRoleId: Util.getBotOrHighestRole(guildMe).id
                }));

                // Kullanıcıdan rolü almayı dene
                member.roles.remove(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        Util.isMessage(msg) ?
                            // Eğer mesaj bir Message objesi ise
                            msg.react(EMOJIS.yes) :
                            // Eğer mesaj bir Interaction objesi ise
                            errorEmbed(messages.successRemove(memberId), "success");
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                            content: memberMessages.memberIsHigherThanMeRoleAndName({
                                memberId: member.id,
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            }),
                            allowedMentions: {
                                users: [],
                                roles: []
                            },
                            flags: MessageFlags.Ephemeral
                        });

                        console.error(err);
                        return msg.reply({
                            content: unknownErrorMessages.unknownError(err),
                            flags: MessageFlags.Ephemeral
                        });
                    })
            }

            // Eğer hiçbir şey girmemişse
            default: {
                const memberId = args[0];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed(
                    messages.infoMessage(prefix),
                    "warn"
                );

                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: roleNames.vip,
                        hasAdmin: msgMember.permissions.has("Administrator"),
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.role}`
                        }
                    })
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        missingDatasMessages.tag :
                        missingDatasMessages.wrongId
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed(memberMessages.cantUseOn.bot);

                if (member["_roles"].includes(vipRoleId)) return errorEmbed(messages.hasVipRole);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId)?.position >= highestRole.position) return errorEmbed(
                    roleMessages.roleIsHigherThanMe({
                        roleId: vipRoleId,
                        highestRoleId: Util.getBotOrHighestRole(guildMe).id
                    })
                );

                // Kullanıcıya rolü vermeyi dene
                member.roles.add(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        Util.isMessage(msg) ?
                            // Eğer mesaj bir Message objesi ise
                            msg.react(EMOJIS.yes) :
                            // Eğer mesaj bir Interaction objesi ise
                            errorEmbed(messages.successGive(memberId), "success");
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                            content: memberMessages.memberIsHigherThanMeRoleAndName({
                                memberId: member.id,
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            }),
                            allowedMentions: {
                                users: [],
                                roles: []
                            },
                            flags: MessageFlags.Ephemeral
                        });

                        console.error(err);
                        return msg.reply({
                            content: unknownErrorMessages.unknownError(err),
                            flags: MessageFlags.Ephemeral
                        });
                    })
            }
        }

    },
};