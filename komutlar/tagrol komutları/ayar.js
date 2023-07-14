const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "tagrol ayar",
  aliases: ["tagrol-ayar"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

      let tagroldb = msg.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
      switch (args[0]) {
        case "aç":
        case "açık":
        case "aktif":
          if (!tagroldb.ayar) return hata('Tagrol ayarım zaten __**açık**__ durumda yani birisi tag aldığında ona rol verip mesaj atacağım')
          delete tagroldb.ayar
          hata('Tagrol ayarım açıldı bundan sonra tüm tagrol işlemlerini yapabilirsiniz', "b")
          db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
          return;
        case "kapat":
        case "kapalı":
        case "deaktif":
          if (tagroldb.ayar) return hata('Tagrol ayarım zaten __**kapalı**__ durumda yani birisi tag aldığında ona hiçbir şey yapmayacağım')
          tagroldb.ayar = true
          hata('Tagrol ayarım kapatıldı bundan sonra hiçbir tagrol işlemini yapamazsınız', "b")
          db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
          return;
        default:
          return hata(`Tagrol ayarımı açmak için **${prefix}tagrol-ayar açık**\n\n• Kapatmak için ise **${prefix}yaşzorunlu kapalı** yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

