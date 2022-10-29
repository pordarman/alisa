const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "şüpheli oto",
  kod: ["supheli-oto", "şüpheli-oto"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")      
      switch (args[0]) {
        case "aç":
        case "açık":
        case "aktif":
          if (sunucudb.kayıt.otos) return hata('Şüpheli ayarım zaten __**açık**__ durumda yani güvensiz birisini direkt şüpheliye atacağım')
          sunucudb.kayıt.otos = true
          hata('Şüpheli ayarım açıldı bundan sonra güvensiz hesaplara direkt şüpheliye atacağım', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;
        case "kapat":
        case "kapalı":
        case "deaktif":
          if (!sunucudb.kayıt.otos) return hata('Şüpheli ayarım zaten __**kapalı**__ durumda yani güvensiz birisine hiçbir şey yapmacağım')
          delete sunucudb.kayıt.otos
          hata('Şüpheli ayarım kapatıldı bundan sonra güvensiz hesaplara hiçbir şey yapmacağım', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;
        default:
          return hata(`Şüpheli ayarımı açmak için **${prefix}şüpheli-oto açık**\n\n• Kapatmak için ise **${prefix}şüpheli-oto kapalı**  yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

