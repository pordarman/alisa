"use strict";
const { EmbedBuilder } = require("discord.js");
const {
    rankNumbers,
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "rank", // Komutun ismi
    id: "rank", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "rank"
    ],
    description: "Shows your registration rank", // Komutun açıklaması
    category: "Information commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>rank [@user or User ID]", // Komutun kullanım şekli
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
        guild,
        authorId,
        args,
        language,
    }) {

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi rankını kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Eğer etiketlediği kişi botsa hata döndür
        if (user.bot) return msg.reply("Botların rankı olmaz :)");

        const guildIcon = guild.iconURL();
        const userAvatar = user.displayAvatarURL();

        // Kişinin toplam kayıt sayısını tanımla
        const registerCount = guildDatabase.register.authorizedInfos[user.id]?.countables?.total ?? 0;

        // Eğer kişi kendini etiketlediyse farklı bir yazı, başkasını etiketlediyse farklı bir yazı göster
        let allMessages = user.id == authorId ?
            {
                yourRank: "Your rank",
                congratulations: "You are at the highest rank possible",
                youNeedThis: "you"
            } :
            {
                yourRank: "Rank",
                congratulations: `<@${user.id}> has the highest rank available`,
                youNeedThis: "he/she"
            }

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

        /**
         * Kişinin rankını bulmak için bu algoritmayı kullanıyoruz
         * @param {Array<Number>} array 
         * @param {Number} number 
         * @returns {Number}
         */
        function bsFindIndex(array, number) {
            let startIndex = 0,
                endIndex = array.length
            while (startIndex < endIndex) {
                if (endIndex - startIndex <= 3) {
                    for (let index = endIndex - 1; index >= startIndex; --index) {
                        if (array[index] <= number) {
                            return index + 1;
                        }
                    }
                }
                const middleIndex = Math.floor((endIndex + startIndex) / 2);
                if (array[middleIndex] === number) {
                    return middleIndex + 1;
                } else if (array[middleIndex] > number) {
                    endIndex = middleIndex
                } else {
                    startIndex = middleIndex + 1
                }
            }
            return startIndex;
        }

        const rankIndex = bsFindIndex(rankNumbers, registerCount) - 1;

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
                    `🔰 ${allMessages.yourRank} **${EMOJIS.allRanks[language][rankIndex]}**\n` +
                    `🎉 ${allMessages.congratulations}\n\n` +
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
                `🔰 ${allMessages.yourRank} **${EMOJIS.allRanks[language][rankIndex] || `No rank`}**\n` +
                `🎉 To reach **${EMOJIS.allRanks[language][rankIndex + 1]}** rank ${allMessages.youNeedThis} need to complete ${Util.stringToEmojis(nextRankCount - registerCount)} more register\n\n` +
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