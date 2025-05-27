"use strict";
const Util = require("../../../Helpers/Util.js");
const Time = require("../../../Helpers/Time");
const {
    EmbedBuilder,
    ActivityType
} = require("discord.js");
const {
    botInviteLink
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "spotify",
        en: "spotify"
    },
    id: "spotify", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "spotify",
            "sp"
        ],
        en: [
            "spotify",
            "sp"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Kişinin dinlediği spotify müziğini gösterir",
        en: "Shows the spotify music the person is listening to"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Eğlence komutları",
        en: "Fun commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>spotify [@kişi veya Kişi ID'si]",
        en: "<px>spotify [@user or User ID]"
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
        msgMember,
        guild,
        args,
        language,
        errorEmbed,
    }) {

        const member = await Util.fetchMember(guild, args[0]) || msgMember;

        const {
            commands: {
                spotify: messages
            }
        } = allMessages[language];

        // Eğer kişi botsa
        if (member.user.bot) return errorEmbed(messages.botError);

        // Eğer kişinin durumu kapalıysa
        if (
            !member.presence ||
            member.presence?.status == "offline" ||
            member.presence?.status == "invisible"
        ) return errorEmbed(messages.offline(member.id));

        // Spotify durumunu çek
        const spotifyPresence = member.presence.activities.find(activity => activity.name == "Spotify" && activity.type === ActivityType.Listening);

        // Eğer spotify dinlemiyorsa
        if (!spotifyPresence) return errorEmbed(messages.notListening(member.id));

        const totalTime = spotifyPresence.timestamps.end - spotifyPresence.timestamps.start;
        const passingTime = Date.now() - spotifyPresence.timestamps.start;
        const progressCount = 20;

        // Kaç tane dolu emojisi kaç tane boş emojisi koyacağımızı ayarlıyoruz
        const progressBarFullLength = Math.min(Math.round((passingTime / totalTime) * progressCount), progressCount) - 1;

        const progressBar = progressBarFullLength + 1 == progressCount ?
            // Eğer tamamı doldurulacaksa
            `[${"▬".repeat(progressBarFullLength)}](${botInviteLink})` + "🔘" :
            // Eğer en az 1 tanesi doldurulacaksa
            progressBarFullLength > 0 ?
                `[${"▬".repeat(progressBarFullLength)}](${botInviteLink})` + "🔘" + "▬".repeat(progressCount - progressBarFullLength) :
                // Eğer hepsi boş olacaksa
                "🔘" + "▬".repeat(progressCount);


        // Girilen milisaniye değerini dakika ve saniye olarak döndürür
        function toMusicDuration(ms) {
            const TIMES = {
                second: 1000,
                minute: 60 * 1000,
                hour: 60 * 60 * 1000,
            };
            const resultArray = [];

            // Eğer 1 saatten daha fazlaysa
            if (ms >= TIMES.hour) {
                const hours = Math.floor(ms / TIMES.hour);
                ms -= hours * TIMES.hour;
                resultArray.push(String(hours).padStart(2, "0"));
            }

            // Eğer 1 dakikadan daha fazlaysa veya dizi boş değilse
            if (ms >= TIMES.minute || resultArray.length != 0) {
                const minutes = Math.floor(ms / TIMES.minute);
                ms -= minutes * TIMES.minute;
                resultArray.push(String(minutes).padStart(2, "0"));
            }

            // Eğer 1 saniyeden daha fazlaysa veya dizi boş değilse
            if (ms >= TIMES.second || resultArray.length != 0) {
                const seconds = Math.floor(ms / TIMES.second);
                ms -= seconds * TIMES.second;
                resultArray.push(String(seconds).padStart(2, "0"));
            }

            // Eğer sonuçta sadece saniye varsa dakikayı 00 olarak ayarla
            return resultArray.length == 1 ?
                "00:" + resultArray[0] :
                resultArray.join(":");
        }

        const imageURL = spotifyPresence.assets.largeImageURL() || "https://i.hizliresim.com/fu1gc7v.png";

        const artists = spotifyPresence.state.split(";");

        const embed = new EmbedBuilder()
            .setAuthor({
                name: spotifyPresence.details,
                iconURL: imageURL,
                url: `https://open.spotify.com/track/${spotifyPresence.syncId}`
            })
            .setTitle(`Spotify`)
            .setDescription(messages.embed.description(member.id))
            .addFields(
                {
                    name: messages.embed.fields.names.musicName,
                    value: `[${spotifyPresence.details}](https://open.spotify.com/track/${spotifyPresence.syncId})`,
                    inline: false
                },
                {
                    name: messages.embed.fields.names.artistsNames(artists),
                    value: artists.join(", "),
                    inline: false
                },
                {
                    name: messages.embed.fields.names.albumName,
                    value: spotifyPresence.assets.largeText || "Unknown",
                    inline: false
                },
                {
                    name: messages.embed.fields.names.duration,
                    value: Time.duration(totalTime, language),
                    inline: false
                },
                {
                    name: "\u200b",
                    value: `**• [${toMusicDuration(passingTime)} / ${toMusicDuration(totalTime)}]**\n` +
                        `${progressBar}`,
                    inline: false
                }
            )
            .setColor("1ed760")
            .setThumbnail(imageURL)
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};