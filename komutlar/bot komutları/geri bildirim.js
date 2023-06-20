const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "geri bildirim",
  aliases: ["gb", "geribildirim"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      const geriBildirim = args.join(" ")
      if (!geriBildirim) return hata('Lütfen bot hakkındaki düşüncelerinizi yazınız')

      msg.react(ayarlar.emoji.p).catch(err => { })
      msg.reply({ content: `📣 **Geri bildiriminiz alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**` }).catch(err => { })
      const sayı = db.topla(msg.author.id, 1, "gb toplam", "diğerleri", false)
      let bilgiler = [
        `**👤 Yazan kişi:**  ${msg.author.tag} - (${msg.author.id})`,
        `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${sunucuid})`,
        `**🎞️ Yazdığı kanal:**  #${msg.channel.name} - (${msg.channelId})`
      ]
      let image = msg.attachments.first()?.proxyURL
      const embed = new EmbedBuilder()
        .setTitle("📣 Bir yeni geri bildirim var")
        .setDescription(`• <@${msg.author.id}> adlı kişi toplamda **${sayı}** kere geri bildirim yaptı!`)
        .addFields(
          {
            name: "BİLGİLERİ",
            value: bilgiler.join("\n")
          },
          {
            name: "GERİ BİLDİRİM",
            value: geriBildirim.replace(image, "")
          }
        )
        .setImage(image)
        .setColor("#fb1d1c")
        .setFooter({ text: `${msg.client.user.username} teşekkür eder..` })
      msg.client.sendChannel({ embeds: [embed] }, 'KANAL ID')
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
