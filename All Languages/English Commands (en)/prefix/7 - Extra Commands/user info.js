"use strict";
const {
    EmbedBuilder
} = require("discord.js")
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "userinfo", // Komutun ismi
    id: "kullanıcıbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "userinfo",
    ],
    description: "Shows the user's basic information", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>userinfo [@user or User ID]", // Komutun kullanım şekli
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

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi bilgilerini göster
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]) || msgMember;

        // Kullanıcının bannerini çekmek için önce fetch ile güncelliyoruz
        await member.fetch(true).catch(() => { });
        const memberRoles = member["_roles"].map(roleId => guild.roles.cache.get(roleId));

        // Resimler
        const memberGuildAvatar = member.avatarURL();
        const userDiscordAvatar = member.user.displayAvatarURL();
        const showPictureInEmbed = memberGuildAvatar ?? userDiscordAvatar;
        const userBanner = member.user.bannerURL();
        const isUserBot = member.user.bot ? `🤖 **Is the member a bot:** Yes` : `👤 **Is the member a bot:** No`;

        // Milisaniyeyi saniyeye çevirme
        function milisecondsToSeconds(miliseconds) {
            return Math.round(miliseconds / 1000);
        }

        const guildInfos = [
            `📆 **Date of joining the server:** <t:${milisecondsToSeconds(member.joinedTimestamp)}:F> - <t:${milisecondsToSeconds(member.joinedTimestamp)}:R>`
        ]
        // Eğer kullanıcı sunucuya boost bastıysa bastığı tarihini göster
        if (member.premiumSinceTimestamp) guildInfos.push(`${EMOJIS.boostUsers} **Date the server was boosted:** <t:${milisecondsToSeconds(member.premiumSinceTimestamp)}:F> - <t:${milisecondsToSeconds(member.premiumSinceTimestamp)}:R>`)
        guildInfos.push(
            `💎 **Highest role on the server:** <@&${member.roles.highest.id}>`,
            `✏️ **Name on server:** ${member.nickname ?? "It has no name on the server"}`
        )
        if (member.voice.channelId) guildInfos.push(`🔊 **Current channel:** <#${member.voice.channelId}>`);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: member.user.displayName,
                iconURL: showPictureInEmbed
            })
            .setThumbnail(showPictureInEmbed)
            .setImage(userBanner ?? null)
            .setColor(member.displayHexColor ?? "#9e02e2")
            .addFields(
                {
                    name: "BASIC INFORMATIONS",
                    value: `🆔 **Member's ID:** ${member.user.id}\n` +
                        `${isUserBot}\n` +
                        `📅 **Account creation date:** <t:${milisecondsToSeconds(member.user.createdTimestamp)}:F> - <t:${milisecondsToSeconds(member.user.createdTimestamp)}:R>`
                },
                {
                    name: "SUNUCU BİLGİLERİ",
                    value: guildInfos.join("\n")
                },
                {
                    name: "PHOTOS",
                    value: `📱 **Profile photo:** [ [URL] ](${userDiscordAvatar})\n` +
                        `🖥️ **Presenter profile photo:** ${memberGuildAvatar ? `[ [URL] ](${memberGuildAvatar})` : "~~[URL]~~"}\n` +
                        `🖼️ **Banner:** ${userBanner ? `[ [URL] ](${userBanner})` : "~~[URL]~~"}`
                },
                {
                    name: `${EMOJIS.role} ROLES (${Util.toHumanize(memberRoles.length, language)})`,
                    value: memberRoles.length == 0 ?
                        "• There's nothing to show here..." :
                        memberRoles
                            .sort((a, b) => b.position - a.position)
                            .slice(0, Util.MAX.showRoleInInfo)
                            .map(role => `<@&${role.id}>`)
                            .join(" | ") +
                        (memberRoles.length > Util.MAX.showRoleInInfo ? `+${memberRoles.length - Util.MAX.showRoleInInfo} more roles...` : "")
                }
            )
            .setTimestamp()

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};