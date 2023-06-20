const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "kayıt kanal",
  aliases: ["kanal", "kayıt-kanal"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      
      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.kanal) return hata("Kayıt kanalı zaten sıfırlanmış durumda")
        delete sunucudb.kayıt.kanal
        hata('Kayıt kanalı başarıyla sıfırlanmıştır', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const kanal = msg.client.fetchChannel(args.join(" "), msg)
      if (!kanal) return hata(`Kayıt kanalını ayarlamak için **${prefix}kanal #kanal**\n\n• Sıfırlamak için ise **${prefix}kanal sıfırla** yazabilirsiniz`, "ne")
      if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
      if (sunucudb.kayıt.kanal === kanal.id) return hata("Kayıt kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
      
      sunucudb.kayıt.kanal = kanal.id
      hata('Kayıt kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
