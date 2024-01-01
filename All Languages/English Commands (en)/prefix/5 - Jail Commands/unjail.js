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
    description: "Takes the user out of jail", // Komutun açıklaması
    category: "Jail commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unjail <@user or User ID>", // Komutun kullanım şekli
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
        prefix,
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        // Eğer jail rolü ayarlı değilse
        const jailRoleId = guildDatabase.jail.roleId;
        if (!jailRoleId) return errorEmbed(
            `Jail role are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}jail-role @role**` :
                "")
        );

        // Eğer jail rolünün sırası bottan üstteyse
        const highestRole = guildMe.roles.highest;
        if (guild.roles.cache.get(jailRoleId)?.position >= highestRole.position) return errorEmbed(`The set jail role is higher than my role's rank! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, content);

        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer kendini Jail'den çıkarmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("You can't get yourself out of Jail you stupid thing :)");

        // Eğer sunucu sahibini Jail'den çıkarmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't get the server owner out of Jail, you stupid thing :)");

        // Eğer kişi zaten jailde değil ise
        if (!member["_roles"].includes(jailRoleId)) return errorEmbed(`The person you tagged is not already in jail!`);

        // Eğer Jail'den çıkarmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

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

                msg.reply(`${EMOJIS.yes} <@${memberId}> has been released from jail!`);

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
                                `**🔊 Member <@${memberId}> has been released from jail**\n\n` +
                                `🧰 **AUTHORITY WHO UNJAILED MEMBER**\n` +
                                `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **UNJAILED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Given role:** <@&${jailRoleId}>`
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
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I don't have permission to edit <@${memberId}>'s roles. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                console.log(err);
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};