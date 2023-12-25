"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "say", // Komutun ismi
    id: "say", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "say",
        "count"
    ],
    description: "Sunucuda kaç üye olduğunu gösterir", // Komutun açıklaması
    category: "Bilgi komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>say", // Komutun kullanım şekli
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

        const countSettings = guildDatabase.countCommandSettings;

        // Eğer hiçbir veri gösterilmemesi için ayarlanmışsa hata döndür
        if (Object.values(countSettings.datas).every(bool => bool == false)) return errorEmbed(
            `Şeyyy... Bu sunucuda **${prefix}${this.name}** komutunda gösterilecek hiçbir şey __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Eğer say ayarlarını değiştirmek isterseniz **${prefix}say-ayarlar** yazabilirsiniz` :
                "")
        );

        // Say komutundaki veriler için tanımlamalar yapıyoruz
        const { isEmoji } = countSettings;
        const numberToFormat = isEmoji ? (number) => Util.stringToEmojis(number) : (number) => `**${Util.toHumanize(number, language)}**`;
        const mapFunction = isEmoji ? (value) => `${EMOJIS.count} **${value}**` : (value) => `${EMOJIS.count} ${value}`;
        const {
            total,
            registered,
            voice,
            vip,
            jail,
            boostCount,
            registerAuth,
            jailAuth,
            banAuth,
            kickAuth,
            muteAuth,
            vipAuth
        } = countSettings.datas;
        const allMembers = await Util.getMembers(msg);
        const embedFields = [];
        const {
            roleIds,
            type,
        } = guildDatabase.register;
        const {
            roleIds: moderationRoleIds,
        } = guildDatabase.moderation;
        const {
            roleIds: {
                vip: vipRoleId,
                vipAuth: vipAuthRoleId
            },
        } = guildDatabase;
        const countableObject = {
            total: 0,
            registered: 0,
            boy: 0,
            girl: 0,
            unregister: 0,
            voice: 0,
            vip: 0,
            jail: 0,
            boostMembers: 0,
            registerAuth: 0,
            jailAuth: 0,
            banAuth: 0,
            kickAuth: 0,
            muteAuth: 0,
            vipAuth: 0,
        }

        let serverInformation = false;
        let authInformation = false;

        // Bütün üyeleri birden kontrol edeceğimiz için fonksiyonun içine koyulacak kod bloğumuzu yazıyoruz
        let code = `const memberRolesSet = new Set(member["_roles"]);`

        // Eğer bunlardan birisi varsa kullanıcılar için yeni field oluştur
        if (total || registered || voice || vip || jail || boostCount) {

            // Eğer toplam verisi açıksa
            if (total) code += `countableObject.total += 1;`;

            // Eğer kayıtlı üye verisi açıksa
            if (registered) {
                // Eğer kayıt şekli "Normal kayıt" ise
                if (type == "normal") {
                    if (guildDatabase.register.roleIds.normal.length > 0) code += `if (guildDatabase.register.roleIds.normal.every(roleId => memberRolesSet.has(roleId))) countableObject.registered += 1;`;
                }
                // Eğer kayıt şekli "Cinsiyet" ise
                else {
                    const hasBoyRoles = roleIds.boy.length > 0;
                    const hasGirlRoles = roleIds.girl.length > 0;

                    // Eğer erkek veya kız rollerinden birisi varsa bütün üyelerde gez ve hangisi kız hangisi erkek kontrol et
                    if (hasBoyRoles || hasGirlRoles) {
                        if (hasBoyRoles && hasGirlRoles) {
                            code += `if (guildDatabase.register.roleIds.boy.every(roleId => memberRolesSet.has(roleId))) countableObject.boy += 1
                                         else if (guildDatabase.register.roleIds.girl.every(roleId => memberRolesSet.has(roleId))) countableObject.girl += 1;`;
                        } else if (hasBoyRoles) {
                            code += `if (guildDatabase.register.roleIds.boy.every(roleId => memberRolesSet.has(roleId))) countableObject.boy += 1;`;
                        } else {
                            code += `if (guildDatabase.register.roleIds.girl.every(roleId => memberRolesSet.has(roleId))) countableObject.girl += 1;`;
                        }
                    }
                }

                // Kayıtsız rolü var mı kontrol etme
                if (roleIds.unregister) code += `if (memberRolesSet.has(guildDatabase.register.roleIds.unregister)) countableObject.unregister += 1;`;
            }

            // Eğer sesli kanallarda üye verisi açıksa
            if (voice) {
                code += `if (!member.user.bot && member.voice.channelId) countableObject.voice += 1;`;
            }

            // Eğer vip üye verisi açıksa
            if (boostCount) {
                code += `if (member.premiumSinceTimestamp) countableObject.boostMembers += 1;`;
            }

            // Eğer jail üye verisi açıksa
            if (vip) {
                if (vipRoleId) code += `if (memberRolesSet.has(guildDatabase.roleIds.vip)) countableObject.vip += 1;`;
            }

            // Eğer boost verisi açıksa
            if (jail) {
                if (guildDatabase.jail.roleId) code += `if (memberRolesSet.has(guildDatabase.jail.roleId)) countableObject.jail += 1;`;
            }

            // Embed mesajına Sunucu bilgileri kısmını ekle
            serverInformation = true;
        }

        // Eğer bunlardan birisi varsa kullanıcılar için yeni field oluştur
        if (registerAuth || jailAuth || vipAuthRoleId || banAuth || kickAuth || muteAuth) {

            // Eğer kayıt yetkili verisi açıksa
            if (registerAuth) {
                if (guildDatabase.register.roleIds.registerAuth) code += `if (memberRolesSet.has(guildDatabase.register.roleIds.registerAuth)) countableObject.registerAuth += 1;`;
            }

            // Eğer jail yetkili verisi açıksa
            if (jailAuth) {
                if (guildDatabase.jail.authRoleId) code += `if (memberRolesSet.has(guildDatabase.jail.authRoleId)) countableObject.jailAuth += 1;`;
            }

            // Eğer vip yetkili verisi açıksa
            if (vipAuth) {
                if (guildDatabase.roleIds.vipAuth) code += `if (memberRolesSet.has(guildDatabase.roleIds.vipAuth)) countableObject.vipAuth += 1;`;
            }

            // Eğer ban yetkili verisi açıksa
            if (banAuth) {
                if (moderationRoleIds.banAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.banAuth)) countableObject.banAuth += 1;`;
            }

            // Eğer kick yetkili verisi açıksa
            if (kickAuth) {
                if (moderationRoleIds.kickAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.kickAuth)) countableObject.kickAuth += 1;`;
            }

            // Eğer mute yetkili verisi açıksa
            if (muteAuth) {
                if (moderationRoleIds.muteAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.muteAuth)) countableObject.muteAuth += 1;`;
            }

            // Embed mesajına Yetkili bilgileri kısmını ekle
            authInformation = true;
        }

        // Şimdi oluşturduğumuz kodu bir fonksiyona tanımlıyoruz ve bütün kullanıcılarda kontrol ediyoruz
        const checkFunction = new Function("countableObject", "guildDatabase", "member", code);

        allMembers.forEach(member => {
            checkFunction(
                countableObject,
                guildDatabase,
                member
            );
        });

        // Eğer Sunucu bilgileri eklenecekse
        if (serverInformation) embedFields.push({
            name: "__Sunucu bilgileri__",
            value: [
                `Sunucuda toplam ${numberToFormat(countableObject.total)} üye bulunuyor`,
                (type == "normal" ?
                    `Sunucuda toplam ${numberToFormat(countableObject.registered)} kayıtlı üye` :
                    `Sunucuda toplam ${numberToFormat(countableObject.boy)} erkek üye, ${numberToFormat(countableObject.girl)} kız üye`) +
                ` ve ${numberToFormat(countableObject.unregister)} kayıtsız üye bulunuyor`,
                `Sesli kanallarda toplam ${numberToFormat(countableObject.voice)} üye bulunuyor`,
                `Sunucuda toplam ${numberToFormat(guild.premiumSubscriptionCount)} boost ve ${numberToFormat(countableObject.boostMembers)} boost basan üye bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.vip)} vip üye bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.jail)} kişi jailde`
            ].map(mapFunction).join("\n\n")
        });

        // Eğer Yetkili bilgileri eklenecekse
        if (authInformation) embedFields.push({
            name: "__Yetkili bilgileri__",
            value: [
                `Sunucuda toplam ${numberToFormat(countableObject.registerAuth)} kayıt yetkilisi bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.jailAuth)} jail yetkilisi bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.vipAuth)} vip yetkilisi bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.banAuth)} ban yetkilisi bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.kickAuth)} kick yetkilisi bulunuyor`,
                `Sunucuda toplam ${numberToFormat(countableObject.muteAuth)} mute yetkilisi bulunuyor`
            ].map(mapFunction).join("\n\n")
        });

        // Mesajı hazırla ve gönder
        const guildIcon = guild.iconURL();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(...embedFields)
            .setColor("#611079")
            .setThumbnail(guildIcon)
            .setTimestamp();

        // Eğer kullanıcının "Yönetici" yetkisi varsa say ayarlarını nasıl değiştirileceğini göster
        if (msgMember.permissions.has("Administrator")) embed.setDescription(`**• Say ayarlarını değiştirmek için __${prefix}say-ayarlar__ yazabilirsiniz**`)

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};