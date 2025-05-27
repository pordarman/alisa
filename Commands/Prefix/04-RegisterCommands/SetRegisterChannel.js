"use strict";
const {
    ChannelType
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtkanal",
        en: "registerchannel"
    },
    id: "kayıtkanal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtkanal",
            "registerchannel"
        ],
        en: [
            "registerchannel"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt kanalını ayarlarsınız",
        en: "You set the recording channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtkanal <#kanal veya Kanal ID'si>",
        en: "<px>registerchannel <#channel or Channel ID>"
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
            if (!channelIds.register) return errorEmbed(channelMessages.alreadyReset(channelNames.register));

            channelIds.register = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.channelIds.register": ""
                }
            });
            return errorEmbed(channelMessages.successReset(channelNames.register), "success");
        }

        // Kanalı ayarla
        const channel = Util.fetchChannel(msg);
        if (!channel) return errorEmbed(
            channelMessages.ifYouSet({
                prefix,
                commandName: this.name[language],
                channelName: channelNames.register
            }),
            "warn"
        );

        // Eğer etiketlenen kanal bir yazı kanalı değilse
        if (channel.type != ChannelType.GuildText) return errorEmbed(channelMessages.notTextChannel);

        // Eğer etiketlediği kanal ayarlanan kanalla aynıysa
        if (channel.id == channelIds.register) return errorEmbed(channelMessages.sameChannel(channelNames.register));

        channelIds.register = channel.id;
        await database.updateGuild(guildId, {
            $set: {
                "register.channelIds.register": channelIds.register
            }
        });
        return errorEmbed(
            channelMessages.successSet({
                channelId: channel.id,
                channelName: channelNames.register
            }),
            "success"
        );

    },
};