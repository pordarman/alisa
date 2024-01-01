"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "unjail", // Komutun ismi
    id: "unjail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unjail",
    ],
    description: "Kullanıcıyı jail'den çıkarır", // Komutun açıklaması
    category: "Jail komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unjail <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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
            `Bu sunucuda herhangi bir Jail rolü __ayarlanmamış__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• Ayarlamak için **${prefix}jailrol @rol** yazabilirsiniz` :
                "")
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(`Ayarlanan Jail rolü benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer kendini Jail'den çıkarmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("Kendini Jail'den çıkaramazsın şapşik şey seni :)");

        // Eğer sunucu sahibini Jail'den çıkarmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Sunucu sahibini Jail'den çıkaramazsın şapşik şey seni :)");

        // Eğer kişi zaten jailde değil ise
        if (!member["_roles"].includes(jailRoleId)) return errorEmbed(`Etiketlediğiniz kişi zaten jailde değil!`);

        // Eğer Jail'den çıkarmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        // Kullanıcıyı Jail'e atmadan önce kaydedilen rolleri çek ve sil
        const memberPrevRoles = guildDatabase.jail.prevRoles[memberId] || [];
        delete guildDatabase.jail.prevRoles[memberId];

        // Kullanıcının jail'den çıkar ve bütün rollerini geri ver
        await member.edit({
            roles: memberPrevRoles
        })
            // Eğer Jail'den çıkarma başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                // Eğer kullanıcı tempjaile atıldıysa setTimeout fonksiyonunu durdur
                const isSetTimeout = msg.client.jailedMembers.get(`${guildId}.${memberId}`);
                if (typeof isSetTimeout == "function") {
                    isSetTimeout();
                    msg.client.jailedMembers.delete(`${guildId}.${memberId}`);
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "unjail",
                    authorId,
                    timestamp: NOW_TIME
                });

                msg.reply(`${EMOJIS.yes} <@${memberId}> adlı kişi jail'den çıkarıldı!`);

                // Kişinin Jail'e atılma bilgilerini Database'ye kaydet
                guildDatabase.jail.last.unshift({
                    timestamp: NOW_TIME,
                    authorId,
                    isJailed: false,
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
                                `**🔊 <@${memberId}> adlı üye jail'den çıkarıldı**\n\n` +
                                `🧰 **JAIL'DEN ÇIKARAN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **JAIL'DEN ÇIKARILAN KİŞİ**\n` +
                                `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Verilen rol:** <@&${jailRoleId}>`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `${msg.client.user.username} Log sistemi`,
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