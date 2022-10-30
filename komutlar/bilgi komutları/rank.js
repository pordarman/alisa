const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 15,
    name: "rank",
    kod: "rank",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            const kişi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg) || msgMember
            if (kişi.user.bot) return msg.reply({ content: 'Botların rankı olmaz :)' }).catch(err => { })
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
                        else gösterge += ayarlar.emoji.bar.bos.orta
                    }
                } else {
                    for (let i = 1; i < 16; i++) {
                        if (((sonraki - suanki) * (i / 15)) <= (kayıtsayısı - suanki)) {
                            if (i === 1) gösterge += ayarlar.emoji.bar.dolu.bas
                            else if (i === 15) gösterge += ayarlar.emoji.bar.dolu.son
                            else gösterge += ayarlar.emoji.bar.dolu.orta
                        } else if (i === 1) gösterge += ayarlar.emoji.bar.bos.bas
                        else if (i === 15) gösterge += ayarlar.emoji.bar.bos.son
                        else gösterge += ayarlar.emoji.bar.bos.orta
                    }
                }
            }
            let array
            if (kişi.id == msg.author.id) array = ["Rankın", "yapmalısın"]
            else array = ["Rankı", "yapması gerekiyor"]
            let pp = kişi.displayAvatarURL()
                , embed = new EmbedBuilder()
                    .setAuthor({ name: kişi.user.tag, iconURL: pp })
                    .setColor(kişi.displayHexColor ?? "#9e02e2")
                    .setFooter({ text: guild.name, iconURL: discordlogo })
                    .setThumbnail(pp)
            if (kişirank) {
                if (kişirank == "27") embed.setDescription(`🔰 ${array[0]} **${ranklar[kişirank]}**\n🎉 Sen ulaşılabilecek en yüksek ranktasın tebrikleerrrrr <@${kişi.user.id}>\n\n• **MAX**\n${gösterge}`)
                else embed.setDescription(`🔰 ${array[0]} **${ranklar[kişirank]}**\n⏩ **${ranklar[(Number(kişirank) + 1)]}** rankına ulaşmak için ${msg.client.stringToEmojis(sonraki - kayıtsayısı)} kayıt daha ${array[1]}\n\n• ${kayıtsayısı}/${sonraki}\n${gösterge}`)
            } else embed.setDescription(`🔰 ${array[0]} **${array[0]} yok**\n⏩ **${ayarlar.ranklar[0]}** rankına ulaşmak için ${msg.client.stringToEmojis(10 - kayıtsayısı)} kayıt daha ${array[1]}\n\n• ${kayıtsayısı}/10\n${gösterge}`)
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
