"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "say",
        en: "count"
    },
    id: "say", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "say",
            "count"
        ],
        en: [
            "count"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuda kaç üye olduğunu gösterir",
        en: "Shows how many members are on the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>say",
        en: "<px>count"
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
        prefix,
        language,
        errorEmbed,
    }) {

        const countSettings = guildDatabase.countCommandSettings;

        // Say komutundaki veriler için tanımlamalar yapıyoruz
        const { isEmoji } = countSettings;
        const numberToFormat = isEmoji ? (number) => Util.stringToEmojis(number) : (number) => `**${Util.toHumanize(number, language)}**`;
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
            vipAuth,
            status
        } = countSettings.datas;
        const allMembers = await Util.getMembers(guild);
        const embedFields = [];
        const {
            roleIds,
            type,
        } = guildDatabase.register;
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
            online: 0,
        }

        let serverInformation = false;
        let authInformation = false;

        // Bütün üyeleri birden kontrol edeceğimiz için fonksiyonun içine koyulacak kod bloğumuzu yazıyoruz
        let code = `const memberRolesSet = new Set(member["_roles"]);`

        // Eğer bunlardan birisi varsa kullanıcılar için yeni field oluştur
        if (status || total || registered || voice || vip || jail || boostCount) {
            // Eğer toplam verisi açıksa
            if (total) code += `countableObject.total += 1;`;

            // Eğer üye çevrimiçiyse
            if (status) code += `if (member.presence && member.presence.status !== "offline") countableObject.online += 1;`;

            // Eğer kayıtlı üye verisi açıksa
            if (registered) {
                // Eğer kayıt şekli "Üyeli kayıt" ise
                if (type == "member") {
                    if (guildDatabase.register.roleIds.member.length > 0) code += `if (guildDatabase.register.roleIds.member.every(roleId => memberRolesSet.has(roleId))) countableObject.registered += 1;`;
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
                if (guildDatabase.moderation.roleIds.banAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.banAuth)) countableObject.banAuth += 1;`;
            }

            // Eğer kick yetkili verisi açıksa
            if (kickAuth) {
                if (guildDatabase.moderation.roleIds.kickAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.kickAuth)) countableObject.kickAuth += 1;`;
            }

            // Eğer mute yetkili verisi açıksa
            if (muteAuth) {
                if (guildDatabase.moderation.roleIds.muteAuth) code += `if (memberRolesSet.has(guildDatabase.moderation.roleIds.muteAuth)) countableObject.muteAuth += 1;`;
            }

            // Embed mesajına Yetkili bilgileri kısmını ekle
            authInformation = true;
        }

        const {
            commands: {
                "say": messages
            }
        } = allMessages[language];

        // Eğer hiçbir veri gösterilmemesi için ayarlanmışsa hata döndür
        if (!serverInformation && !authInformation) return errorEmbed(
            messages.error({
                prefix,
                hasAdmin: msgMember.permissions.has("Administrator")
            })
        );

        // Şimdi oluşturduğumuz kodu bir fonksiyona tanımlıyoruz ve bütün kullanıcılarda kontrol ediyoruz
        const checkFunction = new Function("countableObject", "guildDatabase", "member", code);

        allMembers.forEach(member => {
            checkFunction(
                countableObject,
                guildDatabase,
                member
            );
        });

        // Eğer mesaj emojili ise "**" işaretini en başına ve en sonuna koy ve diziyi döndür
        function createArray(array) {
            if (!isEmoji) return array;

            array[0] = `**${array[0]}`;
            array[array.length - 1] = `${array[array.length - 1]}**`;
            return array;
        }

        // Eğer Sunucu bilgileri eklenecekse
        if (serverInformation) embedFields.push({
            name: messages.serverInformation.name,
            value: Util.mapAndJoin(
                createArray(
                    messages.serverInformation.value({
                        datas: {
                            registerType: type,
                            ...countableObject,
                            boostCount: guild.premiumSubscriptionCount,
                            numberToFormat
                        },
                        openOrCloseDatas: countSettings.datas
                    })
                ),
                value => `${EMOJIS.count} ${value}`,
                "\n\n"
            )
        });

        // Eğer Yetkili bilgileri eklenecekse
        if (authInformation) embedFields.push({
            name: messages.authInformation.name,
            value: Util.mapAndJoin(
                createArray(messages.authInformation.value({
                    datas: {
                        ...countableObject,
                        numberToFormat
                    },
                    openOrCloseDatas: countSettings.datas
                })),
                value => `${EMOJIS.count} ${value}`,
                "\n\n"
            )
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
        if (msgMember.permissions.has("Administrator")) embed.setDescription(messages.description(prefix));

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};