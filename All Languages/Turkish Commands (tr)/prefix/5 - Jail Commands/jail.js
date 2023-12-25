"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "jail", // Komutun ismi
    id: "jail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jail",
    ],
    description: "Kullanıcıyı Jail'e atar", // Komutun açıklaması
    category: "Jail komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jail <@kişi veya Kişi ID'si> [Sebebi]", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Yönetici`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Rolleri Yönet", "botPermissionError");

        // Eğer jail rolü ayarlı değilse
        const jailRoleId = guildDatabase.jail.roleId;
        if (!jailRoleId) return errorEmbed(
            `Bu sunucuda herhangi bir jail rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}jailrol @rol** yazabilirsiniz` :
                "")
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(`Ayarlanan jail rolü benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kendini Jail'e atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("Kendini Jail'e atamazsın şapşik şey seni :)");

        // Eğer sunucu sahibini Jail'e atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini Jail'e atamazsın şapşik şey seni :)");

        // Eğer kişi zaten jailde ise
        if (member["_roles"].length == 1 && member["_roles"].includes(jailRoleId)) return errorEmbed(`Etiketlediğiniz kişi zaten jailde!`);

        // Eğer Jail'e atmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
        const reason = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").replace(/ {2,}/, "").trim();

        // Kullanıcının şimdiki rollerini Database'ye kaydet
        const memberPrevRoles = member["_roles"];
        guildDatabase.jail.prevRoles[memberId] = memberPrevRoles;

        // Kullanıcının bütün rollerini al ve Jail'e at
        await member.edit({
            roles: [jailRoleId]
        })
            // Eğer Jail'e atma başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "jail",
                    authorId,
                    timestamp: NOW_TIME,
                    isJailed: true
                });

                msg.reply({
                    content: `${EMOJIS.yes} <@${memberId}> adlı kişi __**${reason || "Sebep belirtilmemiş"}**__ sebebinden Jail'e atıldı!`,
                    allowedMentions: {
                        users: [memberId],
                        roles: [],
                        repliedUser: true
                    }
                });

                // Kişinin Jail'e atılma bilgilerini Database'ye kaydet
                guildDatabase.jail.last.unshift({
                    timestamp: NOW_TIME,
                    reason,
                    authorId,
                    isTempJailed: false,
                    isJailed: true,
                    memberId
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                // Eğer jail log kanalı varsa o kanala mesaj at
                const jailLogChannelId = guildDatabase.jail.logChannelId;
                if (jailLogChannelId) {
                    const modChannel = guild.channels.cache.get(jailLogChannelId);

                    // Eğer kanal varsa işlemleri devam ettir
                    if (modChannel) {
                        const memberAvatar = member.displayAvatarURL();

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**🔇 <@${memberId}> adlı üye Jail'e atıldı**\n\n` +
                                `🧰 **JAIL'E ATAN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **JAIL'E ATILAN KİŞİ**\n` +
                                `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Verilen rol:** <@&${jailRoleId}>\n` +
                                `**• Sebebi:** ${reason || "Sebep belirtilmemiş"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `Alisa Log sistemi`,
                                iconURL: msg.client.user.displayAvatarURL()
                            })
                            .setTimestamp()

                        modChannel.send({
                            embeds: [
                                embed
                            ]
                        })
                    }

                }

            }).catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`<@${memberId}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

                console.log(err);
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};