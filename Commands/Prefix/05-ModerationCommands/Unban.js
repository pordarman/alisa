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
        tr: "unban",
        en: "unban"
    },
    id: "unban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "unban",
            "yasakkaldır"
        ],
        en: [
            "unban",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucudaki yasaklı üyenin yasağını kaldırırsınız",
        en: "You unban the banned member on the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>unban <Kişi ID'si>",
        en: "<px>unban <Person ID>"
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
                unban: messages
            },
            permissions: permissionMessages,
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

        const userId = args[0]?.replace(/[<@!>]/g, "");

        // Eğer girdiği ID geçerli bir ID değilse 
        if (!userId || !/\d{17,19}/.test(userId)) return errorEmbed(messages.enter(prefix), "warn");

        const guildBans = await guild.bans.fetch({ user: userId }).catch(() => null);

        // Eğer girdiği ID yasaklanan kişilerde yoksa hata döndür
        if (!guildBans) return errorEmbed(messages.already);

        // Üyenin yasağını kaldır
        guild.members.unban(userId)
            // Eğer yasak kaldırma başarılı olursa
            .then(async (user) => {
                const recreateUserName = Util.escapeMarkdown(user.displayName);

                msg.reply(messages.success({
                    userName: recreateUserName,
                    userId
                }));

                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[userId] ??= [];
                const userLogObject = {
                    type: "unban",
                    authorId,
                    timestamp: NOW_TIME
                }
                userLogs.unshift(userLogObject);

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $push: {
                        [`userLogs.${userId}`]: {
                            $each: [userLogObject],
                            $position: 0
                        }
                    }
                });

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
                                authorId,
                                authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                unbanAt: Util.msToSecond(NOW_TIME),
                                userDisplayName: recreateUserName
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
            // Eğer yasak kaldırma başarısız olursa
            .catch(err => {
                switch (err.code) {
                    case RESTJSONErrorCodes.UnknownBan:
                        return errorEmbed(messages.already);

                    case RESTJSONErrorCodes.MissingPermissions:
                        return msg.reply({
                            content: memberMessages.memberIsHigherThanMeUnmute({
                                memberId: userId,
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            }),
                            allowedMentions: {
                                users: [],
                                roles: []
                            },
                            flags: MessageFlags.Ephemeral
                        });

                    default:
                        console.error(err);
                        return msg.reply({
                            content: unknownErrorMessages.unknownError(err),
                            flags: MessageFlags.Ephemeral
                        });
                }
            })
    },
};