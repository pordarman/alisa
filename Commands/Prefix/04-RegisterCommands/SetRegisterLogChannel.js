"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtlog",
        en: "registerlog"
    },
    id: "kayıtlog", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtlog",
            "kayıtlogkanal",
            "registerlog",
            "registerlogchannel"
        ],
        en: [
            "registerlog",
            "registerlogchannel"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt log kanalını ayarlarsınız",
        en: "You set the register log channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtlog <#kanal veya Kanal ID'si>",
        en: "<px>registerlog <#channel or Channel ID>"
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
        const channelIds = guildDatabase.register.channelIds;

        // Eğer ayarlanan ban rolünü sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!channelIds.log) return errorEmbed(channelMessages.alreadyReset(channelNames.registerLog));

            channelIds.log = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.channelIds.log": ""
                }
            });
            return errorEmbed(channelMessages.successReset(channelNames.registerLog), "success");
        }

        // Kanalı ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            channelMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                channelName: channelNames.registerLog
            }),
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(channelMessages.notTextChannel);

        // Eğer etiketlediği kanal ayarlanan kanalla aynıysa
        if (channel.id == channelIds.log) return errorEmbed(channelMessages.sameChannel(channelNames.registerLog));

        channelIds.log = channel.id;
        await database.updateGuild(guildId, {
            $set: {
                "register.channelIds.log": channel.id
            }
        });
        return errorEmbed(
            channelMessages.successSet({
                channelId: channel.id,
                channelName: channelNames.registerLog
            }),
            "success"
        );

    },
};