"use strict";
const database = require("../../../Helpers/Database.js");
const Time = require("../../../Helpers/Time");
const Util = require("../../../Helpers/Util.js");
const {
    EmbedBuilder,
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "mute",
        en: "mute"
    },
    id: "mute", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "mute",
            "sustur",
        ],
        en: [
            "mute",
            "mutemember"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı susturur",
        en: "Mutes the member"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>mute <@kişi veya Kişi ID'si> <Süre> [Sebebi]",
        en: "<px>mute <@user or User ID> <Duration> [Reason]"
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
                mute: messages
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
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("ModerateMembers")) return errorEmbed(permissionMessages.roleOrModerate(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyelere zaman aşımı uygula" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("ModerateMembers")) return errorEmbed(permissionMessages.moderate, "memberPermissionError");

        // Eğer botta "Üyelere zaman aşımı uygula" yetkisi yoksa
        if (!guildMePermissions.has("ModerateMembers")) return errorEmbed(permissionMessages.moderate, "botPermissionError");

        const content = args.join(" ");
        let member;
        let muteTime;
        let reason;

        // Eğer mesaj bir Message objesi değilse
        if (!Util.isMessage(msg)) {
            member = msg.mentions.members.first();
            muteTime = args[0];
            reason = args[1];
        } else {
            member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, content);
        }

        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kendine mute atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibine mute atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer susturmaya çalıştığı kişide "Yönetici" yetkisi varsa
        if (member.permissions.has("Administrator")) return errorEmbed(memberMessages.cantUseOn.admin);

        const memberPosition = member.roles.highest.position;
        // Eğer susturmaya çalıştığı kişi kendi rolünün üstündeyse
        if (msgMember.roles.highest.position <= memberPosition) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId))

        // Eğer susturmaya çalıştığı kişi botun rolünün üstündeyse
        if (memberPosition >= guildMe.roles.highest.position) return errorEmbed(memberMessages.memberIsHigherThanMeMute({
            memberId,
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Yazının içindeki bütün zaman değerlerini çek ve sil
        if (muteTime !== undefined) muteTime = Time.parseTime(muteTime);
        else {
            [reason, muteTime] = Time.parseTimeAndReplace(content);

            // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
            reason = reason.replace(new RegExp(`<@!?${memberId}>|${memberId}`), "").replace(/ +/g, " ").trim();
        }


        // Eğer susturma zamanını girmemişse hata döndür
        if (muteTime == 0) return errorEmbed(
            messages.enter({
                memberId,
                prefix
            }),
            "warn",
            30 * 1000 // Mesajı 30 saniye boyunca göster
        );

        // Eğer süre 1 saniyeden azsa veya 27 günden fazlaysa
        if (muteTime < Time.TIMES.second || muteTime > 27 * Time.TIMES.day) return errorEmbed(messages.wrongTime);

        // Eğer kullanıcı daha önceden susutulmuşsa önceki timeout fonksiyonunu iptal et
        const timeout = Util.maps.mutedMembers.get(guildId)?.get(memberId);
        if (timeout !== undefined) {
            timeout();
            Util.maps.mutedMembers.get(guildId).delete(memberId);
        }

        const msToHumanize = Time.duration(muteTime, language);

        // Kullanıcıyı sustur
        member.timeout(muteTime, messages.successMute({
            authorDisplayName: msg.author.displayName,
            muteTime: msToHumanize,
            reason
        }))
            // Eğer susturma başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                const setObject = {};

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!member.user.bot) {
                    penaltyNumber = guildDatabase.moderation.penaltyNumber++;
                    setObject["moderation.penaltyNumber"] = penaltyNumber;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];
                const userLogObject = {
                    type: "mute",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber,
                    duration: muteTime
                };
                userLogs.unshift(userLogObject);

                const message = await msg.reply({
                    content: messages.successMsg({
                        memberId,
                        msToHumanize,
                        reason,
                        penaltyNumber
                    }),
                    allowedMentions: {
                        users: [memberId],
                        roles: [],
                        repliedUser: true
                    },
                    withResponse: true
                }) || msg;

                // Kişinin mute bilgilerini Database'ye kaydet
                guildDatabase.moderation.nowMutedMembers[memberId] = {
                    timestamp: NOW_TIME,
                    expiresTimestamp: NOW_TIME + muteTime,
                    messageId: message.id,
                    authorId,
                    channelId: msg.channelId,
                    reason,
                    penaltyNumber,
                };
                setObject[`moderation.nowMutedMembers.${memberId}`] = guildDatabase.moderation.nowMutedMembers[memberId];

                // Database'yi güncelle
                await database.updateGuild(guildId, {
                    $set: setObject,
                    $push: {
                        [`userLogs.${memberId}`]: {
                            $each: [userLogObject],
                            $position: 0,
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

                        const muteOpenAt = Date.now() + muteTime;

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                messages.embedMute.description({
                                    memberId,
                                    authorId,
                                    authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                    memberDisplayName: Util.escapeMarkdown(member.user.displayName),
                                    muteAt: Util.msToSecond(NOW_TIME),
                                    reason,
                                    msToHumanize,
                                    muteOpenAt: Util.msToSecond(muteOpenAt),
                                    penaltyNumber
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

                // Kişinin susturulması açıldığında bilgilendirme mesajı gönder
                if (!Util.maps.mutedMembers.has(guildId)) Util.maps.mutedMembers.set(guildId, new Map());
                Util.maps.mutedMembers.get(guildId).set(memberId,
                    Util.setTimeout(async () => {
                        // Önbellekteki veriyi sil
                        Util.maps.mutedMembers.get(guildId)?.delete(memberId);

                        const guildDatabase = await database.getGuild(guildId);

                        // Kişinin mutesi bittiği için Database'deki veriyi sil
                        delete guildDatabase.moderation.nowMutedMembers[memberId];

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
                            $unset: {
                                [`moderation.nowMutedMembers.${memberId}`]: ""
                            },
                            $push: {
                                [`userLogs.${memberId}`]: {
                                    $each: [userLogObject],
                                    $position: 0,
                                }
                            }
                        });

                        // Kişinin susturulması kaldırıldığında mesajı gönder
                        message.reply(messages.unmute(memberId));

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
                                    messages.embedUnmute.description({
                                        memberId,
                                        authorId,
                                        authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                                        memberDisplayName: Util.escapeMarkdown(member.user.displayName),
                                        muteAt: Util.msToSecond(NOW_TIME),
                                        reason,
                                        msToHumanize,
                                        penaltyNumber
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
                    }, muteTime)
                );

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeMute({
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