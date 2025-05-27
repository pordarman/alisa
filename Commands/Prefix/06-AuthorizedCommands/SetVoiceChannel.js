"use strict";
const database = require("../../../Helpers/Database.js");
const {
    ChannelType
} = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "seskanal",
        en: "setvoice"
    },
    id: "seskanal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "seskanal",
            "seskanalayarla",
            "ses-kanal",
            "ses-kanal-ayarla",
            "setvoicechannel",
            "setvoice",
            "set-voice",
            "set-voice-channel",
        ],
        en: [
            "setvoicechannel",
            "setvoice",
            "set-voice",
            "set-voice-channel",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bir ses kanalı ayarlayarak ve botun ses kanalına girmesini sağlarsınız",
        en: "You set up a voice channel and have the bot enter the voice channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>seskanal <#kanal veya Kanal ID'si>",
        en: "<px>setvoice <#channel or Channel ID>"
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
        guildMe,
        guild,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                seskanal: messages
            },
            permissions: permissionMessages,
            channels: channelMessages,
            sets: {
                remove: removeSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const channelId = args[0]?.toLocaleLowerCase(language);
        const {
            channelIds
        } = guildDatabase;

        // Eğer ses kanalını kaldırmak istiyorsa
        if (removeSet.has(channelId)) {
            // Eğer ses kanalı ayarlanmamışsa hata döndür
            if (!channelIds.voice) return errorEmbed(messages.remove.already);

            // Ses kanalından ayrıl ve database'ye kaydet
            guildMe.voice.disconnect().catch(() => { });
            channelIds.voice = "";
            await database.updateGuild(guildId, {
                $set: {
                    "channelIds.voice": ""
                }
            });

            return errorEmbed(messages.remove.success, "success");
        }

        // Ses kanalını ayarla
        const voiceChannel = Util.fetchChannel(msg);

        // Eğer kanalı etiketlememişse bilgilendirme mesajı gönder
        if (!voiceChannel) return errorEmbed(
            messages.toSet(prefix)
        );

        // Eğer etiketlenen kanal bir ses kanalı değilse hata döndür
        if (voiceChannel.type !== ChannelType.GuildVoice) return errorEmbed(channelMessages.notVoiceChannel);

        // Eğer botun ses kanalına girme yetkisi yoksa hata döndür
        if (!voiceChannel.joinable) return errorEmbed(messages.set.dontHavePermission);

        // Ses kanalına giriş yap ve database'ye kaydet
        DiscordVoice.joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true
        });
        channelIds.voice = voiceChannel.id;
        await database.updateGuild(guildId, {
            $set: {
                "channelIds.voice": voiceChannel.id
            }
        });

        return errorEmbed(messages.set.success(voiceChannel.id), "success");
    },
};