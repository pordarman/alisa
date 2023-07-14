const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "yetkili rol",
  aliases: ["yetkili-rol"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki") 

      if (args[0] === "sıfırla") {
        if (!guildDatabase.kayıt.yetkili) return hata('Yeni gelen üyeleri kayıt edecek rol zaten sıfırlanmış durumda')
        delete guildDatabase.kayıt.yetkili
        hata('Yeni gelen üyeleri kayıt edecek rol başarıyla sıfırlandı', "b")
        db.yazdosya(guildDatabase, guildId)
        return;
      }
      const rol = msg.client.fetchRole(args.join(" "), msg)
      if (!rol) return hata(`Yeni gelen üyeleri kayıt edecek rolü ayarlamak için **${prefix}yetkili-rol @rol**\n\n• Sfırlamak için ise **${prefix}yetkili-rol sıfırla** yazabilirsiniz`, "ne")
      const rolid = rol.id
      if (guildDatabase.kayıt.yetkili === rolid) return hata('Yeni gelen kişileri kayıt edecek rol zaten etiketlediğiniz rolle aynı')
      if (rol.managed) return hata(`Etiketlediğiniz rol bir bot rolü. Lütfen başka bir rol etiketleyiniz`)
      if (rolid == guildDatabase.kayıt.kayıtsız) return hata(`Etiketlediğiniz rol bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((guildDatabase.kayıt.erkek || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((guildDatabase.kayıt.kız || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((guildDatabase.kayıt.normal || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      
      guildDatabase.kayıt.yetkili = rolid
      hata('Bundan sonra yeni gelen kişileri <@&' + rolid + '> adlı role sahip kişiler kayıt edecek', "b")
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}


