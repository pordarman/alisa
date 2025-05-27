"use strict";
const {
    EmbedBuilder,
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kick",
        en: "kick"
    },
    id: "kick", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kick",
            "at",
            "sunucudanat"
        ],
        en: [
            "kick",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Etiketlediğiniz üyeyi sunucudan atar",
        en: "It kicks the member you tag from the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kick <@kişi veya Kişi ID'si> [Sebep]",
        en: "<px>kick <@user or User ID> [Reason]"
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
                kick: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDatasMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.moderation.roleIds.kickAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("KickMembers")) return errorEmbed(permissionMessages.roleOrKick(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri At" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("KickMembers")) return errorEmbed(permissionMessages.kick, "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMePermissions.has("KickMembers")) return errorEmbed(permissionMessages.kick, "botPermissionError");

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, content);

        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kendini yasaklamaya çalışıyorsa
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibini yasaklamaya çalışıyorsa
        if (member.id == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kendi rolünün üstündeyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId != guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Eğer botun rolünün üstündeyse
        if (memberHighestRolePosition >= guildMe.roles.highest.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        const reason = content.replace(
            new RegExp(`<@!?${memberId}>|${memberId}`),
            ""
        ).replace(/ +/g, " ").trim();

        // Üyeyi sunucudan yasaklama
        guild.members.kick(memberId, messages.successKick({
            authorName: msg.author.tag,
            reason
        }))
            // Eğer yasaklama başarılı olursa
            .then(async () => {
                const recreateUserName = Util.escapeMarkdown(member.user.displayName);
                const setObject = {};
                let penaltyNumber;

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncellelet penaltyNumber;
                if (!member.user.bot) {
                    penaltyNumber = guildDatabase.moderation.penaltyNumber++;
                    setObject["moderation.penaltyNumber"] = penaltyNumber;
                }

                const NOW_TIME = Date.now();


                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "kick",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber
                };
                userLogs.unshift(userLogObject);

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0,
                        }
                    },
                    $set: setObject
                });

                msg.reply(messages.successMsg({
                    userName: recreateUserName,
                    userId: memberId,
                    penaltyNumber,
                }));

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal yoksa hiçbir şey döndürme
                    if (!modChannel) return;

                    const memberAvatar = member.displayAvatarURL();

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: member.user.displayName,
                            iconURL: memberAvatar
                        })
                        .setDescription(
                            messages.embed.description({
                                userId: memberId,
                                authorId,
                                authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                userDisplayName: recreateUserName,
                                reason,
                                penaltyNumber,
                                kickAt: Util.msToSecond(NOW_TIME)
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
            })
            // Eğer yasaklama başarısız olursa
            .catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeKick({
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