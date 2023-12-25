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
    name: "jail", // Komutun ismi
    id: "jail", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jail",
    ],
    description: "Jails the user", // Komutun açıklaması
    category: "Jail commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jail <@user or User ID> [Reason]", // Komutun kullanım şekli
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

        // Eğer kendini Jail'e atmaya çalışıyorsa
        if (memberId == authorId) return errorEmbed("You can't put yourself in Jail, you stupid thing :)");

        // Eğer sunucu sahibini Jail'e atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't jail the server owner, you stupid thing :)");

        // Eğer kişi zaten jailde ise
        if (member["_roles"].length == 1 && member["_roles"].includes(jailRoleId)) return errorEmbed(`The person you tagged is already in jail!`);

        // Eğer Jail'e atmaya çalıştığı kişi botun rolünün üstündeyse
        if (member.roles.highest.position >= highestRole.position) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

        // Sebepten kişinin ID'sini ve fazla boşlukları kaldır
        const reason = content.replace(new RegExp(`<@!?${memberId}>|${memberId}`, "g"), "").replace(/ {2,}/, "").trim();

        // Kullanıcının şimdiki rollerini Database'ye kaydet
        const memberPrevRoles = member["_roles"]
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
                    content: `${EMOJIS.yes} <@${memberId}> was sent to Jail for __**${reason || "Reason not stated"}**__!`,
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
                                `**🔇 Member <@${memberId}> has been jailed**\n\n` +
                                `🧰 **AUTHORITY WHO JAILED THE MEMBER**\n` +
                                `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n\n` +
                                `👤 **JAILED MEMBER**\n` +
                                `**• Name:** <@${memberId}> - ${Util.recreateString(member.user.displayName)}\n` +
                                `**• Given role:** <@&${jailRoleId}>\n` +
                                `**• Reason:** ${reason || "Reason not stated"}`
                            )
                            .setThumbnail(memberAvatar)
                            .setColor("#b90ebf")
                            .setFooter({
                                text: `Alisa Log system`,
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