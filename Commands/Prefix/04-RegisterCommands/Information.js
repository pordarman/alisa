"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js")
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtbilgi",
        en: "registerinfo"
    },
    id: "kayıtbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtbilgi",
            "registerinformation",
            "registerinfo"
        ],
        en: [
            "registerinformation",
            "registerinfo"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt ile ilgili kaydettiğiniz her şeyi gösterir",
        en: "Shows everything you have saved datas for the register"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtbilgi",
        en: "<px>registerinfo"
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
        guild,
        msgMember,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                kayıtbilgi: messages
            },
            permissions: permissionMessages,
            others: otherMessages
        } = allMessages[language];

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.roleOrAdministrator(authorizedRoleId), "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Girilen dizideki ID'leri rollere dönüştürür
        function arrayToRole(array) {
            return Util.mapAndJoin(array, roleId => `<@&${roleId}>`, " | ") || messages.roleNotSet;
        }

        // Girilen veri true ise "Açık" değilse "Kapalı" döndürür
        function isOpenOrClose(bool) {
            return bool ? `${messages.on} ${EMOJIS.on}` : `${messages.off} ${EMOJIS.off}`;
        }

        // Girilen veri varsa "Ayarlanmış" değilse "Ayarlanmamış" döndürür
        function isSetted(value) {
            return value ? `${messages.set} ${EMOJIS.yes}` : messages.notSet;
        }

        // Girilen rol ID'si varsa rolü değilse "Ayarlanmamış" döndürür
        function isSettedRoleId(roleId) {
            return roleId ? `<@&${roleId}>` : messages.roleNotSet;
        }

        // Girilen kanal ID'si varsa channelü değilse "Ayarlanmamış" döndürür
        function isSettedChannelId(channelId) {
            return channelId ? `<#${channelId}>` : messages.channelNotSet;
        }

        const {
            roleIds,
            channelIds,
            tag,
            symbol,
            ageLimit,
            type,
            isAgeRequired,
            isNameRequired,
            isAutoCorrectOn,
            isAutoRegisterForBot,
            isAuthroizedNotificationOn,
            isRegisterOff,
            customLogin,
            customAfterRegister,
            customNames
        } = guildDatabase.register;

        let registerType;
        let registerTypeRoles;
        // Eğer kayıt türü "Üyeli kayıt" şeklindeyse
        if (type == "member") {
            registerType = messages.registerType.member;
            registerTypeRoles = `**• ${messages.roles.member}:** ${arrayToRole(roleIds.member)}`
        }
        // Eğer kayıt türü "Cinsiyet" şeklindeyse
        else {
            registerType = messages.registerType.gender;
            registerTypeRoles = `**• ${messages.roles.boy}:** ${arrayToRole(roleIds.boy)}\n` +
                `**• ${messages.roles.girl}:** ${arrayToRole(roleIds.girl)}`
        };

        const guildIcon = guild.iconURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                `**• ${messages.registerType.setting}:** ${isRegisterOff ? `${messages.registerSettings.cant} ${EMOJIS.off}` : `${messages.registerSettings.can} ${EMOJIS.on}`}\n` +
                `**• ${messages.registerType.string}:** ${registerType}`
            )
            .addFields(
                {
                    name: `${EMOJIS.role} ${messages.fieldsName.roles}`,
                    value: `${registerTypeRoles}\n` +
                        `**• ${messages.roles.bot}:** ${arrayToRole(roleIds.bot)}\n` +
                        `**• ${messages.roles.registerAuth}:** ${isSettedRoleId(roleIds.registerAuth)}\n` +
                        `**• ${messages.roles.unregister}:** ${isSettedRoleId(roleIds.unregister)}`
                },
                {
                    name: `${EMOJIS.channel} ${messages.fieldsName.channels}`,
                    value: `**• ${messages.channels.register}:** ${isSettedChannelId(channelIds.register)}\n` +
                        `**• ${messages.channels.afterRegister}:** ${isSettedChannelId(channelIds.afterRegister)}\n` +
                        `**• ${messages.channels.log}:** ${isSettedChannelId(channelIds.log)}`
                },
                {
                    name: `✏️ ${messages.fieldsName.others}`,
                    value: `**• ${messages.others.tag.string}:** ${tag || messages.others.tag.notSet}\n` +
                        `**• ${messages.others.symbol.string}:** ${symbol || messages.others.symbol.notSet}\n` +
                        `**• ${messages.others.mentionAuth}:** ${isOpenOrClose(isAuthroizedNotificationOn)}\n` +
                        `**• ${messages.others.botAuto}:** ${isOpenOrClose(isAutoRegisterForBot)}\n` +
                        `**• ${messages.others.autoCorrect}:** ${isOpenOrClose(isAutoCorrectOn)}\n` +
                        `**• ${messages.others.nameRequired}:** ${isOpenOrClose(isNameRequired)}\n` +
                        `**• ${messages.others.ageRequired}:** ${isOpenOrClose(isAgeRequired)}${isAgeRequired ? ` - (${ageLimit || messages.notSet})` : ""}\n` +
                        `**• ${messages.others.customLoginMessage}:** ${isSetted(customLogin.content)}\n` +
                        `**• ${messages.others.customAfterRegisterMessage}:** ${isSetted(customAfterRegister.content)}\n` +
                        `**• ${messages.others.autoName}:** ${Util.customMessages.unregisterName({
                            message: customNames.guildAdd,
                            guildDatabase,
                            name: messages.others.membersName
                        })}\n\n` +
                        `**${messages.others.afterRegisterName}**\n` +
                        `└> ${Util.customMessages.registerName({
                            message: customNames.register,
                            name: "Fearless Crazy",
                            guildDatabase,
                            age: "20",
                            isBot: false
                        })}`
                }
            )
            .setThumbnail(guildIcon)
            .setColor("Blue")
            .setFooter({
                text: otherMessages.embedFooters.register,
                iconURL: msg.client.user.displayAvatarURL()
            })
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};