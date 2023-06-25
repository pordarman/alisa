const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 60,
  name: "sıra",
  aliases: ["sira", "sıra", "sıralama", "top", "liste", "list", "leaderboard", "lb", "topkayıt", "kayıtsıralama", "kayıtsayı", "kayitsayi"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {
      let date = Date.now(),
        ranklar = ayarlar.ranklar,
        kendiyeri,
        uuu = Object.entries(guildDatabase.kayıtkisiler).filter(a => a[1].toplam).sort((a, b) => b[1].toplam - a[1].toplam).map((a, i) => {
          if (a[0] == msg.author.id) {
            kendiyeri = i + 1
            return `• ${msg.client.stringToEmojis(i + 1)} **<@${a[0]}> ${a[1].toplam || "0"} Kayıt sayın • ${ranklar[a[1].rank] || "Rankın yok"}**`
          }
          if (a[0] == msg.client.user.id) return `• ${msg.client.stringToEmojis(i + 1)} ${ayarlar.emoji.pp} <@${a[0]}> **${a[1].toplam || "0"}** Kayıt sayım **•** Botların rankı olmaz :)`
          return `• ${msg.client.stringToEmojis(i + 1)} <@${a[0]}> **${a[1].toplam || "0"}** Kayıt sayısı **•** ${ranklar[a[1].rank] || "Rankı yok"}`
        })

      // Kontroller
      if (uuu.length == 0) return hata(`Bu sunucuda hiçbir kayıt işlemi gerçekleşmediğinden (ya da sadece botlar kayıt edildiğinden) dolayı tablo gösterilemiyor`)
      
      let sayfa = Math.ceil(uuu.length / 20),
        discordlogo = guild.iconURL(),
        ms = Date.now() - date,
        embed = new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: discordlogo })
          .setDescription(`**📈 Sunucunun kayıt sıralaması!** *(in ${ms}ms)*${kendiyeri ? `\n**👑 Sen ${uuu.length} kişi içinden ${kendiyeri}. sıradasın**` : ""}\n\n${deneme = uuu.slice(0, 20).join('\n')}`)
          .setColor('#0cca5b')
          .setThumbnail(discordlogo)
          .setTimestamp()
          .setFooter({ text: `Sayfa 1/${sayfa}` })
      if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
      const düğmesağ = new ButtonBuilder()
        .setStyle(1)
        .setEmoji(ayarlar.emoji.sagok)
        .setCustomId("NOT_sağok")
      const düğmesil = new ButtonBuilder()
        .setStyle(4)
        .setEmoji(ayarlar.emoji.sil)
        .setCustomId("NOT_sil")
      const düğmesol = new ButtonBuilder()
        .setStyle(1)
        .setEmoji(ayarlar.emoji.solok)
        .setCustomId("NOT_solok")
        .setDisabled(true)
      var düğme = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
      msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
        const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil"].includes(i.customId) && i.user.id === msg.author.id
        const clin = a.createMessageComponentCollector({ filter: filter, time: 120 * 1000 })
        let sayfasayısı = 1
        clin.on("collect", async oklar => {
          const id = oklar.customId
          if (id == "NOT_sil") return await a.delete()
          if (id == "NOT_sağok") {
            if (sayfasayısı == sayfa) return;
            düğmesol.setDisabled(false)
            sayfasayısı++;
            if (sayfasayısı == sayfa) düğmesağ.setDisabled(true)
          } else {
            if (sayfasayısı == 1) return;
            düğmesağ.setDisabled(false)
            sayfasayısı--;
            if (sayfasayısı == 1) düğmesol.setDisabled(true)
          }
          embed.setDescription(`**📈 Sunucunun kayıt sıralaması!** *(in ${ms}ms)*${kendiyeri ? `\n**👑 Sen ${uuu.length} kişi içinden ${kendiyeri}. sıradasın**` : ""}\n\n${uuu.slice((sayfasayısı * 20 - 20), (sayfasayısı * 20)).join('\n')}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
          return await a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
        })
        clin.on("end", async () => {
          düğmesağ.setDisabled(true).setStyle(2)
          düğmesol.setDisabled(true).setStyle(2)
          düğmesil.setDisabled(true).setStyle(2)
          return await a.edit({ content: "Bu mesaj artık aktif değildir", components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
        })
      }).catch(err => { })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
