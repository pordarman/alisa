"use strict";
const {
    EmbedBuilder,
    ActivityType
} = require("discord.js")
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

const activityRanks = {
    [ActivityType.Custom]: 0,
    [ActivityType.Listening]: 1,
    [ActivityType.Streaming]: 2,
    [ActivityType.Watching]: 3,
    [ActivityType.Competing]: 4,
    [ActivityType.Playing]: 5,
    "-1": -1
}

module.exports = {
    name: { // Komutun ismi
        tr: "üyebilgi",
        en: "memberinfo"
    },
    id: "üyebilgi", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kullanıcıbilgi",
            "userinfo",
            "kbilgi"
        ],
        en: [
            "userinfo",
            "memberinfo",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının temel bilgilerini gösterir",
        en: "Shows the user's basic information"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kullanıcıbilgi [@kişi veya Kişi ID'si]",
        en: "<px>userinfo [@user or User ID]"
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
        guild,
        msgMember,
        args,
        language,
    }) {

        const {
            commands: {
                kullanıcıbilgi: messages
            }
        } = allMessages[language];

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi bilgilerini göster
        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, args[0]) || msgMember;

        // Kullanıcının bannerini çekmek için önce fetch ile güncelliyoruz
        await member.fetch(true).catch(() => { });
        const memberRoles = member["_roles"].map(roleId => guild.roles.cache.get(roleId));

        // Resimler
        const memberGuildAvatar = member.avatarURL();
        const userDiscordAvatar = member.user.displayAvatarURL();
        const showPictureInEmbed = memberGuildAvatar ?? userDiscordAvatar;
        const userBanner = member.user.bannerURL();
        const isUserBot = messages.isBot(member.user.bot);

        const guildInfos = [
            messages.guildInfos.joined(Util.msToSecond(member.joinedTimestamp)),
        ]
        // Eğer kullanıcı sunucuya boost bastıysa bastığı tarihini göster
        if (member.premiumSinceTimestamp) guildInfos.push(messages.guildInfos.boosted(Util.msToSecond(member.premiumSinceTimestamp)))
        guildInfos.push(
            messages.guildInfos.highestRole(member.roles.highest.id),
            messages.guildInfos.nickname(member.nickname),
        )
        if (member.voice.channelId) guildInfos.push(messages.guildInfos.currentChannel(member.voice.channelId));

        const fromArray = [];

        const activity = {
            type: -1,
            full: null,
            text: messages.presenceInfos.activities.userOffline
        }
        if (member.presence) {
            if (member.presence.clientStatus?.desktop) fromArray.push(messages.presenceInfos.from.desktop);
            if (member.presence.clientStatus?.mobile) fromArray.push(messages.presenceInfos.from.mobile);
            if (member.presence.clientStatus?.web) fromArray.push(messages.presenceInfos.from.web);


            for (const memberActivity of member.presence.activities) {
                if (activityRanks[activity.type] < activityRanks[memberActivity.type]) {
                    activity.type = memberActivity.type;
                    activity.full = memberActivity;
                }
            }

            switch (activity.type) {
                case ActivityType.Custom:
                    activity.text = activity.full.state;
                    break;

                case ActivityType.Listening:
                    activity.text = messages.presenceInfos.activities.listening(activity.full.name, activity.full.details);
                    break;

                case ActivityType.Playing:
                    activity.text = messages.presenceInfos.activities.playing(activity.full.name);
                    break;

                case ActivityType.Streaming:
                    activity.text = messages.presenceInfos.activities.streaming(activity.full.name, activity.full.url);
                    break;

                case ActivityType.Watching:
                    activity.text = messages.presenceInfos.activities.watching(activity.full.name);
                    break;

                case ActivityType.Competing:
                    activity.text = messages.presenceInfos.activities.competing(activity.full.name);
                    break;

                default:
                    activity.text = messages.presenceInfos.activities.userOffline;
                    break;
            }
        }


        const embed = new EmbedBuilder()
            .setAuthor({
                name: member.user.displayName,
                iconURL: showPictureInEmbed
            })
            .setThumbnail(showPictureInEmbed)
            .setImage(userBanner || null)
            .setColor(member.displayHexColor ?? "#9e02e2")
            .addFields(
                {
                    name: messages.guildInfos.titles.basic,
                    value: messages.guildInfos.basicValue({
                        memberId: member.id,
                        isUserBot,
                        createdTimestamp: Util.msToSecond(member.user.createdTimestamp)
                    })
                },
                {
                    name: messages.guildInfos.titles.guild,
                    value: guildInfos.join("\n")
                },
                {
                    name: messages.guildInfos.titles.status,
                    value: messages.presenceInfos.statusValue({
                        statusEmoji: Util.statusToEmoji(member.presence?.status ?? "offline"),
                        statusText: messages.presenceInfos.statusText[member.presence?.status ?? "offline"],
                        from: Util.formatArray(fromArray, language) || messages.presenceInfos.from.unknown,
                        activity: activity.text
                    })
                },
                {
                    name: messages.guildInfos.titles.photos,
                    value: `📱 **${messages.guildInfos.photos.profile}:** [ [URL] ](${userDiscordAvatar})\n` +
                        `🖥️ **${messages.guildInfos.photos.guildProfile}:** ${memberGuildAvatar ? `[ [URL] ](${memberGuildAvatar})` : "~~[URL]~~"}\n` +
                        `🖼️ **${messages.guildInfos.photos.banner}:** ${userBanner ? `[ [URL] ](${userBanner})` : "~~[URL]~~"}`
                },
                {
                    name: `${EMOJIS.role} ${messages.guildInfos.roles} (${Util.toHumanize(memberRoles.length, language)})`,
                    value: memberRoles.length == 0 ?
                        Util.stringOr("", language) :
                        Util.sliceMapAndJoin(
                            memberRoles.sort((a, b) => b.position - a.position),
                            0,
                            Util.MAX.showRoleInInfo,
                            role => `<@&${role.id}>`,
                            " | "
                        ) + (memberRoles.length > Util.MAX.showRoleInInfo ? `+${memberRoles.length - Util.MAX.showRoleInInfo} ${messages.guildInfos.moreRoles}...` : "")
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