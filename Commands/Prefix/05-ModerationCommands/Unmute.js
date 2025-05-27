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
        tr: "unmute",
        en: "unmute"
    },
    id: "unmute", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "unmute",
        ],
        en: [
            "unmute",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının susturmasını kaldırır",
        en: "Unmutes the user"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>unmute <@kişi veya Kişi ID'si>",
        en: "<px>unmute <@user or User ID>"
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
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                unmute: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDatasMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages,
            members: memberMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.moderation.roleIds.muteAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("ModerateMembers")) return errorEmbed(permissionMessages.roleOrModerate(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyelere zaman aşımı uygula" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("ModerateMembers")) return errorEmbed(permissionMessages.moderate, "memberPermissionError");

        // Eğer botta "Üyelere zaman aşımı uygula" yetkisi yoksa
        if (!guildMePermissions.has("ModerateMembers")) return errorEmbed(permissionMessages.moderate, "botPermissionError");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, args[0]);

        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kendinin mutesini açmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibinin mutesini açmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişi zaten muteli değil ise
        if (!member.communicationDisabledUntilTimestamp) return errorEmbed(messages.already);

        // Eğer mutesini açmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= guildMe.roles.highest.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Kullanıcının mutesini kaldır
        member.disableCommunicationUntil(null, messages.successUnmute(msg.author.tag))
            // Eğer muteyi kaldırma işlemi başarılıysa
            .then(async () => {
                msg.reply(messages.successMsg(memberId));

                const NOW_TIME = Date.now();

                // Kullanıcının mutesini açmadan önce önceki mesaj atma setTimeout fonksiyonunu kaldır
                const isSetTimeout = Util.maps.mutedMembers.get(guildId)?.get(memberId);
                if (isSetTimeout !== undefined) {
                    isSetTimeout();
                    Util.maps.mutedMembers.get(guildId).delete(memberId);
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "unmute",
                    authorId,
                    timestamp: NOW_TIME
                };
                userLogs.unshift(userLogObject);

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0
                        }
                    }
                });

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

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
                                    unmuteAt: Util.msToSecond(NOW_TIME),
                                    memberDisplayName: Util.escapeMarkdown(member.user.displayName)
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
                    content: memberMessages.memberIsHigherThanMeUnmute({
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