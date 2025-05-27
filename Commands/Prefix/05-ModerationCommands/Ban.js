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
        tr: "ban",
        en: "ban"
    },
    id: "ban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "ban",
            "banla",
            "yasakla"
        ],
        en: [
            "ban",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Etiketlediğiniz üyeyi sunucudan yasaklar",
        en: "Bans the member you tag from the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>ban <@kişi veya Kişi ID'si> [Sebep]",
        en: "<px>ban <@user or User ID> [Reason]"
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
                ban: messages
            },
            permissions: permissionMessages,
            missingDatas: missingDatasMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages,
            others: otherMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.moderation.roleIds.banAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("BanMembers")) return errorEmbed(permissionMessages.roleOrBan(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri Yasakla" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("BanMembers")) return errorEmbed(permissionMessages.ban, "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMePermissions.has("BanMembers")) return errorEmbed(permissionMessages.ban, "botPermissionError");

        const content = args.join(" ");
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, content);

        if (!user) return errorEmbed(
            user === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const userId = user.id;

        // Eğer kendini yasaklamaya çalışıyorsa
        if (userId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer kullanıcı sunucuda bulunuyorsa
        const guildMember = await Util.fetchMemberForce(msg.guild, userId);
        if (guildMember) {
            // Eğer sunucu sahibini yasaklamaya çalışıyorsa
            if (guildMember.id == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

            // Eğer kendi rolünün üstündeyse
            const memberHighestRolePosition = guildMember.roles.highest.position;
            if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId != guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(userId));

            // Eğer botun rolünün üstündeyse
            if (memberHighestRolePosition >= guildMe.roles.highest.position) return errorEmbed(memberMessages.memberIsHigherThanMe({
                memberId: userId,
                highestRoleId: Util.getBotOrHighestRole(guildMe).id
            }));
        }

        const reason = content.replace(
            new RegExp(`<@!?${userId}>|${userId}`),
            ""
        ).replace(/ +/g, " ").trim();

        // Üyeyi sunucudan yasaklama
        guild.members.ban(userId, {
            reason: messages.successBan({
                authorName: msg.author.tag,
                reason
            })
        })
            // Eğer yasaklama başarılı olursa
            .then(async () => {
                const NOW_TIME = Date.now();

                const setObject = {};

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!user.bot) {
                    penaltyNumber = guildDatabase.moderation.penaltyNumber++;
                    setObject["moderation.penaltyNumber"] = penaltyNumber;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[userId] ??= [];
                const userLogObject = {
                    type: "ban",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber
                };
                userLogs.unshift(userLogObject);

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${userId}`]: {
                            $each: [userLogObject],
                            $position: 0,
                        }
                    },
                    $set: setObject
                });

                const recreateUserName = Util.escapeMarkdown(user.displayName)

                msg.reply(
                    messages.successMsg({
                        userName: recreateUserName,
                        userId,
                        penaltyNumber,
                        guildMember
                    })
                )

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal yoksa hiçbir şey döndürme
                    if (!modChannel) return;

                    const userAvatar = user.displayAvatarURL();

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: user.displayName,
                            iconURL: userAvatar
                        })
                        .setDescription(
                            messages.embed.description({
                                userId,
                                authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                userDisplayName: recreateUserName,
                                reason,
                                penaltyNumber,
                                authorId,
                                banAt: Util.msToSecond(NOW_TIME)
                            })
                        )
                        .setThumbnail(userAvatar)
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
                    content: memberMessages.memberIsHigherThanMeBan({
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