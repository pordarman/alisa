"use strict";
const {
    EmbedBuilder,
    ChannelType,
} = require("discord.js");
const {
    EMOJIS,
    images
} = require("../../../settings.json");
const Time = require("../../../Helpers/Time");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sunucubilgi",
        en: "guildinfo"
    },
    id: "sunucubilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sunucubilgi",
            "sbilgi",
            "sunucubilgisi",
            "guildinfo"
        ],
        en: [
            "guildinfo"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun temel bilgilerini gösterir",
        en: "Shows basic information of the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sunucubilgi",
        en: "<px>guildinfo"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildId,
        guild,
        language,
    }) {

        const {
            commands: {
                "sunucubilgi": messages
            }
        } = allMessages[language];

        // Sunucu resimleri
        const guildIcon = guild.iconURL();
        const guildBanner = guild.bannerURL();
        const guildSplash = guild.splashURL();
        const guildDiscoverySplash = guild.discoverySplashURL();

        // Sayılabilen veriler
        const allMembers = await Util.getMembers(guild);
        const allEmojis = guild.emojis.cache;
        const allBots = allMembers.filter(member => member.user.bot);
        const allChannels = guild.channels.cache;
        const allRoles = guild.roles.cache.clone();
        const animatedEmojis = allEmojis.filter(emoji => emoji.animated);
        const channelsCount = {
            text: 0,
            voice: 0,
            category: 0,
            others: 0
        };
        const statusCount = {
            total: 0,
            online: 0,
            idle: 0,
            dnd: 0,
            offline: 0
        };

        // Bütün üyelerde dolaş ve durum sayılarını kaydet
        allMembers.forEach(member => {
            if (!member.presence || member.presence.status === "offline") statusCount.offline += 1;
            else {
                statusCount[member.presence.status] += 1;
                statusCount.total += 1;
            }
        });


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

        const basicInformation = messages.basicInformation({
            guildId,
            createdTimestampWithSeconds: Util.msToSecond(guild.createdTimestamp),
            defaultMessageNotifications: guild.defaultMessageNotifications
        });

        // Eğer sunucunun özel daveti varsa onu da ekle
        const vanityData = await guild.fetchVanityData().catch(() => { });
        if (vanityData) basicInformation.push(messages.vanityData(vanityData));

        // Sunucunun afk kanalı veya kurallar kanalı varsa onu da ekle
        if (guild.afkChannel) basicInformation.push(messages.afkChannel({
            afkChannelId: guild.afkChannelId,
            afkTimeout: Time.duration(guild.afkTimeout * 1000, language) // 1000 ile çarpmamızın nedeni afkTimeout saniye cinsindendir
        }))
        if (guild.rulesChannel) basicInformation.push(messages.rulesChannel(guild.rulesChannelId));

        basicInformation.push(messages.owner(guild.ownerId));

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(
                {
                    name: messages.titles.basicInformation,
                    value: basicInformation.join("\n")
                },
                {
                    name: `${messages.titles.channels} (${Util.toHumanize(allChannels.size, language)})`,
                    value: `${EMOJIS.channel} **${messages.channelsCount.text}:** ${Util.toHumanize(channelsCount.text, language)}\n` +
                        `${EMOJIS.voice} **${messages.channelsCount.voice}:** ${Util.toHumanize(channelsCount.voice, language)}\n` +
                        `🖇️ **${messages.channelsCount.category}:** ${Util.toHumanize(channelsCount.category, language)}\n` +
                        `🎞️ **${messages.channelsCount.others}:** ${Util.toHumanize(channelsCount.others, language)}`,
                    inline: true
                },
                {
                    name: `${messages.titles.members} (${Util.toHumanize(allMembers.size, language)})`,
                    value: `👥 **${messages.membersCount.members}:** ${Util.toHumanize(allMembers.size - allBots.size, language)}\n` +
                        `🤖 **${messages.membersCount.bots}:** ${Util.toHumanize(allBots.size, language)}`,
                    inline: true
                },
                {
                    name: `${messages.titles.status} (${Util.toHumanize(statusCount.total, language)})`,
                    value: `${EMOJIS.online} **${messages.statusCount.online}:** ${Util.toHumanize(statusCount.online, language)}\n` +
                        `${EMOJIS.idle} **${messages.statusCount.idle}:** ${Util.toHumanize(statusCount.idle, language)}\n` +
                        `${EMOJIS.dnd} **${messages.statusCount.dnd}:** ${Util.toHumanize(statusCount.dnd, language)}\n` +
                        `${EMOJIS.offline} **${messages.statusCount.offline}:** ${Util.toHumanize(statusCount.offline, language)}`,
                    inline: true
                },
                {
                    name: `${messages.titles.emojis} (${allEmojis.size})`,
                    value: `${EMOJIS.unactive} **${messages.emojisCount.notanimated}:** ${allEmojis.size - animatedEmojis.size}\n` +
                        `${EMOJIS.active} **${messages.emojisCount.animated}:** ${animatedEmojis.size}`
                },
                {
                    name: messages.titles.boost,
                    value: `${EMOJIS.boostUsers} **${messages.boost.users}:** ${allMembers.filter(member => member.premiumSinceTimestamp).size}\n` +
                        `${EMOJIS.boostCount} **${messages.boost.count}:** ${guild.premiumSubscriptionCount || "0"}\n` +
                        `${EMOJIS.boostLevel} **${messages.boost.level}:** ${guild.premiumTier} level`,
                    inline: true
                },
                {
                    name: messages.titles.photos,
                    value: `🖥️ **${messages.photos.profile}:** ${guildIcon != images.guildIcon ? `[ [URL] ](${guildIcon})` : "~~[URL]~~"}\n` +
                        `🖼️ **${messages.photos.banner}:** ${guildBanner ? `[ [URL] ](${guildBanner})` : "~~[URL]~~"}\n` +
                        `💌 **${messages.photos.splash}:** ${guildSplash ? `[ [URL] ](${guildSplash})` : "~~[URL]~~"}\n` +
                        `📡 **${messages.photos.discoverySplash}:** ${guildDiscoverySplash ? `[ [URL] ](${guildDiscoverySplash})` : "~~[URL]~~"}`,
                    inline: true
                },
                {
                    name: `${EMOJIS.role} ${messages.titles.roles} (${Util.toHumanize(allRoles.size, language)})`,
                    value: Util.sliceMapAndJoin(
                        [...allRoles.values()].sort((a, b) => b.position - a.position),
                        0,
                        Util.MAX.showRoleInInfo,
                        role => `<@&${role.id}>`,
                        " | "
                    ) + (allRoles.size > Util.MAX.showRoleInInfo ? ` +${Util.toHumanize(allRoles.size - Util.MAX.showRoleInInfo, language)} ${messages.moreRole}` : ""),
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