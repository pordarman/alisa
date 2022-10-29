const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "ayar",
  kod: "ayar",
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
          if (!sunucudb.kayıt.ayar) return hata('Kayıt ayarım zaten __**açık**__ durumda yani tüm kayıt işlemlerini yapabilirsiniz')
          delete sunucudb.kayıt.ayar
          hata('Kayıt ayarım açıldı bundan sonra tüm kayıt işlemlerini yapabilirsiniz', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;

        case "kapat":
        case "kapalı":
        case "deaktif":
          if (sunucudb.kayıt.ayar) return hata('Kayıt ayarım zaten __**kapalı**__ durumda yani hiçbir kayıt işlemlerini yapamazsınız')
          sunucudb.kayıt.ayar = true
          hata('Kayıt ayarım kapatıldı bundan sonra hiçbir kayıt işlemlerini yapamazsınız', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;
        default:
          return hata(`Kayıt ayarımı açmak için **${prefix}ayar aç**\n\n• Kapatmak için ise **${prefix}ayar kapat** yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

