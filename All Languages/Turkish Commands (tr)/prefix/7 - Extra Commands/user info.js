"use strict";
const {
    EmbedBuilder
} = require("discord.js")
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kullanıcıbilgi", // Komutun ismi
    id: "kullanıcıbilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kullanıcıbilgi",
        "userinfo",
        "kbilgi"
    ],
    description: "Kullanıcının temel bilgilerini gösterir", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kullanıcıbilgi [@kişi veya Kişi ID'si]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        msgMember,
        guild,
        args,
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
        const isUserBot = member.user.bot ? `🤖 **Üye bot mu:** Evet` : `👤 **Üye bot mu:** Hayır`;

        // Milisaniyeyi saniyeye çevirme
        function milisecondsToSeconds(miliseconds) {
            return Math.round(miliseconds / 1000);
        }

        const guildInfos = [
            `📆 **Sunucuya katılma tarihi:** <t:${milisecondsToSeconds(member.joinedTimestamp)}:F> - <t:${milisecondsToSeconds(member.joinedTimestamp)}:R>`
        ]
        // Eğer kullanıcı sunucuya boost bastıysa bastığı tarihini göster
        if (member.premiumSinceTimestamp) guildInfos.push(`${EMOJIS.boostUsers} **Sunucuya boost bastığı tarih:** <t:${milisecondsToSeconds(member.premiumSinceTimestamp)}:F> - <t:${milisecondsToSeconds(member.premiumSinceTimestamp)}:R>`)
        guildInfos.push(
            `💎 **Sunucudaki en yüksek rolü:** <@&${member.roles.highest.id}>`,
            `✏️ **Sunucudaki adı:** ${member.nickname ?? "Sunucudaki adı yok"}`
        )
        if (member.voice.channelId) guildInfos.push(`🔊 **Şu anda bulunduğu kanal:** <#${member.voice.channelId}>`);

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
                    name: "TEMEL BİLGİLERİ",
                    value: `🆔 **Üyenin ID'si:** ${member.user.id}\n` +
                        `${isUserBot}\n` +
                        `📅 **Hesabı oluşturma tarihi:** <t:${milisecondsToSeconds(member.user.createdTimestamp)}:F> - <t:${milisecondsToSeconds(member.user.createdTimestamp)}:R>`
                },
                {
                    name: "SUNUCU BİLGİLERİ",
                    value: guildInfos.join("\n")
                },
                {
                    name: "FOTOĞRAFLAR",
                    value: `📱 **Profil fotoğrafı:** [ [URL] ](${userDiscordAvatar})\n` +
                        `🖥️ **Sunucu profil fotoğrafı:** ${memberGuildAvatar ? `[ [URL] ](${memberGuildAvatar})` : "~~[URL]~~"}\n` +
                        `🖼️ **Banner:** ${userBanner ? `[ [URL] ](${userBanner})` : "~~[URL]~~"}`
                },
                {
                    name: `${EMOJIS.role} ROLLERİ (${Util.toHumanize(memberRoles.length, language)})`,
                    value: memberRoles.length == 0 ?
                        "• Burada gösterilecek hiçbir şey yok..." :
                        memberRoles
                            .sort((a, b) => b.position - a.position)
                            .slice(0, Util.MAX.showRoleInInfo)
                            .map(role => `<@&${role.id}>`)
                            .join(" | ") +
                        (memberRoles.length > Util.MAX.showRoleInInfo ? `+${memberRoles.length - Util.MAX.showRoleInInfo} rol daha...` : "")
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