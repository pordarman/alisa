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
    description: "Unmutes the user", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unmute <@user or User ID>", // Komutun kullanım şekli
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
        guildId,
        guild,
        authorId,
        args,
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.moderation.roleIds.muteAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("ModerateMembers")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Moderate Members`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyelere zaman aşımı uygula" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("ModerateMembers")) return errorEmbed("Moderate Members", "memberPermissionError");

        // Eğer botta "Üyelere zaman aşımı uygula" yetkisi yoksa
        if (!guildMe.permissions.has("ModerateMembers")) return errorEmbed("Moderate Members", "botPermissionError");

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]);

        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer sunucu sahibinin mutesini açmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't use this command on the server owner, you stupid thing :)");

        // Eğer kişi zaten muteli değil ise
        if (!member.communicationDisabledUntilTimestamp) return errorEmbed(`The person you tagged has not already been silenced!`);

        // Eğer mutesini açmaya çalıştığı kişi botun rolünün üstündeyse
        const highestRole = guildMe.roles.highest;
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        // Kullanıcının mutesini kaldır
        await member.disableCommunicationUntil(null, `The authority that removes the mute: ${msg.author.displayName}`)
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

                msg.reply(`${EMOJIS.yes} Successfully unmuted <@${memberId}>!`);

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
                                `**🔊 Member <@${memberId}> has been unmuted**\n\n` +
                                `🧰 **AUTHORITY WHO UNMUTED THE MEMBER**\n` +
                                `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                                `**• Mute date:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                                `👤 **MUTED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `${msg.client.user.username} Log system`,
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
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to silence <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                console.log(err);
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};