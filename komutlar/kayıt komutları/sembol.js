const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "sembol",
  aliases: ["sembol"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")   
         
      const argsseysi = args.join(' ')
      if (!argsseysi) return hata(`Sembol ayarlamak için **${prefix}sembol \`sembolünüz\`**\n\n• Sıfırlamak için ise **${prefix}sembol sıfırla** yazabilirsiniz`, "ne")
      if (argsseysi === "sıfırla") {
        if (!guildDatabase.kayıt.sembol) return hata('Üyelere ekleyeceğim sembol zaten sıfırlanmış durumda')
        delete guildDatabase.kayıt.sembol
        hata('Üyelere ekleyeceğim sembol sıfırlandı', "b")
        db.yazdosya(guildDatabase, guildId)
        return;
      }
      if (argsseysi.length > 3) return hata('Sembol uzunluğunuz 3\'ten büyük olamaz')
      guildDatabase.kayıt.sembol = argsseysi + " "
      let tag = guildDatabase.kayıt.tag
      , sembol = argsseysi + " "
      , kayıtisim = guildDatabase.kayıt.isimler.kayıt
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
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
