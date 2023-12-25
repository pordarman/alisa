"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "ban", // Komutun ismi
    id: "ban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "ban",
    ],
    description: "Bans the member you tag from the server", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>ban <@user or User ID> [Reason]", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.register.roleIds.banAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("BanMembers")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Ban Members`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri Yasakla" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("BanMembers")) return errorEmbed("Ban Members", "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMe.permissions.has("BanMembers")) return errorEmbed("Ban Members", "botPermissionError");

        const content = args.join(" ");
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, content);

        if (!user) return errorEmbed(
            user === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const userId = user.id;

        // Eğer kendini yasaklamaya çalışıyorsa
        if (userId == authorId) return errorEmbed("You can't ban yourself from the server, you stupid thing :)");

        // Eğer kullanıcı sunucuda bulunuyorsa
        const guildMember = await Util.fetchMemberForce(msg, userId);
        if (guildMember) {

            // Eğer sunucu sahibini yasaklamaya çalışıyorsa
            if (guildMember.id == guild.ownerId) return errorEmbed("You can't ban the server owner, you stupid thing :)");

            // Eğer kendi rolünün üstündeyse
            const memberHighestRolePosition = guildMember.roles.highest.position;
            if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId != guild.ownerId) return errorEmbed("The person you are trying to ban is above your role, so you cannot ban this person");

            // Eğer botun rolünün üstündeyse
            if (memberHighestRolePosition >= guildMe.roles.highest.position) return errorEmbed("The role of the person you are trying to ban is higher than mine, please move my role to the top and try again");
        }

        const reason = content.replace(
            new RegExp(`<@!?${userId}>|${userId}`, "gi"),
            ""
        ).replace(/ +/g, " ").trim();

        // Üyeyi sunucudan yasaklama
        await guild.members.ban(userId, {
            reason: `Forbidding: ${msg.author.displayName} | Reason: ${reason || "Reason not stated"}`
        })
            // Eğer yasaklama başarılı olursa
            .then(() => {
                const NOW_TIME = Date.now();

                // Eğer yasaklanan kişi bot değilse ceza numarasını güncelle
                let penaltyNumber;
                if (!user.bot) {
                    penaltyNumber = guildDatabase.penaltyNumber++;
                }

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[userId] ??= [];

                userLogs.unshift({
                    type: "ban",
                    authorId,
                    timestamp: NOW_TIME,
                    penaltyNumber
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                const recreateUserName = Util.recreateString(user.displayName)

                msg.reply(`${EMOJIS.yes} **${recreateUserName} - (${userId})** successfully banned from the server, enjoy 🥳${penaltyNumber ? ` **Penalty number:** \`#${penaltyNumber}\`` : ""}${!guildMember ? " - *( This person was not on the server )*" : ""}`)

                // Eğer mod log kanalı varsa o kanala mesaj at
                const modLogChannelId = guildDatabase.moderation.channelIds.modLog;
                if (modLogChannelId) {
                    const modChannel = guild.channels.cache.get(modLogChannelId);

                    // Eğer kanal yoksa hiçbir şey döndürme
                    if (!modChannel) return;

                    const userAvatar = user.displayAvatarURL();

                    // Milisaniyeden saniyeye çevirme fonksiyonu
                    function msToSecond(milisecond) {
                        return Math.round(milisecond / 1000);
                    }

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: user.displayName,
                            iconURL: userAvatar
                        })
                        .setDescription(
                            `**${EMOJIS.ban} <@${userId}> has been __permanently banned from the server**\n\n` +
                            `🧰 **AUTHORITY WHO BANNED THE MEMBER**\n` +
                            `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                            `**• Ban date:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                            `👤 **BANNED MEMBER**\n` +
                            `**• Name:** <@${userId}> - ${recreateUserName}\n` +
                            `**• Reason:** ${reason || "Reason not stated"}` +
                            (penaltyNumber ?
                                `\n• **Penalty number:** \`#${penaltyNumber}\`` :
                                "")
                        )
                        .setThumbnail(userAvatar)
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
            })
            // Eğer yasaklama başarısız olursa
            .catch(err => {
                return errorEmbed(
                    "I could not ban the member you want to ban from the server :(\n\n" +
                    "**Reason:**" +
                    `• ${err}`,
                    "error",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
            })

    },
};