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
    name: "guildinfo", // Komutun ismi
    id: "sunucubilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "guildinfo"
    ],
    description: "Shows basic information of the server", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>guildinfo", // Komutun kullanım şekli
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
            `🆔 **ID of the server:** ${guildId}`,
            `📅 **Server installation date:** <t:${milisecondsToSeconds(guild.createdTimestamp)}:F> - <t:${milisecondsToSeconds(guild.createdTimestamp)}:R>`,
            `🔔 **Server default message notifications:** ${guild.defaultMessageNotifications == GuildDefaultMessageNotifications.AllMessages ? "All messages 📬" : `Tags only ${EMOJIS.role}`}`
        ];

        // Eğer sunucunun özel daveti varsa onu da ekle
        const vanityData = await guild.fetchVanityData().catch(() => { });
        if (vanityData) basicInformation.push(`✉️ **Presenter's special invitation:** https://discord.gg/${vanityData.code} - (${vanityData.uses})`);

        // Sunucunun afk kanalı veya kurallar kanalı varsa onu da ekle                                             1000 ile çarpmamızın nedeni afkTimeout saniye cinsindendir
        if (guild.afkChannel) basicInformation.push(`🔇 **AFK channel:** <#${guild.afkChannelId}> (${Time.duration(guild.afkTimeout * 1000, language)})`)
        if (guild.rulesChannel) basicInformation.push(`${EMOJIS.rules} **Rules channel:** <#${guild.rulesChannelId}>`);

        basicInformation.push(`👑 **Owner of the server:** <@${guild.ownerId}> - (${guild.ownerId})`)

        const embed = new EmbedBuilder()
            .setAuthor({
                name: guild.name,
                iconURL: guildIcon
            })
            .addFields(
                {
                    name: "BASIC INFORMATIONS",
                    value: basicInformation.join("\n")
                },
                {
                    name: `CHANNELS (${Util.toHumanize(allChannels.size, language)})`,
                    value: `${EMOJIS.channel} **Text channel:** ${Util.toHumanize(channelsCount.text, language)}\n` +
                        `${EMOJIS.voice} **Voice channel:** ${Util.toHumanize(channelsCount.voice, language)}\n` +
                        `🖇️ **Category:** ${Util.toHumanize(channelsCount.category, language)}\n` +
                        `🎞️ **Other channels:** ${Util.toHumanize(channelsCount.others, language)}`,
                    inline: true
                },
                {
                    name: `MEMBERS (${Util.toHumanize(allMembers.size, language)})`,
                    value: `👥 **Number of members:** ${Util.toHumanize(allMembers.size - allBots.size, language)}\n` +
                        `🤖 **Number of bots:** ${Util.toHumanize(allBots.size, language)}`,
                    inline: true
                },
                {
                    name: `EMOJIES (${allEmojis.size})`,
                    value: `${EMOJIS.unactive} **Number of still emojis:** ${allEmojis.size - animatedEmojis.size}\n` +
                        `${EMOJIS.active} **Number of animated emojis:** ${animatedEmojis.size}`
                },
                {
                    name: "BOOST INFORMATION",
                    value: `${EMOJIS.boostUsers} **Number of people pressing Boost:** ${allMembers.filter(member => member.premiumSinceTimestamp).size}\n` +
                        `${EMOJIS.boostCount} **Number of boosts pressed:** ${guild.premiumSubscriptionCount || "0"}\n` +
                        `${EMOJIS.boostLevel} **Boost level:** ${guild.premiumTier} level`,
                    inline: true
                },
                {
                    name: "PHOTOS",
                    value: `🖥️ **Profile photo:** ${guildIcon != "https://i.hizliresim.com/fpvkxry.png" ? `[ [URL] ](${guildIcon})` : "~~[URL]~~"}\n` +
                        `🖼️ **Banner:** ${guildBanner ? `[ [URL] ](${guildBanner})` : "~~[URL]~~"}\n` +
                        `💌 **invitation background:** ${guildSplash ? `[ [URL] ](${guildSplash})` : "~~[URL]~~"}\n` +
                        `📡 **Explore background:** ${guildDiscoverySplash ? `[ [URL] ](${guildDiscoverySplash})` : "~~[URL]~~"}`,
                    inline: true
                },
                {
                    name: `${EMOJIS.role} ROLES (${Util.toHumanize(allRoles.size, language)})`,
                    value: [...allRoles.values()]
                        .sort((a, b) => b.position - a.position)
                        .slice(0, Util.MAX.showRoleInInfo)
                        .map(role => role.toString())
                        .join(" | ") +
                        (allRoles.size > Util.MAX.showRoleInInfo ? `+${Util.toHumanize(allRoles.size - Util.MAX.showRoleInInfo, language)} more role...` : ""),
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