"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RESTJSONErrorCodes,
    Message,
    MessageFlags
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "değiştir",
        en: "change"
    },
    id: "değiştir", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "değiştir",
            "roldeğiştir",
            "değiştirrol",
            "rollerideğiştir",
            "cinsiyetideğiştir",
            "change",
            "changerole",
            "changeroles"
        ],
        en: [
            "change",
            "changerole",
            "changeroles"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının cinsiyetini değiştirir",
        en: "Changes the user's gender"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>değiştir <@kişi veya Kişi ID'si>",
        en: "<px>change <@user or User ID>"
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
                değiştir: messages
            },
            roles: roleMessages,
            registers: registerMessages,
            permissions: permissionMessages,
            members: memberMessages,
            others: otherMessages,
            missingDatas: missingDatasMessages,
            unknownErrors: unknownErrorMessages,
            messageArrows: messageArrowsMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(messages.commandOnlyGender);

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            registerMessages.noRegister({
                prefix,
                hasAdmin: msgMember.permissions.has("Administrator")
            })
        );

        // Eğer botta "Rolleri Yönet" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

        const {
            boy: boyRoleIds,
            girl: girlRoleIds,
        } = guildDatabase.register.roleIds;

        // Eğer kız veya erkek rollerinden birisi yoksa hata döndür
        if (girlRoleIds.length == 0) return errorEmbed(
            roleMessages.rolesNotSetRegister({
                roleName: registerMessages.roleNames.girl,
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: registerMessages.commandNames.girl
                }
            })
        );
        if (boyRoleIds.length == 0) return errorEmbed(
            roleMessages.rolesNotSetRegister({
                roleName: registerMessages.roleNames.boy,
                hasAdmin: msgMember.permissions.has("Administrator"),
                hasAdminText: {
                    prefix,
                    commandName: registerMessages.commandNames.boy
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
        if (member.user.bot) return errorEmbed(memberMessages.cantUseOn.yourself);

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed(memberMessages.cantUseOn.owner);

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        if (member.roles.highest.position >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Kişide botun rolünün üstünde rol varsa kontrol et
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = [...boyRoleIds, ...girlRoleIds].filter(roleId => guild.roles.cache.get(roleId)?.position >= highestRole.position);
        if (roleAboveTheBotRole.length > 0) return errorEmbed(
            roleMessages.rolesAreHigherThanMe({
                roleIds: Util.mapAndJoin(roleAboveTheBotRole, roleId => `<@&${roleId}>`, " | "),
                highestRoleId: Util.getBotOrHighestRole(guildMe).id
            })
        );

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
                                $position: 0
                            }
                        }
                    });

                    if (isButton) {
                        return waitMessage.edit({
                            content: messageContent,
                            components: [actionRow],
                            allowedMentions: {
                                users: [],
                                repliedUser: true
                            }
                        });
                    } else {
                        return msg.reply({
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
            const waitMessage = await msg.reply({
                content: messages.selectGenderContent,
                components: [allButtons],
                withResponse: true
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
            waitComponents.on("end", () => {
                const channel = msg.channel;

                // Eğer kanal veya mesaj silinmişse hiçbir şey yapma
                if (
                    !channel ||
                    !channel.messages.cache.has(waitMessage.id)
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

                return waitMessage.edit({
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