"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "jaillog",
        en: "jaillog"
    },
    id: "jaillog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "jaillog",
            "jaillogkanalı",
        ],
        en: [
            "jaillog",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Jail log kanalını ayarlarsınız",
        en: "You set the jail log channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>jaillog <#kanal veya Kanal ID'si>",
        en: "<px>jaillog <#channel or Channel ID>"
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
        const jail = guildDatabase.jail;

        // Eğer ayarlanan jail log kanalını sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!jail.logChannelId) return errorEmbed(channelMessages.alreadyReset(channelNames.jailLog));

            jail.logChannelId = "";
            await database.updateGuild(guildId, {
                $set: {
                    "jail.logChannelId": ""
                }
            });
            return errorEmbed(channelMessages.successReset(channelNames.jailLog), "success");
        }

        // Rolü ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            channelMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                channelName: channelNames.jailLog
            }),
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(channelMessages.notTextChannel);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (channel.id == jail.logChannelId) return errorEmbed(channelMessages.sameChannel(channelNames.jailLog));

        jail.logChannelId = channel.id;
        await database.updateGuild(guildId, {
            $set: {
                "jail.logChannelId": channel.id
            }
        });
        return errorEmbed(
            channelMessages.successSet({
                channelName: channelNames.jailLog,
                channelId: channel.id
            }),
            "success"
        );

    },
};