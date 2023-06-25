const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "hata",
  aliases: "hata",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      const hata = args.join(" ")
      if (!hata) return hata('Lütfen bottaki bir hatayı yazınız')

      msg.react(ayarlar.emoji.p).catch(err => { })
      msg.reply({ content: `📢 **Hata mesajınız alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**` }).catch(err => { })
      const sayı = db.topla(msg.author.id, 1, "hata toplam", "diğerleri", false)
      let bilgiler = [
        `**👤 Yazan kişi:**  ${msg.author.tag} - (${msg.author.id})`,
        `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${guildId})`,
        `**🎞️ Yazdığı kanal:**  #${msg.channel.name} - (${msg.channelId})`
      ]
      let image = msg.attachments.first()?.proxyURL
      const embed = new EmbedBuilder()
        .setTitle("📢 Bir yeni hata var")
        .setDescription(`• <@${msg.author.id}> adlı kişi toplamda **${sayı}** kere hatamızı söyledi!`)
        .addFields(
          {
            name: "BİLGİLERİ",
            value: bilgiler.join("\n")
          },
          {
            name: "HATA",
            value: hata.replace(image, "")
          }
        )
        .setImage(image)
        .setColor("#3fb100")
        .setFooter({ text: `${msg.client.user.username} teşekkür eder..` })
      msg.client.sendChannel({ embeds: [embed] }, 'KANAL ID')
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

