"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js")
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "registerinfo", // Komutun ismi
    id: "kayıtbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "registerinformation",
        "registerinfo"
    ],
    description: "Shows everything you have saved datas for the register", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>registerinfo", // Komutun kullanım şekli
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
        guild,
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Girilen dizideki ID'leri rollere dönüştürür
        function arrayToRole(array) {
            return array.map(roleId => `<@&${roleId}>`).join(" | ") || "Role not setted ❗";
        }

        // Girilen veri true ise "Açık" değilse "Kapalı" döndürür
        function isOpenOrClose(bool) {
            return bool ? `On ${EMOJIS.on}` : `Off ${EMOJIS.off}`;
        }

        // Girilen veri varsa "Ayarlanmış" değilse "Ayarlanmamış" döndürür
        function isSetted(value) {
            return value ? `tuned ${EMOJIS.yes}` : "Not setted ❗";
        }

        // Girilen rol ID'si varsa rolü değilse "Ayarlanmamış" döndürür
        function isSettedRoleId(roleId) {
            return roleId ? `<@&${roleId}>` : "Role not setted ❗";
        }

        // Girilen kanal ID'si varsa channelü değilse "Ayarlanmamış" döndürür
        function isSettedChannelId(channelId) {
            return channelId ? `<#${channelId}>` : "Channel not setted ❗";
        }

        const {
            roleIds,
            channelIds,
            tag,
            symbol,
            ageLimit,
            type,
            isAgeRequired,
            isAutoCorrectOn,
            isAutoRegisterForBot,
            isRegisterOff,
            customLogin,
            customAfterRegister,
            customNames
        } = guildDatabase.register;

        let registerType;
        let registerTypeRoles;
        // Eğer kayıt türü "Normal kayıt" şeklindeyse
        if (type == "normal") {
            registerType = "Normal recording 👤";
            registerTypeRoles = `**• Role(s) assigned to members:** ${arrayToRole(roleIds.normal)}`
        }
        // Eğer kayıt türü "Cinsiyet" şeklindeyse
        else {
            registerType = "Registration by gender 👫";
            registerTypeRoles = `**• Role(s) to be given to men:** ${arrayToRole(roleIds.boy)}\n` +
                `**• Role(s) to be assigned to girls:** ${arrayToRole(roleIds.girl)}`
        };

        const guildIcon = guild.iconURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                `**• Record setting:** ${isRegisterOff ? `You cannot record ${EMOJIS.off}` : `You can register ${EMOJIS.on}`}\n` +
                `**• Record type:** ${registerType}`
            )
            .addFields(
                {
                    name: `${EMOJIS.role} ROLES`,
                    value: `${registerTypeRoles}\n` +
                        `**• Role(s) to be assigned to bots:** ${arrayToRole(roleIds.bot)}\n` +
                        `**• Official who registers members:** ${isSettedRoleId(roleIds.registerAuth)}\n` +
                        `**• Role to be taken after registering members:** ${isSettedRoleId(roleIds.unregister)}`
                },
                {
                    name: `${EMOJIS.channel} CHANNELS`,
                    value: `**• recording channel:** ${isSettedChannelId(channelIds.register)}\n` +
                        `**• Record log channel:** ${isSettedChannelId(channelIds.afterRegister)}\n` +
                        `**• Record log channel:** ${isSettedChannelId(channelIds.log)}`
                },
                {
                    name: "✏️ OTHERS",
                    value: `**• Server specific tag:** ${tag || "Tag not setted ❗"}\n` +
                        `**• Symbol to be placed between names:** ${symbol || "Symbol not setted ❗"}\n` +
                        `**• Automatically register bots:** ${isOpenOrClose(isAutoRegisterForBot)}\n` +
                        `**• Autocorrect names:** ${isOpenOrClose(isAutoCorrectOn)}\n` +
                        `**• Age requirement:** ${isOpenOrClose(isAgeRequired)}${isAgeRequired ? ` - (${ageLimit})` : ""}\n` +
                        `**• Customized login message:** ${isSetted(customLogin)}\n` +
                        `**• Customized log message:** ${isSetted(customAfterRegister)}\n` +
                        `**• Auto name:** ${Util.customMessages.unregisterName({
                            message: customNames.guildAdd,
                            guildDatabase,
                            name: "User's name"
                        })}\n\n` +
                        `**After saving someone it will look like this**\n` +
                        `└> ${Util.customMessages.registerName({
                            message: customNames.register,
                            memberName: "Fearless Crazy",
                            guildDatabase,
                            inputAge: ["20"],
                            isBot: false
                        })}`
                }
            )
            .setThumbnail(guildIcon)
            .setColor("Blue")
            .setFooter({
                text: `${msg.client.user.tag} Register system`,
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