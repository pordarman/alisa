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
        tr: "unjail",
        en: "unjail"
    },
    id: "unjail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "unjail",
        ],
        en: [
            "unjail",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı jail'den çıkarır",
        en: "Takes the user out of jail"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>unjail <@kişi veya Kişi ID'si>",
        en: "<px>unjail <@user or User ID>"
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
                unjail: messages
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
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

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

        // Eğer kendini Jail'den çıkarmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibini Jail'den çıkarmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişi zaten jailde değil ise
        if (!member["_roles"].includes(jailRoleId)) return errorEmbed(messages.notJailed);

        // Eğer Jail'den çıkarmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Kullanıcıyı Jail'e atmadan önce kaydedilen rolleri çek ve sil
        const memberPrevRoles = guildDatabase.jail.prevRoles[memberId] || [];

        // Kullanıcının jail'den çıkar ve bütün rollerini geri ver
        member.edit({
            roles: memberPrevRoles
        })
            // Eğer Jail'den çıkarma başarılıysa
            .then(async () => {
                msg.reply(messages.unjailed(memberId));

                const NOW_TIME = Date.now();

                delete guildDatabase.jail.prevRoles[memberId];

                // Eğer kullanıcı tempjaile atıldıysa setTimeout fonksiyonunu durdur
                const isSetTimeout = Util.maps.jailedMembers.get(guildId)?.get(memberId);
                if (isSetTimeout !== undefined) {
                    isSetTimeout();
                    Util.maps.jailedMembers.get(guildId).delete(memberId);
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "unjail",
                    authorId,
                    timestamp: NOW_TIME
                };
                userLogs.unshift(userLogObject);

                // Kişinin Jail'e atılma bilgilerini Database'ye kaydet
                const lastJailObject = {
                    timestamp: NOW_TIME,
                    authorId,
                    isJailed: false,
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
                    $unset: {
                        [`jail.prevRoles.${memberId}`]: ""
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
                                    jailRoleId
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