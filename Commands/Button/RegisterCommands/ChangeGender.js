"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes,
    MessageFlags,
    Message
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: "changeGender", // Butonun ismi
    id: "değiştir", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcının cinsiyetini değiştirir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        splitCustomId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const intMember = int.member;
        const {
            commands: {
                değiştir: messages
            },
            roles: roleMessages,
            registers: registerMessages,
            permissions: permissionMessages,
            members: memberMessages,
            others: otherMessages,
            unknownErrors: unknownErrorMessages,
            messageArrows: messageArrowsMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(messages.commandOnlyGender);

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix: guildDatabase.prefix,
                hasAdmin: intMember.permissions.has("Administrator")
            })
        );

        // Eğer botta "Rolleri Yönet" yetkisi yoksa hata döndür
        const guildMe = guild.members.me;
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

        const {
            boy: boyRoleIds,
            girl: girlRoleIds,
        } = guildDatabase.register.roleIds;

        // Eğer kız veya erkek rollerinden birisi yoksa hata döndür
        if (girlRoleIds.length == 0) return errorEmbed(
            roleMessages.rolesNotSetRegister({
                roleName: registerMessages.roleNames.girl,
                hasAdmin: intMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix: guildDatabase.prefix,
                    commandName: registerMessages.commandNames.girl
                }
            })
        );
        if (boyRoleIds.length == 0) return errorEmbed(
            roleMessages.rolesNotSetRegister({
                roleName: registerMessages.roleNames.boy,
                hasAdmin: intMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix: guildDatabase.prefix,
                    commandName: registerMessages.commandNames.boy
                }
            })
        );

        const memberId = splitCustomId[1];
        const member = await Util.fetchMemberForce(int.guild, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(memberMessages.isNotInGuild.member);

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer sunucu sahibinin rollerini değiştirmeye çalışıyorsa
        if (memberId === guild.ownerId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const highestRole = guildMe.roles.highest;
        if (member.roles.highest.position >= intMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const roleAboveTheBotRole = [...boyRoleIds, ...girlRoleIds].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position)
        if (roleAboveTheBotRole.length > 0) return errorEmbed(roleMessages.rolesAreHigherThanMe({
            roleIds: Util.mapAndJoin(roleAboveTheBotRole, roleId => `<@&${roleId}>`, " | "),
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }))

        // Kullanıcının rollerini bir set'e aktar ve oradan rollerini kontrol et
        const memberRolesSet = new Set(member["_roles"]);

        // Kişide erkek ve kız rolleri var mı kontrol ediyoruz
        const memberHasBoyRoles = boyRoleIds.every(roleId => memberRolesSet.has(roleId));
        const memberHasGirlRoles = girlRoleIds.every(roleId => memberRolesSet.has(roleId));
        const memberRoles = Util.getRolesExceptInputRoles(member["_roles"], [...boyRoleIds, ...girlRoleIds]);

        // Eğer ikisi de bulunmuyorsa
        if (!memberHasBoyRoles && !memberHasGirlRoles) return errorEmbed(messages.dontHaveBoyOrGirlRole(memberId));

        /**
         * Kullanıcının cinsiyetini değiştirir
         * @param {"boy" | "girl"} to 
         * @param {({ isButton: boolean, boyButton: ButtonBuilder, girlButton: ButtonBuilder, waitMessage: Message })} [options]
         * @returns {Promise<void>}
         */
        async function changeRoles(to, options = undefined) {
            const {
                isButton = false,
                boyButton,
                girlButton,
                waitMessage
            } = options ?? {};

            let messageContent;
            let roleIds;
            const buttonStyles = {
                boy: ButtonStyle.Secondary,
                girl: ButtonStyle.Secondary
            }

            // Eğer erkek rolü verilecekse
            if (to == "boy") {
                messageContent = messages.successTo.boy(memberId);
                roleIds = boyRoleIds;
                buttonStyles.boy = ButtonStyle.Success;
            } else {
                messageContent = messages.successTo.girl(memberId);
                roleIds = girlRoleIds;
                buttonStyles.girl = ButtonStyle.Success;
            }

            // Kullanıcıyı düzenle
            member.edit({
                roles: [
                    ...roleIds,
                    ...memberRoles
                ]
            })
                // Eğer düzenleme başarılıysa
                .then(async () => {
                    const NOW_TIME = Date.now();

                    if (isButton) {
                        // Düğmeleri etkisiz hale getir
                        boyButton
                            .setStyle(buttonStyles.boy)
                            .setDisabled(true);
                        girlButton
                            .setStyle(buttonStyles.girl)
                            .setDisabled(true);
                    }

                    const actionRow = new ActionRowBuilder()
                        .addComponents(
                            boyButton,
                            girlButton
                        );

                    const userLogs = guildDatabase.userLogs[memberId] ??= [];

                    // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                    const userLogObject = {
                        type: "changeRoles",
                        to,
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

                    if (isButton) {
                        return await waitMessage.edit({
                            content: messageContent,
                            components: [actionRow],
                            allowedMentions: {
                                users: [],
                                repliedUser: true
                            }
                        });
                    } else {
                        return int.reply({
                            content: messageContent,
                            allowedMentions: {
                                users: [],
                                repliedUser: true
                            }
                        });
                    }
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
                                content: memberMessages.memberIsHigherThanMeRole({
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
        }

        // Eğer hem erkek hem de kız rolü varsa
        if (memberHasBoyRoles && memberHasGirlRoles) {
            const allButtons = new ActionRowBuilder();

            const boyButton = new ButtonBuilder()
                .setLabel(otherMessages.roleNames.boy)
                .setEmoji(EMOJIS.boy)
                .setStyle(ButtonStyle.Primary)
                .setCustomId("COMMAND_CHANGE_BOY");

            const girlButton = new ButtonBuilder()
                .setLabel(otherMessages.roleNames.boy)
                .setEmoji(EMOJIS.girl)
                .setStyle(ButtonStyle.Primary)
                .setCustomId("COMMAND_CHANGE_GIRL");

            allButtons
                .addComponents(
                    boyButton,
                    girlButton
                );

            // Mesajı at ve cevap vermesini bekle
            const waitMessage = await int.reply({
                content: messages.selectGenderContent,
                components: [allButtons]
            });

            // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
            if (!waitMessage) return;

            const waitComponents = waitMessage.createMessageComponentCollector({
                filter: button => button.user.id == authorId,
                time: 15 * 1000, // 15 saniye boyunca kullanıcının işlem yapmasını bekle
            });

            // Eğer butona tıklarsa
            waitComponents.on("collect", async button => {
                const to = button.customId == "COMMAND_CHANGE_BOY" ? "boy" : "girl";

                return changeRoles(to, {
                    isButton: true,
                    boyButton,
                    girlButton,
                    waitMessage
                });
            });

            // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
            waitComponents.on("end", async () => {
                // Eğer mesaj silinmişse hiçbir şey yapma
                if (
                    !int.channel.messages.cache.has(waitMessage.id)
                ) return;

                // Butonları deaktif et
                boyButton
                    .setDisabled(true);
                girlButton
                    .setDisabled(true);

                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        boyButton,
                        girlButton
                    );

                return await waitMessage.edit({
                    content: `${messageArrowsMessages.inactive}\n` +
                        waitMessage.content,
                    components: [
                        actionRow
                    ]
                })
            });

        }
        // Eğer sadece erkek rolü varsa
        else if (memberHasBoyRoles) {
            return changeRoles("girl")
        }
        // Eğer sadece kız rolü varsa
        else {
            return changeRoles("boy");
        }
    },
};