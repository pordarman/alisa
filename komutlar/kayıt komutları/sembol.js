const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "sembol",
  kod: "sembol",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")      
      const argsseysi = args.join(' ')
      if (!argsseysi) return hata(`Sembol ayarlamak için **${prefix}sembol \`sembolünüz\`**\n\n• Sıfırlamak için ise **${prefix}sembol sıfırla** yazabilirsiniz`, "ne")
      if (argsseysi === "sıfırla") {
        if (!sunucudb.kayıt.sembol) return hata('Üyelere ekleyeceğim sembol zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.sembol
        hata('Üyelere ekleyeceğim sembol sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      if (argsseysi.length > 3) return hata('Sembol uzunluğunuz 3\'ten büyük olamaz')
      sunucudb.kayıt.sembol = argsseysi + " "
      let tag = sunucudb.kayıt.tag
      , sembol = argsseysi + " "
      , kayıtisim = sunucudb.kayıt.isimler.kayıt
      , ismi
      , sadeceisim = "Ali İhsan 19"
      if (kayıtisim) {
        if (kayıtisim.indexOf("<yaş>") != -1) {
          let age = sadeceisim.match(msg.client.regex.fetchAge)
          if (age) sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
          else age = [""]
          ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, (sembol ? sadeceisim.replace(/ /g, " " + sembol) : sadeceisim)).replace(/<yaş>/g, age[0])
        } else ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, (sembol ? sadeceisim.replace(/ /g, " " + sembol) : sadeceisim))
      } else ismi = `${tag || ""}${(sembol ? sadeceisim.replace(/ /g, " " + sembol) : sadeceisim)}`
      hata(`Üyelere ekleyeceğim sembol başarıyla **${argsseysi}** olarak ayarlandı!**Örnek**\n${ismi}\n\n**NOT!!**\nSemboller botların isimlerine eklenmeyecektir`, "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
