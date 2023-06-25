const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "tag",
  aliases: ["tagayarla", "tag-a", "tag-ayarla"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")

      if (!args[0]) return hata(`Tag ayarlamak için **${prefix}tag-a \`tagınız\`**\n\n• Sıfırlamak için ise **${prefix}tag-a sıfırla** yazabilirsiniz`, "ne")
      let tagroldb = msg.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
      if (args[0] === "sıfırla") {
        if (!guildDatabase.kayıt.tag && !tagroldb.tag) return hata('Üyelere ekleyeceğim tag zaten sıfırlanmış durumda')
        delete guildDatabase.kayıt.tag
        delete tagroldb.tag
        hata('Üyelere ekleyeceğim tag sıfırlandı', "b")
        db.yazdosya(guildDatabase, guildId)
        db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
        return;
      }
      const argsseysi = args.join(' ')
      if (argsseysi.length > 10) return hata('Tag uzunluğunuz 10\'dan büyük olamaz')
      tagroldb.tag = argsseysi
      db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
      guildDatabase.kayıt.tag = argsseysi + " "
      let tag = guildDatabase.kayıt.tag
        , sembol = guildDatabase.kayıt.sembol
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
      hata(`Üyelerin isimlerine ekleyeceğim tag başarıyla **${argsseysi}** olarak ayarlandı\n\n**Örnek**\n${ismi}`, "b")
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

