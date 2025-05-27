"use strict";
const { EmbedBuilder } = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const {
    EMOJIS
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yetkili",
        en: "authorized"
    },
    id: "yetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yetkili",
            "yetkililer",
            "authorized"
        ],
        en: [
            "authorized"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun yetkili rollerini ayarlar",
        en: "Sets the server's authoritative roles"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yetkili <Seçenekler>",
        en: "<px>authorized <Options>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guildId,
        guild,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed
    }) {

        const {
            commands: {
                yetkili: messages
            },
            roles: roleMessages,
            others: {
                roleNames,
                commandHelpers
            },
            switchs: {
                authorized: switchKey
            }
        } = allMessages[language];

        // Eğer komutu kullanan kişide "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) {
            const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

            // Eğer sunucuda yetkili rolleri ayarlanmamışsa
            if (authorizedRoleIds.length == 0) {
                return Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.no) :
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(roleMessages.roleNotSet({
                        roleName: roleNames.auth,
                        hasAdmin: false
                    }));
            }

            // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
            const allMembers = await Util.getMembers(guild);
            const authorizedMembers = allMembers.filter(member => {
                if (member.user.bot) return false;
                const memberRolesSet = new Set(member["_roles"]);
                return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
            });

            // Eğer hiç kimsede yetkili rolü yoksa
            if (authorizedMembers.size == 0) {
                return Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.no) :
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(messages.noMember);
            }

            // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
            const arrayMembers = Util.splitMessage({
                arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                firstString: `• ${Util.mapAndJoin(authorizedRoleIds, roleId => `<@&${roleId}>`, ", ")}\n\n• **${roleNames.authorized} (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                joinString: " | ",
                limit: 2000
            });

            // Bütün sayfaları teker teker mesaj olarak gönder
            for (let i = 0; i < arrayMembers.length; ++i) {
                await msg.channel.send({
                    content: arrayMembers[i],
                    allowedMentions: {
                        roles: [],
                        users: []
                    }
                });

                // 500 milisaniye bekle
                await Util.wait(500)
            }

            // En sonda ise rollere ve kullanıcılara bildirim gitmediğini belirten mesaj gönder
            return msg.channel.send(messages.notifNoGone);
        }

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {
            // Eğer rolleri ayarlamak istiyorsa
            case "set": {

                // Rolü ayarla
                const allRoles = Util.fetchRoles(msg);
                if (allRoles.size == 0) return errorEmbed(
                    roleMessages.ifYouSetMulti({
                        prefix,
                        commandName: `${this.name[language]} ${commandHelpers.set}`,
                        roleName: roleNames.auth
                    }),
                    "warn"
                );

                // Eğer rollerin içinde bot rolü varsa hata döndür
                if (allRoles.some(role => role.managed)) return errorEmbed(roleMessages.botRole);

                // Eğer çok fazla rol etiketlemişse hata döndür
                if (allRoles.size > Util.MAX.mentionRoleForAuthorized) return errorEmbed(roleMessages.maxRoleError(Util.MAX.mentionRoleForAuthorized));

                // Database'ye kaydet
                guildDatabase.premium.authorizedRoleIds = allRoles.map(role => role.id);
                await database.updateGuild(guildId, {
                    $set: {
                        "premium.authorizedRoleIds": guildDatabase.premium.authorizedRoleIds
                    }
                });

                return errorEmbed(
                    roleMessages.successSet({
                        roleName: roleNames.auth,
                        roleIds: Util.mapAndJoin(allRoles, role => `<@&${role.id}>`, " | ")
                    }),
                    "success"
                );
            }

            // Eğer yetkili rollerini sıfırlamak istiyorsa
            case "reset": {
                // Eğer zaten sıfırlanmış ise
                if (guildDatabase.premium.authorizedRoleIds.length == 0) return errorEmbed(roleMessages.alreadyReset(roleNames.auth));

                guildDatabase.premium.authorizedRoleIds = [];
                await database.updateGuild(guildId, {
                    $set: {
                        "premium.authorizedRoleIds": []
                    }
                });
                return errorEmbed(roleMessages.successReset(roleNames.auth), "success");
            }

            // Eğer bütün üyeleri etiket atmadan görmek istiyorsa
            case "see": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: roleNames.auth,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.set}`,
                        }
                    }),
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(guild);
                const authorizedMembers = allMembers.filter(member => {
                    if (member.user.bot) return false;
                    const memberRolesSet = new Set(member["_roles"]);
                    return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
                });

                // Eğer hiç kimsede yetkili rolü yoksa
                if (authorizedMembers.size == 0) return errorEmbed(messages.nooneHasRole);

                // Şimdi üyelerin ID'lerini discord embed karakter limitine göre (4096) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                    firstString: `• ${Util.mapAndJoin(authorizedRoleIds, roleId => `<@&${roleId}>`, ", ")}\n\n• **${roleNames.auth} (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 4096
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(messages.allAuthorized)
                                .setDescription(arrayMembers[i])
                                .setColor("Blue")
                        ]
                    });

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }

            }

                break;

            // Eğer bütün üyelere etiket atarak görmek istiyorsa
            case "tag": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: roleNames.auth,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.set}`,
                        }
                    }),
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(guild);
                const authorizedMembers = allMembers.filter(member => {
                    if (member.user.bot) return false;
                    const memberRolesSet = new Set(member["_roles"]);
                    return authorizedRoleIds.some(roleId => memberRolesSet.has(roleId));
                });

                // Eğer hiç kimsede yetkili rolü yoksa
                if (authorizedMembers.size == 0) return errorEmbed(messages.nooneHasRole);

                // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: authorizedMembers.map(member => `<@${member.id}>`),
                    firstString: `• ${Util.mapAndJoin(authorizedRoleIds, roleId => `<@&${roleId}>`, ", ")}\n\n• **${roleNames.authorized} (__${Util.toHumanize(authorizedMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 2000
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send(arrayMembers[i]);

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
            }

                break;

            // Eğer ayarlanan rolleri görmek istiyorsa
            case "role": {
                const authorizedRoleIds = guildDatabase.premium.authorizedRoleIds;

                // Eğer rol ayarlanmamışsa hata döndür
                if (authorizedRoleIds.length == 0) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: roleNames.auth,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.role}`,
                        }
                    }),
                );

                return msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**• ${messages.allAuthorizedRoles} (${Util.toHumanize(authorizedRoleIds.length, length)})**\n\n` +
                                `• ${Util.mapAndJoin(authorizedRoleIds, roleId => `<@&${roleId}>`, " | ")}`
                            )
                            .setColor("Blue")
                    ]
                })
            }

            // Eğer hiçbir şey yazmamışsa bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    messages.enterFull(prefix),
                    "warn",
                    30 * 1000 // Bu mesajı 30 saniye boyunca göster
                );
        }

    },
};