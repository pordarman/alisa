"use strict";
const database = require("../../../../Helpers/Database");
const {
    ChannelType
} = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "seskanal", // Komutun ismi
    id: "seskanal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "seskanal",
        "seskanalayarla",
        "ses-kanal",
        "ses-kanal-ayarla",
        "setvoicechannel",
        "setvoice",
        "set-voice",
        "set-voice-channel",
    ],
    description: "Bir ses kanalı ayarlayarak ve botun ses kanalına girmesini sağlarsınız", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>seskanal <#kanal veya Kanal ID'si>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const channelId = args[0]?.toLocaleLowerCase(language);
        const {
            channelIds
        } = guildDatabase;

        // Eğer ses kanalını kaldırmak istiyorsa
        if (["çıkar", "kaldır", "cikar", "sıfırla", "sifirla"].includes(channelId)) {

            // Eğer ses kanalı ayarlanmamışsa hata döndür
            if (!channelIds.voice) return errorEmbed(`Zaten daha önceden katılmam için bir ses kanalı belirlememişsiniz`);

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

            return errorEmbed(`Ses kanalı başarıyla kaldırıldı`, "success");
        }

        // Ses kanalını ayarla
        const voiceChannel = Util.fetchChannel(msg);

        // Eğer kanalı etiketlememişse bilgilendirme mesajı gönder
        if (!voiceChannel) return errorEmbed(
            `Lütfen bir ses kanalını etiketleyiniz, kanal ID'si giriniz\n\n` +
            `• Eğer oluşturduğunuz bir ses kanalını kaldırmak istiyorsanız **${prefix}${this.name} kaldır** yazabilirsiniz`
        );

        // Eğer etiketlenen kanal bir ses kanalı değilse hata döndür
        if (voiceChannel.type !== ChannelType.GuildVoice) return errorEmbed(`Girdiğiniz kanal bir ses kanalı değil! Lütfen bir ses kanalı etiketleyiniz`);

        // Eğer botun ses kanalına girme yetkisi yoksa hata döndür
        if (!voiceChannel.joinable) return errorEmbed(`Etiketlediğiniz kanala benim katılma yetkim yok :(`);

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

        return errorEmbed(`📥 <#${voiceChannel.id}> kanalına giriş yaptım!`, "success");

    },
};