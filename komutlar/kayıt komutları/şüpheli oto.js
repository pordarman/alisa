const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "şüpheli oto",
  aliases: ["supheli-oto", "şüpheli-oto"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

      switch (args[0]) {
        case "aç":
        case "açık":
        case "aktif":
          if (guildDatabase.kayıt.otos) return hata('Şüpheli ayarım zaten __**açık**__ durumda yani güvensiz birisini direkt şüpheliye atacağım')
          guildDatabase.kayıt.otos = true
          hata('Şüpheli ayarım açıldı bundan sonra güvensiz hesaplara direkt şüpheliye atacağım', "b")
          db.yazdosya(guildDatabase, guildId)
          return;
        case "kapat":
        case "kapalı":
        case "deaktif":
          if (!guildDatabase.kayıt.otos) return hata('Şüpheli ayarım zaten __**kapalı**__ durumda yani güvensiz birisine hiçbir şey yapmacağım')
          delete guildDatabase.kayıt.otos
          hata('Şüpheli ayarım kapatıldı bundan sonra güvensiz hesaplara hiçbir şey yapmacağım', "b")
          db.yazdosya(guildDatabase, guildId)
          return;
        default:
          return hata(`Şüpheli ayarımı açmak için **${prefix}şüpheli-oto açık**\n\n• Kapatmak için ise **${prefix}şüpheli-oto kapalı**  yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

