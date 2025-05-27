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
        tr: "partner",
        en: "partner"
    },
    id: "partner", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "partner",
        ],
        en: [
            "partner"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun partner rolünü ayarlar",
        en: "Sets the server's partner role"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>partner <Seçenek>",
        en: "<px>partner <Option>"
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
        errorEmbed,
    }) {

        const {
            commands: {
                partner: messages
            },
            roles: roleMessages,
            others: {
                commandHelpers
            },
            switchs: {
                partner: switchKey
            }
        } = allMessages[language];

        // Eğer komutu kullanan kişide "Yönetici" yetkisi yoksa
        if (!msgMember.permissions.has("Administrator")) {
            const partnerRoleId = guildDatabase.premium.partnerRoleId;

            // Eğer sunucuda partner rolü ayarlanmamışsa
            if (!partnerRoleId) {
                return Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.no) :
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(
                        roleMessages.roleNotSet({
                            roleName: messages.partner,
                            hasAdmin: false
                        }),
                    );
            }

            // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
            const allMembers = await Util.getMembers(guild);
            const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

            // Eğer hiç kimsede yetkili rolü yoksa
            if (partnerMembers.size == 0) {
                return Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.no) :
                    // Eğer mesaj bir Interaction objesi ise
                    errorEmbed(messages.noMember);
            }

            // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
            const arrayMembers = Util.splitMessage({
                arrayString: partnerMembers.map(member => `<@${member.id}>`),
                firstString: `• <@&${partnerRoleId}>\n\n• **${messages.allPartner} (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
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
                const role = Util.fetchRole(msg);
                if (!role) return errorEmbed(
                    roleMessages.ifYouSetMulti({
                        prefix,
                        commandName: `${this.name[language]} ${commandHelpers.set}`,
                        roleName: messages.partner
                    }),
                    "warn"
                );

                // Eğer rollerin içinde bot rolü varsa hata döndür
                if (role.managed) return errorEmbed(roleMessages.managedRole);

                // Database'ye kaydet
                guildDatabase.premium.partnerRoleId = role.id;
                await database.updateGuild(guildId, {
                    $set: {
                        "premium.partnerRoleId": role.id
                    }
                });

                return errorEmbed(
                    roleMessages.successSet({
                        roleName: messages.partner,
                        roleIds: role.id
                    }),
                    "success"
                );
            }

            // Eğer partner rolünü sıfırlamak istiyorsa
            case "reset": {
                // Eğer zaten sıfırlanmış ise
                if (!guildDatabase.premium.partnerRoleId) return errorEmbed("Partner role has already been reset");

                guildDatabase.premium.partnerRoleId = "";
                await database.updateGuild(guildId, {
                    $set: {
                        "premium.partnerRoleId": ""
                    }
                });
                return errorEmbed("Partner role successfully reset", "success");
            }

            // Eğer bütün üyeleri etiket atmadan görmek istiyorsa
            case "view": {
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: messages.partner,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.set}`
                        }
                    }),
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(guild);
                const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

                // Eğer hiç kimsede yetkili rolü yoksa
                if (partnerMembers.size == 0) return errorEmbed(messages.nooneHasRole);

                // Şimdi üyelerin ID'lerini discord embed karakter limitine göre (4096) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: partnerMembers.map(member => `<@${member.id}>`),
                    firstString: `• <@&${partnerRoleId}>\n\n• **${messages.allPartner} (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
                    joinString: " | ",
                    limit: 4096
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < arrayMembers.length; ++i) {
                    await msg.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(messages.allPartner)
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
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: messages.partner,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.set}`
                        }
                    }),
                );

                // Eğer ayarlanmışsa o rollere sahip bütün üyeleri çek
                const allMembers = await Util.getMembers(guild);
                const partnerMembers = allMembers.filter(member => !member.user.bot && member["_roles"].includes(partnerRoleId));

                // Eğer hiç kimsede partner yetkili rolü yoksa
                if (partnerMembers.size == 0) return errorEmbed(messages.nooneHasRole);

                // Şimdi üyelerin ID'lerini discord karakter limitine göre (2000) göre düzenle ve mesaj olarak gönder
                const arrayMembers = Util.splitMessage({
                    arrayString: partnerMembers.map(member => `<@${member.id}>`),
                    firstString: `• <@&${partnerRoleId}>\n\n• **${messages.allPartner} (__${Util.toHumanize(partnerMembers.size, language)}__)**\n`,
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
                const partnerRoleId = guildDatabase.premium.partnerRoleId;

                // Eğer rol ayarlanmamışsa hata döndür
                if (!partnerRoleId) return errorEmbed(
                    roleMessages.roleNotSet({
                        roleName: messages.partner,
                        hasAdmin: true,
                        hasAdminText: {
                            prefix,
                            commandName: `${this.name[language]} ${commandHelpers.set}`
                        }
                    }),
                );

                return msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**• ${messages.partnerRole}:** <@&${partnerRoleId}>`
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