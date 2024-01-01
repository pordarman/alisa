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
    name: "unban", // Komutun ismi
    id: "unban", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unban",
    ],
    description: "You unban the banned member on the server", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unban <Person ID>", // Komutun kullanım şekli
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
        const authorizedRoleId = guildDatabase.register.roleIds.banAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("BanMembers")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Ban Members`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Üyeleri Yasakla" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("BanMembers")) return errorEmbed("Ban Members", "memberPermissionError");

        // Eğer botta "Üyeleri engelle" yetkisine sahip değilse hata döndür
        if (!guildMe.permissions.has("BanMembers")) return errorEmbed("Ban Members", "botPermissionError");

        const userId = args[0]?.replace(/[<@!>]/g, "");

        if (!userId) return errorEmbed(
            `• Please tag a valid member or enter their ID\n\n` +
            `**Example:**\n` +
            `• ${prefix}${this.name} @üye\n` +
            `• ${prefix}${this.name} 1234567890123456`,
            "warn"
        );

        const guildBans = await guild.bans.fetch().catch(() => { });

        // Eğer bir hata olur da banları çekemezse hata döndür
        if (!guildBans) return errorEmbed(`An error occurred, please try again later!`);

        // Eğer girdiği ID yasaklanan kişilerde yoksa hata döndür
        if (!guildBans.has(userId)) return errorEmbed(`The member you tagged has not already been banned from the server!`);

        // Üyenin yasağını kaldır
        await guild.members.unban(userId)
            // Eğer yasak kaldırma başarılı olursa
            .then((user) => {
                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[userId] ??= [];

                userLogs.unshift({
                    type: "unban",
                    authorId,
                    timestamp: NOW_TIME
                });

                // Database'yi güncelle
                database.writeFile(guildDatabase, guildId);

                const recreateUserName = Util.recreateString(user.displayName)

                msg.reply(`${EMOJIS.yes} Successfully unbanned **${recreateUserName} - (${user.id})**!`);

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
                            `**${EMOJIS.party} <@${user.id}>'s ban has been removed**\n\n` +
                            `🧰 **AUTHORITY WHO RECEIVED THE BANNING**\n` +
                            `**• Name:** <@${authorId}> - ${Util.recreateString(msg.author.displayName)}\n` +
                            `**• Date of unban:** <t:${msToSecond(NOW_TIME)}:F> - <t:${msToSecond(NOW_TIME)}:R>\n\n` +
                            `👤 **UNBANNED MEMBER**\n` +
                            `**• Name:** <@${user.id}> - ${recreateUserName}`
                        )
                        .setThumbnail(userAvatar)
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
            })
            // Eğer yasak kaldırma başarısız olursa
            .catch(err => {
                return errorEmbed(
                    "An error occurred while unbanning the member you wanted to unban :(\n\n" +
                    "**Reason:**" +
                    `• ${err}`,
                    "error",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
            })

    },
};