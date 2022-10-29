const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "yetkili rol",
  kod: "yetkili-rol",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")      
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.yetkili) return hata('Yeni gelen üyeleri kayıt edecek rol zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.yetkili
        hata('Yeni gelen üyeleri kayıt edecek rol başarıyla sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const rol = msg.client.fetchRole(args.join(" "), msg)
      if (!rol) return hata(`Yeni gelen üyeleri kayıt edecek rolü ayarlamak için **${prefix}yetkili-rol @rol**\n\n• Sfırlamak için ise **${prefix}yetkili-rol sıfırla** yazabilirsiniz`, "ne")
      const rolid = rol.id
      if (sunucudb.kayıt.yetkili === rolid) return hata('Yeni gelen kişileri kayıt edecek rol zaten etiketlediğiniz rolle aynı')
      if (rol.managed) return hata(`Etiketlediğiniz rol bir bot rolü. Lütfen başka bir rol etiketleyiniz`)
      if (rolid == sunucudb.kayıt.kayıtsız) return hata(`Etiketlediğiniz rol bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.erkek || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.kız || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.normal || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      sunucudb.kayıt.yetkili = rolid
      hata('Bundan sonra yeni gelen kişileri <@&' + rolid + '> adlı role sahip kişiler kayıt edecek', "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}


