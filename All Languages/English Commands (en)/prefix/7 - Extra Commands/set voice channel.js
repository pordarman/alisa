"use strict";
const database = require("../../../../Helpers/Database");
const {
    ChannelType
} = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "setvoice", // Komutun ismi
    id: "seskanal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "setvoicechannel",
        "setvoice",
        "set-voice",
        "set-voice-channel",
    ],
    description: "You set up a voice channel and have the bot enter the voice channel", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>setvoice <#channel or Channel ID>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const channelId = args[0]?.toLocaleLowerCase(language);
        const {
            channelIds
        } = guildDatabase;

        // Eğer ses kanalını kaldırmak istiyorsa
        if (["leave", "reset", "remove"].includes(channelId)) {

            // Eğer ses kanalı ayarlanmamışsa hata döndür
            if (!channelIds.voice) return errorEmbed(`You haven't already determined a voice channel for me to join`);

            // Ses kanalından ayrıl ve database'ye kaydet
            guildMe.voice.disconnect().catch(() => { });
            channelIds.voice = "";
            database.writeFile(guildDatabase, guildId);

            // Eğer interval ayarlanmışsa interval'i kaldır
            const interval = msg.client.guildVoices.get(guildId);
            if (typeof interval == "function") {
                msg.client.guildVoices.delete(guildId);
                clearInterval(interval);
            }

            return errorEmbed(`Voice channel removed successfully`, "success");
        }

        // Ses kanalını ayarla
        const voiceChannel = Util.fetchChannel(msg);

        // Eğer kanalı etiketlememişse bilgilendirme mesajı gönder
        if (!voiceChannel) return errorEmbed(
            `Please tag an voice channel, enter the channel ID\n\n` +
            `• If you want to remove a voice channel you created, you can type **${prefix}${this.name} remove**`
        );

        // Eğer etiketlenen kanal bir ses kanalı değilse hata döndür
        if (voiceChannel.type !== ChannelType.GuildVoice) return errorEmbed(`The channel you entered is not an voice channel! Please tag a voice channel`);

        // Eğer botun ses kanalına girme yetkisi yoksa hata döndür
        if (!voiceChannel.joinable) return errorEmbed(`I do not have permission to join the channel you tagged :(`);

        // Ses kanalına giriş yap ve database'ye kaydet
        DiscordVoice.joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: true
        });
        channelIds.voice = voiceChannel.id;
        database.writeFile(guildDatabase, guildId);

        // Interval ayarla ve her 5 dakikada bir ses kanalına gir
        msg.client.guildVoices.set(guildId,
            setInterval(() => {
                if (!msg.guild.members.me.voice.channelId) DiscordVoice.joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: true
                });
            }, 1000 * 60 * 5)
        );

        return errorEmbed(`📥 I'm logged in to <#${voiceChannel.id}>!`, "success");

    },
};