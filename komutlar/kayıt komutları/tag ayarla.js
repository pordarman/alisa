const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "tag",
  kod: ["tagayarla", "tag-a", "tag-ayarla"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
      if (!args[0]) return hata(`Tag ayarlamak için **${prefix}tag-a \`tagınız\`**\n\n• Sıfırlamak için ise **${prefix}tag-a sıfırla** yazabilirsiniz`, "ne")      
      let tagroldb = msg.client.t(sunucuid, sunucudb.kayıt.tag)
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.tag && !tagroldb.tag) return hata('Üyelere ekleyeceğim tag zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.tag
        delete tagroldb.tag
        hata('Üyelere ekleyeceğim tag sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
        return;
      }
      const argsseysi = args.join(' ')
      if (argsseysi.length > 10) return hata('Tag uzunluğunuz 10\'dan büyük olamaz')
      tagroldb.tag = argsseysi
      db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
      sunucudb.kayıt.tag = argsseysi + " "
      let tag = sunucudb.kayıt.tag
      , sembol = sunucudb.kayıt.sembol
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
      hata(`Üyelerin isimlerine ekleyeceğim tag başarıyla **${argsseysi}** olarak ayarlandı\n\n**Örnek**\n${ismi}`, "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

