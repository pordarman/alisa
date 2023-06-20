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
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.günlük) hata('Kayıt günlük kanalı zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.günlük
        hata('Kayıt günlük kanalı başarıyla sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const kanal = msg.client.fetchChannel(args.join(" "), msg)
      if (!kanal) return hata(`Kayıt günlük kanalını ayarlamak için **${prefix}günlük #kanal**\n\n• Sıfırlamak için ise **${prefix}günlük sıfırla** yazabilirsiniz`, "ne")
      if (kanal.type !== 0) return hata('Etiketlediğiniz kanal bir yazı kanalı değil')
      if (sunucudb.kayıt.günlük === kanal.id) return hata('Kayıt günlük mesajlarını zaten <#' + kanal.id + '> kanalına yazıyorum')
      
      sunucudb.kayıt.günlük = kanal.id
      hata('Kayıt günlük kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
