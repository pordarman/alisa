"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EmbedBuilder,
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "jail",
        en: "jail"
    },
    id: "jail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "jail",
        ],
        en: [
            "jail",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı Jail'e atar",
        en: "Jails the user"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>jail <@kişi veya Kişi ID'si> [Sebebi]",
        en: "<px>jail <@user or User ID> [Reason]"
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
                jail: messages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            missingDatas: missingDatasMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer botta gerekli yetkiler yoksa
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");
        if (!guildMePermissions.has("MoveMembers")) return errorEmbed(permissionMessages.moveMembers, "botPermissionError");

        // Eğer jail rolü ayarlı değilse
        const jailRoleId = guildDatabase.jail.roleId;
        if (!jailRoleId) return errorEmbed(
            roleMessages.roleNotSet({
                roleName: "Jail",
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: otherMessages.commandNames.jailRole
                }
            })
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(
            roleMessages.roleIsHigherThanMe({
                roleId: jailRoleId,
                highestRoleId: Util.getBotOrHighestRole(guildMe).id
            })
        );
        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, content);

        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kendini Jail'e atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibini Jail'e atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişi kendi rolünün üstündeki kişiyi Jail'e atmaya çalışıyorsa
        const memberHighestPosition = member.roles.highest.position;
        if (memberHighestPosition >= msgMember.roles.highest.position) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Eğer kişi zaten jailde ise
        if (member["_roles"].length == 1 && member["_roles"][0] == jailRoleId) return errorEmbed(messages.already);

        // Eğer Jail'e atmaya çalıştığı kişi botun rolünün üstündeyse
        if (memberHighestPosition >= highestRole.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
        const reason = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`), "").replace(/ +/g, " ").trim();

        // Kullanıcının şimdiki rollerini Database'ye kaydet
        const memberPrevRoles = member["_roles"];

        // Kullanıcının bütün rollerini al ve Jail'e at
        member.edit({
            roles: Util.setMemberRolesWithInputRoles(member.roles.cache, [jailRoleId]),
            channel: null
        })
            // Eğer Jail'e atma başarılıysa
            .then(async () => {
                msg.reply({
                    content: messages.jailed({
                        memberId,
                        reason
                    }),
                    allowedMentions: {
                        users: [memberId],
                        roles: [],
                        repliedUser: true
                    }
                });

                const NOW_TIME = Date.now();

                guildDatabase.jail.prevRoles[memberId] = memberPrevRoles;

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "jail",
                    authorId,
                    timestamp: NOW_TIME,
                    isJailed: true
                };
                userLogs.unshift(userLogObject);

                // Kişinin Jail'e atılma bilgilerini Database'ye kaydet
                const lastJailObject = {
                    timestamp: NOW_TIME,
                    reason,
                    authorId,
                    isTempJailed: false,
                    isJailed: true,
                    memberId
                };
                guildDatabase.jail.last.unshift(lastJailObject);

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0,
                        },
                        "jail.last": {
                            $each: [lastJailObject],
                            $position: 0
                        }
                    },
                    $set: {
                        [`jail.prevRoles.${memberId}`]: memberPrevRoles
                    }
                });

                // Eğer jail log kanalı varsa o kanala mesaj at
                const jailLogChannelId = guildDatabase.jail.logChannelId;
                if (jailLogChannelId) {
                    const modChannel = guild.channels.cache.get(jailLogChannelId);

                    // Eğer kanal varsa işlemleri devam ettir
                    if (modChannel) {
                        const memberAvatar = member.displayAvatarURL();

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                messages.embed.description({
                                    memberId,
                                    authorId,
                                    authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                    memberDisplayName: Util.escapeMarkdown(member.user.displayName),
                                    jailRoleId,
                                    reason
                                })
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: otherMessages.embedFooters.log,
                                iconURL: msg.client.user.displayAvatarURL()
                            })
                            .setTimestamp()

                        modChannel.send({
                            embeds: [
                                embed
                            ]
                        })
                    }

                }

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

                console.error(err);
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                });
            })

    },
};