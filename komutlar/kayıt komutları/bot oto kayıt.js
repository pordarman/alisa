const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "bot oto kayıt",
  kod: ["bototo", "bot-otokayıt", "b-otokayıt", "bot-oto", "boto", "botokayıt", "b-oto"],
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
          if (sunucudb.kayıt.bototo) return hata('Bot oto kayıt ayarım zaten __**açık**__ durumda')
          sunucudb.kayıt.bototo = true
          hata('Bot oto kayıt ayarım başarıyla açıldı bundan sonra botları otomatik olarak kayıt edeceğim', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;
        case "kapat":
        case "kapalı":
        case "deaktif":
          if (!sunucudb.kayıt.bototo) return hata('Bot oto kayıt ayarım zaten __**kapalı**__ durumda')
          delete sunucudb.kayıt.bototo
          hata('Bot oto kayıt ayarım başarıyla kapatıldı bundan sonra botları otomatik olarak kayıt etmeyeceğim', "b")
          db.yazdosya(sunucudb, sunucuid)
          return;
        default:
          return hata(`Botları otomatik olarak kayıt etmek için **${prefix}bototo aç**\n\n• Kapatmak için ise **${prefix}bototo kapat** yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

