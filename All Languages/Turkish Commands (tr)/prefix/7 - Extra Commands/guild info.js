"use strict";
const {
    EmbedBuilder,
    ChannelType,
    GuildDefaultMessageNotifications
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "sunucubilgi", // Komutun ismi
    id: "sunucubilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sunucubilgi",
        "sbilgi",
        "sunucubilgisi",
        "guildinfo"
    ],
    description: "Sunucunun temel bilgilerini gösterir", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sunucubilgi", // Komutun kullanım şekli
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
        guildId,
        guild,
        language,
    }) {

        // Sunucu resimleri
        const guildIcon = guild.iconURL();
        const guildBanner = guild.bannerURL();
        const guildSplash = guild.splashURL();
        const guildDiscoverySplash = guild.discoverySplashURL();

        // Sayılabilen veriler
        const allMembers = await Util.getMembers(msg);
        const allBots = allMembers.filter(member => member.user.bot);
        const allChannels = guild.channels.cache;
        const allRoles = guild.roles.cache.clone();
        const allEmojis = guild.emojis.cache;
        const animatedEmojis = allEmojis.filter(emoji => emoji.animated);
        const channelsCount = {
            text: 0,
            voice: 0,
            category: 0,
            others: 0
        }
        // Bütün kanallarda dolaş ve kanal sayılarını kaydet
        allChannels.forEach(channel => {
            switch (channel.type) {
                case ChannelType.GuildText:
                    channelsCount.text += 1;
                    break;

                case ChannelType.GuildVoice:
                    channelsCount.voice += 1;
                    break;

                case ChannelType.GuildCategory:
                    channelsCount.category += 1;
                    break;

                default:
                    channelsCount.others += 1;
                    break;
            }
        });

        allRoles.delete(guildId);

        // Milisaniyeyi saniyeye çevirme
        function milisecondsToSeconds(miliseconds) {
            return Math.round(miliseconds / 1000);
        }

        const basicInformation = [
            `🆔 **Sunucunun ID'si:** ${guildId}`,
            `📅 **Sunucunun kuruluş tarihi:** <t:${milisecondsToSeconds(guild.createdTimestamp)}:F> - <t:${milisecondsToSeconds(guild.createdTimestamp)}:R>`,
            `🔔 **Sunucunun varsayılan mesaj bildirimleri:** ${guild.defaultMessageNotifications == GuildDefaultMessageNotifications.AllMessages ? "Bütün mesajlar 📬" : `Sadece etiketler ${EMOJIS.role}`}`
        ];

        // Eğer sunucunun özel daveti varsa onu da ekle
        const vanityData = await guild.fetchVanityData().catch(() => { });
        if (vanityData) basicInformation.push(`✉️ **Sunucunun özel daveti:** https://discord.gg/${vanityData.code} - (${vanityData.uses})`);

        // Sunucunun afk kanalı veya kurallar kanalı varsa onu da ekle                                             1000 ile çarpmamızın nedeni afkTimeout saniye cinsindendir
        if (guild.afkChannel) basicInformation.push(`🔇 **AFK kanalı:** <#${guild.afkChannelId}> (${Time.duration(guild.afkTimeout * 1000, language)})`)
        if (guild.rulesChannel) basicInformation.push(`${EMOJIS.rules} **Kurallar kanalı:** <#${guild.rulesChannelId}>`);

        basicInformation.push(`👑 **Sunucunun sahibi:** <@${guild.ownerId}> - (${guild.ownerId})`)

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(
                {
                    name: "TEMEL BİLGİLER",
                    value: basicInformation.join("\n")
                },
                {
                    name: `KANALLAR (${Util.toHumanize(allChannels.size, language)})`,
                    value: `${EMOJIS.channel} **Yazı kanalı:** ${Util.toHumanize(channelsCount.text, language)}\n` +
                        `${EMOJIS.voice} **Ses kanalı:** ${Util.toHumanize(channelsCount.voice, language)}\n` +
                        `🖇️ **Kategori:** ${Util.toHumanize(channelsCount.category, language)}\n` +
                        `🎞️ **Diğer kanallar:** ${Util.toHumanize(channelsCount.others, language)}`,
                    inline: true
                },
                {
                    name: `ÜYELER (${Util.toHumanize(allMembers.size, language)})`,
                    value: `👥 **Üye sayısı:** ${Util.toHumanize(allMembers.size - allBots.size, language)}\n` +
                        `🤖 **Bot sayısı:** ${Util.toHumanize(allBots.size, language)}`,
                    inline: true
                },
                {
                    name: `EMOJİLER (${allEmojis.size})`,
                    value: `${EMOJIS.unactive} **Haraketsiz emoji sayısı:** ${allEmojis.size - animatedEmojis.size}\n` +
                        `${EMOJIS.active} **Haraketli emoji sayısı:** ${animatedEmojis.size}`
                },
                {
                    name: "BOOST BİLGİLERİ",
                    value: `${EMOJIS.boostUsers} **Boost basan kişi sayısı:** ${allMembers.filter(member => member.premiumSinceTimestamp).size}\n` +
                        `${EMOJIS.boostCount} **Basılan boost sayısı:** ${guild.premiumSubscriptionCount || "0"}\n` +
                        `${EMOJIS.boostLevel} **Boost leveli:** ${guild.premiumTier} level`,
                    inline: true
                },
                {
                    name: "FOTOĞRAFLAR",
                    value: `🖥️ **Profil fotoğrafı:** ${guildIcon != "https://i.hizliresim.com/fpvkxry.png" ? `[ [URL] ](${guildIcon})` : "~~[URL]~~"}\n` +
                        `🖼️ **Banner:** ${guildBanner ? `[ [URL] ](${guildBanner})` : "~~[URL]~~"}\n` +
                        `💌 **Davet arka planı:** ${guildSplash ? `[ [URL] ](${guildSplash})` : "~~[URL]~~"}\n` +
                        `📡 **Keşfet arka planı:** ${guildDiscoverySplash ? `[ [URL] ](${guildDiscoverySplash})` : "~~[URL]~~"}`,
                    inline: true
                },
                {
                    name: `${EMOJIS.role} ROLLER (${Util.toHumanize(allRoles.size, language)})`,
                    value: [...allRoles.values()]
                    .sort((a, b) => b.position - a.position)
                    .slice(0, Util.MAX.showRoleInInfo)
                    .map(role => `<@&${role.id}>`)
                    .join(" | ") + 
                    (allRoles.size > Util.MAX.showRoleInInfo ? `+${Util.toHumanize(allRoles.size - Util.MAX.showRoleInInfo, language)} rol daha...` : ""),
                })
            .setThumbnail(guildIcon)
            .setColor("Blue")
            .setTimestamp()

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};