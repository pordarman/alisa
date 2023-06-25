const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "ayar",
  aliases: "ayar",
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
          if (!guildDatabase.kayıt.ayar) return hata('Kayıt ayarım zaten __**açık**__ durumda yani tüm kayıt işlemlerini yapabilirsiniz')
          delete guildDatabase.kayıt.ayar
          hata('Kayıt ayarım açıldı bundan sonra tüm kayıt işlemlerini yapabilirsiniz', "b")
          db.yazdosya(guildDatabase, guildId)
          return;

        case "kapat":
        case "kapalı":
        case "deaktif":
          if (guildDatabase.kayıt.ayar) return hata('Kayıt ayarım zaten __**kapalı**__ durumda yani hiçbir kayıt işlemlerini yapamazsınız')
          guildDatabase.kayıt.ayar = true
          hata('Kayıt ayarım kapatıldı bundan sonra hiçbir kayıt işlemlerini yapamazsınız', "b")
          db.yazdosya(guildDatabase, guildId)
          return;
        default:
          return hata(`Kayıt ayarımı açmak için **${prefix}ayar aç**\n\n• Kapatmak için ise **${prefix}ayar kapat** yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

