const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 20,
  name: "sunucu toplam",
  kod: "toplam",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      let discordlogo = guild.iconURL(),
        embed = new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: discordlogo })
          .setThumbnail(discordlogo)
          .setColor('#290529')
          .setTimestamp(),
        ssayı = sunucudb.son,
        son1saat = 0,
        son1gün = 0,
        son1hafta = 0,
        son1ay = 0,
        erkektoplam = 0,
        kıztoplam = 0,
        normaltoplam = 0,
        simdikizaman = (Date.now() / 1000).toFixed(0),
        fields
      if (ssayı.length) {
        ssayı.forEach(a => {
          switch (a.c) {
            case ayarlar.emoji.erkek:
              erkektoplam += 1
              break;
            case ayarlar.emoji.kiz:
              kıztoplam += 1
              break;
            case ayarlar.emoji.uye:
              normaltoplam += 1
              break;
          }
          let zaman = a.z
          if (simdikizaman - 3600 < zaman) son1saat += 1
          if (simdikizaman - 86400 < zaman) son1gün += 1
          if (simdikizaman - 604800 < zaman) son1hafta += 1
          if (simdikizaman - 2629800 < zaman) son1ay += 1
        })
        if (sunucudb.kayıt.secenek) {
          embed.setDescription('**Kayıt seçeneğiniz:**  👤 Normal Kayıt')
          fields = { name: `KAYIT EDİLEN (${(ssayı.length.toLocaleString().replace(/\./g, ","))})`, value: `${ayarlar.emoji.uye} **Üye:**  ${normaltoplam.toLocaleString().replace(/\./g, ",")}\n🤖 **Bot:**  ${(ssayı.length - erkektoplam - kıztoplam - normaltoplam).toLocaleString().replace(/\./g, ",")}`, inline: true }
        } else {
          embed.setDescription('**Kayıt seçeneğiniz:**  👫 Cinsiyet')
          fields = { name: `KAYIT EDİLEN (${(ssayı.length.toLocaleString().replace(/\./g, ","))})`, value: `${ayarlar.emoji.erkek} **Erkek:**  ${erkektoplam.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.kiz} **Kız:**  ${kıztoplam}\n🤖 **Bot:**  ${(ssayı.length - erkektoplam - kıztoplam - normaltoplam).toLocaleString().replace(/\./g, ",")}`, inline: true }
        }
        let ranklar = ayarlar.ranklar
        const uuu = Object.entries(sunucudb.kayıtkisiler).filter(a => a[1].toplam).sort((a, b) => b[1].toplam - a[1].toplam).slice(0, 3).map((a, i) => {
          if (a[0] == msg.author.id) return `• ${msg.client.stringToEmojis(i + 1)} **<@${a[0]}> ${a[1].toplam || "0"} Kayıt sayın • ${ranklar[a[1].rank] || "Rankın yok"}**`
          if (a[0] == msg.client.user.id) return `• ${msg.client.stringToEmojis(i + 1)} ${ayarlar.emoji.pp} <@${a[0]}> **${a[1].toplam || "0"}** Kayıt sayım **•** Botların rankı olmaz :)`
          return `• ${msg.client.stringToEmojis(i + 1)} <@${a[0]}> **${a[1].toplam || "0"}** Kayıt sayısı **•** ${ranklar[a[1].rank] || "Rankı yok"}`
        })
        embed.addFields(fields, { name: "\u200b", value: "\u200b", inline: true }, { name: "SUNUCUNUN KAYIT ETKİNLİĞİ", value: `**⏰ Son 1 saat:** \`${son1saat.toLocaleString().replace(/\./g, ",")}\`\n**📅 Son 1 gün:** \`${son1gün.toLocaleString().replace(/\./g, ",")}\`\n**📆 Son 1 hafta:** \`${son1hafta.toLocaleString().replace(/\./g, ",")}\`\n**🗓️ Son 1 ay:** \`${son1ay.toLocaleString().replace(/\./g, ",")}\`\n`, inline: true }, { name: '`Son 5 kayıt`', value: ssayı.slice(0, 5).map(a => `• (${a.c}) <@${a.s}> ==> <@${a.k}> | <t:${a.z}:F>`).join('\n') }, { name: "`En çok kayıt yapan 3 kişi`", value: (uuu.join("\n") || "• Burada gösterilecek hiçbir şey yok...") })
      } else {
        if (sunucudb.kayıt.secenek) {
          embed.setDescription('**Kayıt seçeneğiniz:**  👤 Normal Kayıt')
          fields = { name: 'KAYIT EDİLEN (0)', value: `${ayarlar.emoji.uye} **Üye:**  0\n🤖 **Bot:**  0`, inline: true }
        } else {
          embed.setDescription('**Kayıt seçeneğiniz:**  👫 Cinsiyet')
          fields = { name: 'KAYIT EDİLEN (0)', value: `${ayarlar.emoji.erkek} **Erkek:**  0\n${ayarlar.emoji.kiz} **Kız:**  ${kıztoplam}\n🤖 **Bot:**  ${(ssayı.length - erkektoplam - kıztoplam - normaltoplam).toLocaleString().replace(/\./g, ",")}`, inline: true }
        }
        embed.addFields(fields, { name: "\u200b", value: "\u200b", inline: true }, { name: "SUNUCUNUN KAYIT ETKİNLİĞİ", value: `**⏰ Son 1 saat:** \`0\`\n**📅 Son 1 gün:** \`0\`\n**📆 Son 1 hafta:** \`0\`\n**🗓️ Son 1 ay:** \`0\`\n`, inline: true }, { name: '`Son 5 kayıt`', value: "• Burada gösterilecek hiçbir şey yok..." }, { name: "`En çok kayıt yapan 3 kişi`", value: "• Burada gösterilecek hiçbir şey yok..." })
      }
      msg.reply({ embeds: [embed] }).catch(err => { })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
