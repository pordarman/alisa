"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "modlog",
        en: "modlog"
    },
    id: "modlog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "modlog",
            "modlogkanalı",
        ],
        en: [
            "modlog",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Mod log kanalını ayarlarsınız",
        en: "You set the mod log channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>modlog <#kanal veya Kanal ID'si>",
        en: "<px>modlog <#channel or Channel ID>"
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
        guildDatabase,
        guildId,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            permissions: permissionMessages,
            channels: channelMessages,
            others: {
                channelNames
            },
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const content = args.join(" ");
        const channelIds = guildDatabase.moderation.channelIds;

        // Eğer ayarlanan ban rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!channelIds.modLog) return errorEmbed(channelMessages.alreadyReset(channelNames.moderationLog));

            channelIds.modLog = "";
            await database.updateGuild(guildId, {
                $set: {
                    "moderation.channelIds.modLog": ""
                }
            });
            return errorEmbed(channelMessages.successReset(channelNames.moderationLog), "success");
        }

        // Kanalı ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            channelMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                channelName: channelNames.moderationLog
            }),
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(channelMessages.notTextChannel);

        // Eğer etiketlediği kanal ayarlanan kanalla aynıysa
        if (channel.id == channelIds.modLog) return errorEmbed(channelMessages.sameChannel(channelNames.moderationLog));

        channelIds.modLog = channel.id;
        await database.updateGuild(guildId, {
            $set: {
                "moderation.channelIds.modLog": channel.id
            }
        });
        return errorEmbed(
            channelMessages.successSet({
                channelId: channel.id,
                channelName: channelNames.moderationLog
            }),
            "success"
        );

    },
};