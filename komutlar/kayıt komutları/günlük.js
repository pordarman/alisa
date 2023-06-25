const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "günlük",
  aliases: ["gunluk", "günlük"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (args[0] === "sıfırla") {
        if (!guildDatabase.kayıt.günlük) hata('Kayıt günlük kanalı zaten sıfırlanmış durumda')
        delete guildDatabase.kayıt.günlük
        hata('Kayıt günlük kanalı başarıyla sıfırlandı', "b")
        db.yazdosya(guildDatabase, guildId)
        return;
      }
      const kanal = msg.client.fetchChannel(args.join(" "), msg)
      if (!kanal) return hata(`Kayıt günlük kanalını ayarlamak için **${prefix}günlük #kanal**\n\n• Sıfırlamak için ise **${prefix}günlük sıfırla** yazabilirsiniz`, "ne")
      if (kanal.type !== 0) return hata('Etiketlediğiniz kanal bir yazı kanalı değil')
      if (guildDatabase.kayıt.günlük === kanal.id) return hata('Kayıt günlük mesajlarını zaten <#' + kanal.id + '> kanalına yazıyorum')
      
      guildDatabase.kayıt.günlük = kanal.id
      hata('Kayıt günlük kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
