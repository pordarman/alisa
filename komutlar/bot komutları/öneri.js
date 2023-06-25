const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "öneri",
  aliases: ["oneri", "oner", "öneri", "öner"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      const öneri = args.join(" ")
      if (!öneri) return hata("Lütfen bota gelmesini istediğiniz şeyleri yazınız")
      
      msg.react(ayarlar.emoji.p).catch(err => { })
      msg.reply({ content: `💬 **Öneriniz alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**` }).catch(err => { })
      const sayı = db.topla(msg.author.id, 1, "öneri toplam", "diğerleri", false)
      let bilgiler = [
        `**👤 Yazan kişi:**  ${msg.author.tag} - (${msg.author.id})`,
        `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${guildId})`,
        `**🎞️ Yazdığı kanal:**  #${msg.channel.name} - (${msg.channelId})`
      ]
      let image = msg.attachments.first()?.proxyURL
      const embed = new EmbedBuilder()
        .setTitle("💬 Bir yeni öneri var")
        .setDescription(`• <@${msg.author.id}> adlı kişi toplamda **${sayı}** kere öneri yaptı!`)
        .addFields(
          {
            name: "BİLGİLERİ",
            value: bilgiler.join("\n")
          },
          {
            name: "ÖNERİ",
            value: öneri.replace(image, "")
          },
          {
            name: `${ayarlar.emoji.p} Gelsin diye kişi sayısı`,
            value: "0",
            inline: true
          },
          {
            name: `${ayarlar.emoji.np} Gelmesin diye kişi sayısı`,
            value: "0",
            inline: true
          }
        )
        .setImage(image)
        .setColor("#41b6cc")
        .setFooter({ text: `${msg.client.user.username} teşekkür eder..` })
      let mesaj = await msg.client.sendChannel({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Gelsin bence").setEmoji(ayarlar.emoji.p).setCustomId("önerik").setStyle(3)).addComponents(new ButtonBuilder().setLabel("Ne gerek var").setEmoji(ayarlar.emoji.np).setCustomId("önerir").setStyle(4))] }, 'KANAL ID')
        , oneri = alisa.öneri
      oneri[mesaj.id] = { k: [], r: [] }
      db.yaz("öneri", oneri, "alisa", "diğerleri")
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
