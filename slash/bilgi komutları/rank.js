const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "rank",
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Bir üyenin kayıt rankını gösterir")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const kişi = int.options.getMember("üye", false) || int.member
            if (kişi.user.bot) return int.reply({ content: 'Botların rankı olmaz :)', ephemeral: true }).catch(err => { })
            let discordlogo = guild.iconURL()
            , ranklar = ayarlar.ranklar
            , sayılar = ayarlar.rankSayıları
            , sahip = sunucudb.kayıtkisiler[kişi.id]
            , kayıtsayısı = sahip?.toplam || 0
            , kişirank = sahip?.rank
            , gösterge = ""
            , suanki = sayılar[kişirank]
            , sonraki = sayılar[+kişirank + 1]
            if (!sonraki && suanki) gösterge = ayarlar.emoji.bar.dolu.bas + ayarlar.emoji.bar.dolu.orta.repeat(13) + ayarlar.emoji.bar.dolu.son
            else {
                if (!suanki) {
                    for (let i = 1; i < 16; i++) {
                        if (i * 2 / 3 <= kayıtsayısı) {
                            if (i === 1) gösterge += ayarlar.emoji.bar.dolu.bas
                            else if (i === 15) gösterge += ayarlar.emoji.bar.dolu.son
                            else gösterge += ayarlar.emoji.bar.dolu.orta
                        } else if (i === 1) gösterge += ayarlar.emoji.bar.bos.bas
                        else if (i === 15) gösterge += ayarlar.emoji.bar.bos.son
                        else gösterge += ayarlar.emoji.bar.bos.son
                    }
                } else {
                    for (let i = 1; i < 16; i++) {
                        if (((sonraki - suanki) * (i / 15)) <= (kayıtsayısı - suanki)) {
                            if (i === 1) gösterge += ayarlar.emoji.bar.dolu.bas
                            else if (i === 15) gösterge += ayarlar.emoji.bar.dolu.son
                            else gösterge += ayarlar.emoji.bar.dolu.orta
                        } else if (i === 1) gösterge += ayarlar.emoji.bar.bos.bas
                        else if (i === 15) gösterge += ayarlar.emoji.bar.bos.son
                        else gösterge += ayarlar.emoji.bar.bos.son
                    }
                }
            }
            let array
            if (kişi.id == int.user.id) array = ["Rankın", "yapmalısın"]
            else array = ["Rankı", "yapması gerekiyor"]
            const pp = kişi.displayAvatarURL()
            const embed = new EmbedBuilder()
                .setAuthor({ name: kişi.user.tag, iconURL: pp })
                .setColor(kişi.displayHexColor ?? "#9e02e2")
                .setFooter({ text: guild.name, iconURL: discordlogo })
                .setThumbnail(pp)
            if (kişirank) {
                if (kişirank == "27") embed.setDescription(`🔰 ${array[0]} **${ranklar[kişirank]}**\n🎉 Sen ulaşılabilecek en yüksek ranktasın tebrikleerrrrr <@${kişi.user.id}>\n\n• **MAX**\n${gösterge}`)
                else embed.setDescription(`🔰 ${array[0]} **${ranklar[kişirank]}**\n⏩ **${ranklar[(Number(kişirank) + 1)]}** rankına ulaşmak için ${int.client.stringToEmojis(sonraki - kayıtsayısı)} kayıt daha ${array[1]}\n\n• ${kayıtsayısı}/${sonraki}\n${gösterge}`)
            } else embed.setDescription(`🔰 ${array[0]} **${array[0]} yok**\n⏩ **${ayarlar.ranklar[0]}** rankına ulaşmak için ${int.client.stringToEmojis(10 - kayıtsayısı)} kayıt daha ${array[1]}\n\n• ${kayıtsayısı}/10\n${gösterge}`)
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}