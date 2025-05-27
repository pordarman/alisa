"use strict";
const { EmbedBuilder } = require("discord.js");
const {
    rankNumbers,
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "rank",
        en: "rank"
    },
    id: "rank", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "rank",
            "rankım",
            "rankı",
            "kayıttank"
        ],
        en: [
            "rank"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt rankınızı gösterir",
        en: "Shows your registration rank"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>rank [@kişi veya Kişi ID'si]",
        en: "<px>rank [@user or User ID]"
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
        guild,
        args,
        authorId,
        language,
    }) {

        const {
            commands: {
                rank: messages
            }
        } = allMessages[language];

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi rankını kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Eğer etiketlediği kişi botsa hata döndür
        if (user.bot) return msg.reply(messages.botError);

        const guildIcon = guild.iconURL();
        const userAvatar = user.displayAvatarURL();

        // Kişinin toplam kayıt sayısını tanımla
        const registerCount = guildDatabase.register.authorizedInfos[user.id]?.countables?.total ?? 0;

        // Eğer kişi kendini etiketlediyse farklı bir yazı, başkasını etiketlediyse farklı bir yazı göster
        const allRankMessages = user.id == authorId ?
            messages.rankMessages.author :
            messages.rankMessages.other;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: user.displayName,
                iconURL: userAvatar
            })
            .setThumbnail(userAvatar)
            .setColor("#9e02e2")
            .setFooter({
                text: guild.name,
                iconURL: guildIcon
            });

        const rankIndex = Util.binarySearchFindIndex(rankNumbers, registerCount);

        // Embed mesajda gösterilecek emojili ilerlemeyi tanımlıyoruz
        let progressBar = "";
        const progressCount = 15;

        // Şimdiki rank için gereken kayıt sayısını ve sonraki rank için gereken kayıt sayısını tanımlıyoruz
        const nowRankCount = rankNumbers[rankIndex] ?? 0;
        const nextRankCount = rankNumbers[rankIndex + 1];

        // Eğer sonraki rank yoksa (Yani en yüksek ranktaysa)
        if (!nextRankCount) {
            // Göstergeyi doldur
            progressBar = EMOJIS.bar.full.start + EMOJIS.bar.full.middle.repeat(progressCount - 2) + EMOJIS.bar.full.end;

            embed
                .setDescription(
                    `🔰 ${allRankMessages.yourRank} **${EMOJIS.allRanks[language][rankIndex]}**\n` +
                    `🎉 ${allRankMessages.congratulations(user.id)}\n\n` +
                    `• **MAX**\n` +
                    `${progressBar}`
                );

            return msg.reply({
                embeds: [
                    embed
                ]
            });
        }

        // Göstergeyi tamamlamak için şu anki kayıt sayısından rank için gereken sayıdan çıkarıyoruz
        const tempRegisterCount = registerCount - nowRankCount;
        const tempTotalRankCount = nextRankCount - nowRankCount;

        // Kaç tane dolu emojisi kaç tane boş emojisi koyacağımızı ayarlıyoruz
        const progressBarFullLength = Math.round((tempRegisterCount / tempTotalRankCount) * progressCount);
        progressBar = progressBarFullLength == progressCount ?
            // Eğer tamamı doldurulacaksa
            EMOJIS.bar.full.start + EMOJIS.bar.full.middle.repeat(progressCount - 2) + EMOJIS.bar.full.end :
            // Eğer en az 1 tanesi doldurulacaksa
            progressBarFullLength > 0 ?
                EMOJIS.bar.full.start + EMOJIS.bar.full.middle.repeat(progressBarFullLength - 1) + EMOJIS.bar.empty.middle.repeat(progressCount - progressBarFullLength - 1) + EMOJIS.bar.empty.end :
                // Eğer hepsi boş olacaksa
                EMOJIS.bar.empty.start + EMOJIS.bar.empty.middle.repeat(progressCount - 2) + EMOJIS.bar.empty.end;

        embed
            .setDescription(
                `🔰 ${allRankMessages.yourRank} **${EMOJIS.allRanks[language][rankIndex] || messages.rankMessages.noRank(allRankMessages.yourRank)}**\n` +
                `🎉 ${messages.rankMessages.toReach({
                    nextRank: EMOJIS.allRanks[language][rankIndex + 1],
                    moreRegisterEmoji: Util.stringToEmojis(nextRankCount - registerCount),
                    doIt: allRankMessages.youNeedThis
                })}\n\n` +
                `• ${registerCount}/${nextRankCount}\n` +
                `${progressBar}`
            );

        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};