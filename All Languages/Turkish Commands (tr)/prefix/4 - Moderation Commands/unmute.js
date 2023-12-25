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
    name: "unmute", // Komutun ismi
    id: "unmute", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unmute",
    ],
    description: "Kullanıcının susturmasını kaldırır", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unmute <@kişi veya Kişi ID'si>", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.moderation.roleIds.muteAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("ModerateMembers")) return errorEmbed(`<@&${authorizedRoleId}> rolüne **veya** Üyelere zaman aşımı uygula`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyelere zaman aşımı uygula" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("ModerateMembers")) return errorEmbed("Üyelere zaman aşımı uygula", "memberPermissionError");

        // Eğer botta "Üyelere zaman aşımı uygula" yetkisi yoksa
        if (!guildMe.permissions.has("ModerateMembers")) return errorEmbed("Üyelere zaman aşımı uygula", "botPermissionError");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]);

        if (!member) return errorEmbed(
            member === null ?
                "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" :
                "Lütfen bir kişiyi etiketleyiniz ya da ID'sini giriniz"
        );

        const memberId = member.id;

        // Eğer sunucu sahibinin mutesini açmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("Bu komutu sunucu sahibinin üstünde kullanamazsın şapşik şey seni :)");

        // Eğer kişi zaten muteli değil ise
        if (!member.communicationDisabledUntilTimestamp) return errorEmbed(`Etiketlediğiniz kişi zaten susturulmuş değil!`);

        // Eğer mutesini açmaya çalıştığı kişi botun rolünün üstündeyse
        const highestRole = guildMe.roles.highest;
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen <@&${Util.getBotOrHighestRole(guildMe).id}> adlı rolü üste çekiniz ve tekrar deneyiniz`);

        // Kullanıcının mutesini kaldır
        await member.disableCommunicationUntil(null, `Muteyi kaldıran yetkili: ${msg.author.displayName}`)
            // Eğer muteyi kaldırma işlemi başarılıysa
            .then(async () => {
                const NOW_TIME = Date.now();

                // Kullanıcının mutesini açmadan önce önceki mesaj atma setTimeout fonksiyonunu kaldır
                const isSetTimeout = msg.client.mutedMembers.get(`${guildId}.${memberId}`);
                if (typeof isSetTimeout == "function") {
                    isSetTimeout();
                    msg.client.mutedMembers.delete(`${guildId}.${memberId}`);
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "unmute",
                    authorId,
                    timestamp: NOW_TIME
                });

                msg.reply(`${EMOJIS.yes} <@${memberId}> adlı kişinin susturulması başarıyla kaldırıldı!`);

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal varsa işlemleri devam ettir
                    if (modChannel) {
                        const memberAvatar = member.displayAvatarURL();

                        // Milisaniyeden saniyeye çevirme fonksiyonu
                        function msToSecond(milisecond) {
                            return Math.round(milisecond / 1000);
                        }

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: member.user.displayName,
                                iconURL: memberAvatar
                            })
                            .setDescription(
                                `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**\n\n` +
                                `🧰 **SUSTURMAYI AÇAN YETKİLİ**\n` +
                                `**• Adı:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                                `**• Susturmayı açtığı tarihi:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                                `👤 **SUSTURULMASI AÇILAN ÜYE**\n` +
                                `**• Adı:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}`
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