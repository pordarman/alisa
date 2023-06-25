const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "jail log",
  aliases: "jail-log",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

      const kanal = msg.client.fetchChannel(args.join(" "), msg)
      if (args[0] === "sıfırla") {
        if (!guildDatabase.jail.log) return hata("Jail log kanalı zaten sıfırlanmış durumda")
        delete guildDatabase.jail.log
        hata('Jail log kanalı başarıyla sıfırlanmıştır', "b")
        db.yazdosya(guildDatabase, guildId)
        return;
      }
      if (!kanal) return hata(`Jail log kanalını ayarlamak için **${prefix}jail-log #kanal**\n\n• Sıfırlamak için ise **${prefix}jail-log sıfırla** yazabilirsiniz`, "ne")
      if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
      if (guildDatabase.jail.log === kanal.id) return hata("Jail log kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
      
      guildDatabase.jail.log = kanal.id
      hata('Jail log kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
