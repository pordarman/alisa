"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js")
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtbilgi", // Komutun ismi
    id: "kayıtbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtbilgi",
        "registerinformation",
        "registerinfo"
    ],
    description: "Kayıt ile ilgili kaydettiğiniz her şeyi gösterir", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtbilgi", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Girilen dizideki ID'leri rollere dönüştürür
        function arrayToRole(array) {
            return array.map(roleId => `<@&${roleId}>`).join(" | ") || "Rol ayarlanmamış ❗";
        }

        // Girilen veri true ise "Açık" değilse "Kapalı" döndürür
        function isOpenOrClose(bool) {
            return bool ? `Açık ${EMOJIS.on}` : `Kapalı ${EMOJIS.off}`;
        }

        // Girilen veri varsa "Ayarlanmış" değilse "Ayarlanmamış" döndürür
        function isSetted(value) {
            return value ? `Ayarlanmış ${EMOJIS.yes}` : "Ayarlanmamış ❗";
        }

        // Girilen rol ID'si varsa rolü değilse "Ayarlanmamış" döndürür
        function isSettedRoleId(roleId) {
            return roleId ? `<@&${roleId}>` : "Rol ayarlanmamış ❗";
        }

        // Girilen kanal ID'si varsa channelü değilse "Ayarlanmamış" döndürür
        function isSettedChannelId(channelId) {
            return channelId ? `<#${channelId}>` : "Kanal ayarlanmamış ❗";
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
            registerType = "Normal kayıt 👤";
            registerTypeRoles = `**• Üyelere verilecek rol(ler):** ${arrayToRole(roleIds.normal)}`
        }
        // Eğer kayıt türü "Cinsiyet" şeklindeyse
        else {
            registerType = "Cinsiyete göre kayıt 👫";
            registerTypeRoles = `**• Erkeklere verilecek rol(ler):** ${arrayToRole(roleIds.boy)}\n` +
                `**• Kızlara verilecek rol(ler):** ${arrayToRole(roleIds.girl)}`
        };

        const guildIcon = guild.iconURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .setDescription(
                `**• Kayıt ayarı:** ${isRegisterOff ? `Kayıt yapamazsınız ${EMOJIS.off}` : `Kayıt yapabilirsiniz ${EMOJIS.on}`}\n` +
                `**• Kayıt türü:** ${registerType}`
            )
            .addFields(
                {
                    name: `${EMOJIS.role} ROLLER`,
                    value: `${registerTypeRoles}\n` +
                        `**• Botlara verilecek rol(ler):** ${arrayToRole(roleIds.bot)}\n` +
                        `**• Üyeleri kayıt eden yetkili:** ${isSettedRoleId(roleIds.registerAuth)}\n` +
                        `**• Üyeleri kayıt ettikten sonra alınacak rol:** ${isSettedRoleId(roleIds.unregister)}`
                },
                {
                    name: `${EMOJIS.channel} KANALLAR`,
                    value: `**• Kayıt kanalı:** ${isSettedChannelId(channelIds.register)}\n` +
                        `**• Kayıt günlük kanalı:** ${isSettedChannelId(channelIds.afterRegister)}\n` +
                        `**• Kayıt log kanalı:** ${isSettedChannelId(channelIds.log)}`
                },
                {
                    name: "✏️ DİĞERLERİ",
                    value: `**• Sunucuya özel tag:** ${tag || "Tag ayarlanmamış ❗"}\n` +
                        `**• İsimlerin arasına koyulacak sembol:** ${symbol || "Sembol ayarlanmamış ❗"}\n` +
                        `**• Botları otomatik kayıt etme:** ${isOpenOrClose(isAutoRegisterForBot)}\n` +
                        `**• İsimleri otomatik düzeltme:** ${isOpenOrClose(isAutoCorrectOn)}\n` +
                        `**• Yaş zorunluluğu:** ${isOpenOrClose(isAgeRequired)}${isAgeRequired ? ` - (${ageLimit})` : ""}\n` +
                        `**• Özelleştirilmiş giriş mesajı:** ${isSetted(customLogin)}\n` +
                        `**• Özelleştirilmiş günlük mesajı:** ${isSetted(customAfterRegister)}\n` +
                        `**• Oto isim:** ${Util.customMessages.unregisterName({
                            message: customNames.guildAdd,
                            guildDatabase,
                            name: "Kullanıcının ismi"
                        })}\n\n` +
                        `**Birisini kayıt ettikten sonra şöyle gözükecek**\n` +
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
                text: `${msg.client.user.tag} Kayıt sistemi`,
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