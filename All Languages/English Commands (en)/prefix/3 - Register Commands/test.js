"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "test", // Komutun ismi
    id: "test", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "test",
    ],
    description: "Predicts errors that will occur while register someone", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>test", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildMePermissions,
        guild,
        errorEmbed,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const embed = new EmbedBuilder()
            .setDescription(`• Veriler kontrol ediliyor, lütfen biraz bekleyiniz...`)
            .setColor("Blue");

        // Mesajı at ve kontrol ettikten sonra mesajı düzenle
        const message = await msg.reply({
            embeds: [
                embed
            ]
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
                    normal: normalRoleIds,
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
        if (isRegisterOff) roleErrors.push("• My recording setting is disabled, you cannot perform any recording operations!");

        // Eğer kayıtsız rolü ayarlanmamışsa
        if (!unregisterRoleId) roleErrors.push("• The role to be given to unregistered members is not set!");
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(unregisterRoleId)
        }

        // Eğer kayıt türü "Normal Kayıt"i se
        if (type == "normal") {
            // Eğer üye rolü ayarlanmamışsa
            if (normalRoleIds.length == 0) roleErrors.push("• The role to be assigned to members is not set!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...normalRoleIds)
            }
        } else {
            // Eğer erkek rolü ayarlanmamışsa
            if (boyRoleIds.length == 0) roleErrors.push("• The role to be given to men is not determined!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...boyRoleIds)
            }

            // Eğer kız rolü ayarlanmamışsa
            if (girlRoleIds.length == 0) roleErrors.push("• The roles given to girls are not set!")
            // Eğer ayarlanmışsa bütün rollere rolü ekle
            else {
                allRoles.push(...girlRoleIds)
            }
        }

        // Eğer botlara verilecek rol ayarlanmamışsa
        if (botRoleIds.length == 0) roleErrors.push("• The role given to bots is not set!")
        // Eğer ayarlanmışsa bütün rollere rolü ekle
        else {
            allRoles.push(...botRoleIds)
        }

        // Eğer botta gerekli yetkiler yoksa
        if (!guildMePermissions.has("ManageNicknames")) permissionsErrors.push("• I don't have permission to edit names");
        if (!guildMePermissions.has("ManageRoles")) permissionsErrors.push("• I don't have permission to edit roles");
        if (!guildMePermissions.has("Administrator")) suggestions.push("• For the bot to work properly, make sure you give me administrator rights")

        // Eğer kayıt eden yetkili rolü ayarlanmamışsa
        if (!registerAuthRoleId) roleErrors.push("• The authorized role that registers members is not set!");

        // Eğer rollerden bazıları botun rollerinden yüksekse
        const highestRole = guildMe.roles.highest;
        const roleAboveTheBotRole = allRoles.filter(roleId => guild.roles.cache.get(roleId).position >= highestRole.position);
        if (roleAboveTheBotRole.length != 0) roleErrors.push(`• Since the roles named [${roleAboveTheBotRole.map(roleId => `<@&${roleId}>`).join(" | ")}] are higher than my role, I cannot give these roles to others`);

        // Eğer kayıt kanalı ayarlanmamışsa
        if (!registerChannelId) channelErrors.push("• The channel for recording is not set!");
        else {
            const channel = guild.channels.cache.get(registerChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.register = "";
                channelErrors.push("• The channel for recording is not set!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• I do not have permission to send messages to the recording channel!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt sonrası kanal ayarlanmamışsa
        if (!afterRegisterChannelId) suggestions.push("• The channel to send a welcome message to the member after registration is not set!");
        else {
            const channel = guild.channels.cache.get(afterRegisterChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.afterRegister = "";
                suggestions.push("• The channel to send a welcome message to the member after registration is not set!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• I do not have permission to send messages to the channel after registration!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        // Eğer kayıt log kanalı ayarlanmamışsa
        if (!logChannelId) suggestions.push("• Recording log channel not set!");
        else {
            const channel = guild.channels.cache.get(logChannelId);

            // Eğer kanal bulunamadıysa database'den sil
            if (!channel) {
                guildDatabase.register.channelIds.log = "";
                suggestions.push("• Recording log channel not set!");
            }
            // Eğer kanal varsa kanala mesaj atmayı dene
            else {
                const isSended = await channel.send("Test");

                // Eğer mesaj atamadıysa
                if (!isSended) channelErrors.push("• I do not have permission to send messages to the registration log channel!");
                // Eğer mesajı attıysa mesajı sil
                else {
                    isSended.delete();
                }
            }
        };

        const messageFields = [];

        // Eğer yetki hatası varsa
        if (permissionsErrors.length > 0) messageFields.push({
            name: "🧰 AUTHORITY ERRORS",
            value: permissionsErrors.join("\n")
        });

        // Eğer rol hatası varsa
        if (roleErrors.length > 0) messageFields.push({
            name: `${EMOJIS.role} ROLE ERRORS`,
            value: roleErrors.join("\n")
        });

        // Eğer kanal hatası varsa
        if (channelErrors.length > 0) messageFields.push({
            name: `${EMOJIS.channel} CHANNEL ERRORS`,
            value: channelErrors.join("\n")
        });

        // Öneriler varsa
        if (suggestions.length > 0) messageFields.push({
            name: "💬 RECOMMENDED TO DO",
            value: suggestions.join("\n")
        });

        // Mesajda gösterilecek resimler
        const guildIcon = guild.iconURL();
        const clientAvatar = msg.client.user.displayAvatarURL();

        // Eğer bir öneri veya hata yoksa mükemmel embed'i döndür
        if (messageFields.length == 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.crazy} That's it!!!`)
                .setDescription(`The bot works perfectly on this server (just like you...), you can register with peace of mind!`)
                .setThumbnail(guildIcon)
                .setColor("Green")
                .setFooter({
                    text: "I love you <3",
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
            .setTitle("Sounds like there's some work that needs to be done?")
            .addFields(...messageFields)
            .setThumbnail(guildIcon)
            .setColor("Orange")
            .setFooter({
                text: "I love you <3",
                iconURL: clientAvatar
            });

        return message.edit({
            embeds: [
                finalEmbed
            ]
        });

    },
};