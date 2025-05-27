"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "test",
        en: "test"
    },
    id: "test", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "test",
            "kayıttest"
        ],
        en: [
            "test",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Birisini kayıt ederken çıkacak hataları önceden gösterir",
        en: "Predicts errors that will occur while register someone"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>test",
        en: "<px>test"
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
        guildMe,
        guildMePermissions,
        guild,
        msgMember,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                test: messages
            },
            permissions: permissionMessages,
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const embed = new EmbedBuilder()
            .setDescription(messages.embedDescription)
            .setColor("Blue");

        // Mesajı at ve kontrol ettikten sonra mesajı düzenle
        const message = await msg.reply({
            embeds: [
                embed
            ],
            withResponse: true
        });

        // Eğer olur da bir hata oluşursa hiçbir şey döndürme
        if (!message) return;

        const roleErrors = [];
        const channelErrors = [];
        const permissionsErrors = [];

        const suggestions = [];
        const allRoles = [];

        const {
            register: {
                roleIds: {
                    bot: botRoleIds,
                    member: memberRoleIds,
                    boy: boyRoleIds,
                    girl: girlRoleIds,
                    unregister: unregisterRoleId,
                    registerAuth: registerAuthRoleId,
                },
                channelIds: {
                    register: registerChannelId,
                    afterRegister: afterRegisterChannelId,
                    log: logChannelId,
                },
                isRegisterOff,
                type
            }
        } = guildDatabase;

        // Eğer kayıt ayarı kapalıysa
        if (isRegisterOff) roleErrors.push(messages.registerOff);

        // Eğer kayıtsız rolü ayarlanmamışsa
        if (!unregisterRoleId) roleErrors.push(messages.notSet.unregister);
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(unregisterRoleId)
        }

        // Eğer kayıt türü "Üyeli kayıt"i se
        if (type == "member") {
            // Eğer üye rolü ayarlanmamışsa
            if (memberRoleIds.length == 0) roleErrors.push(messages.notSet.member)
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...memberRoleIds)
            }
        } else {
            // Eğer erkek rolü ayarlanmamışsa
            if (boyRoleIds.length == 0) roleErrors.push(messages.notSet.boy)
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...boyRoleIds)
            }

            // Eğer kız rolü ayarlanmamışsa
            if (girlRoleIds.length == 0) roleErrors.push(messages.notSet.girl)
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...girlRoleIds)
            }
        }

        // Eğer botlara verilecek rol ayarlanmamışsa
        if (botRoleIds.length == 0) roleErrors.push(messages.notSet.bot)
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(...botRoleIds)
        }

        // Eğer botta gerekli yetkiler yoksa
        if (!guildMePermissions.has("ManageNicknames")) permissionsErrors.push(messages.permission.manageNicknames);
        if (!guildMePermissions.has("ManageRoles")) permissionsErrors.push(messages.permission.manageRoles);
        if (!guildMePermissions.has("Administrator")) suggestions.push(messages.permission.administrator)

        // Eğer kayıt eden yetkili rolü ayarlanmamışsa
        if (!registerAuthRoleId) roleErrors.push(messages.notSet.registerAuth);

        // Eğer rollerden bazıları botun rollerinden yüksekse
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = allRoles.filter(roleId => guild.roles.cache.get(roleId).position >= highestRole.position);
        if (roleAboveTheBotRole.length != 0) roleErrors.push(messages.rolesAreHigher(Util.mapAndJoin(roleAboveTheBotRole, roleId => `<@&${roleId}>`, " | ")));

        // Eğer kayıt kanalı ayarlanmamışsa
        if (!registerChannelId) channelErrors.push(messages.notSet.registerChannel);
        else {
            const channel = guild.channels.cache.get(registerChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.register = "";
                channelErrors.push(messages.notSet.registerChannel);
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push(messages.permission.registerChannel);
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt sonrası kanal ayarlanmamışsa
        if (!afterRegisterChannelId) suggestions.push(messages.notSet.afterRegisterChannel);
        else {
            const channel = guild.channels.cache.get(afterRegisterChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.afterRegister = "";
                suggestions.push(messages.notSet.afterRegisterChannel);
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push(messages.permission.afterRegisterChannel);
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt log kanalı ayarlanmamışsa
        if (!logChannelId) suggestions.push(messages.notSet.registerLogChannel);
        else {
            const channel = guild.channels.cache.get(logChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.log = "";
                suggestions.push(messages.notSet.registerLogChannel);
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push(messages.permission.registerLogChannel);
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        const messageFields = [];

        // Eğer yetki hatası varsa
        if (permissionsErrors.length > 0) messageFields.push({
            name: messages.fieldsNames.permissions,
            value: permissionsErrors.join("\n")
        });

        // Eğer rol hatası varsa
        if (roleErrors.length > 0) messageFields.push({
            name: messages.fieldsNames.roles,
            value: roleErrors.join("\n")
        });

        // Eğer kanal hatası varsa
        if (channelErrors.length > 0) messageFields.push({
            name: messages.fieldsNames.channels,
            value: channelErrors.join("\n")
        });

        // Öneriler varsa
        if (suggestions.length > 0) messageFields.push({
            name: messages.fieldsNames.recommend,
            value: suggestions.join("\n")
        });

        // Mesajda gösterilecek resimler
        const guildIcon = guild.iconURL();
        const clientAvatar = msg.client.user.displayAvatarURL();

        // Eğer bir öneri veya hata yoksa mükemmel embed'i döndür
        if (messageFields.length == 0) {
            const embed = new EmbedBuilder()
                .setTitle(messages.successEmbed.title)
                .setDescription(messages.successEmbed.description)
                .setThumbnail(guildIcon)
                .setColor("Green")
                .setFooter({
                    text: messages.successEmbed.footer,
                    iconURL: clientAvatar
                });

            return message.edit({
                embeds: [
                    embed
                ]
            })
        }

        // Eğer hatalar varsa onları embed mesajda göster
        const finalEmbed = new EmbedBuilder()
            .setTitle(messages.failEmbed.title)
            .addFields(...messageFields)
            .setThumbnail(guildIcon)
            .setColor("Orange")
            .setFooter({
                text: messages.failEmbed.footer,
                iconURL: clientAvatar
            });

        const func = Util.isMessage(msg) ? "edit" : "editReply";

        // Eğer mesajı düzenleyecekse mesajı düzenle
        if (message[func]) return message[func]({
            embeds: [
                finalEmbed
            ]
        });
    },
};