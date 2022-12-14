const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "alınacak rol",
  kod: ["al", "alınacak-rol", "al-rol", "kayıtsız-rol"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (sunucudb.ayar) return hata('Şu anda kayıt ayarım kapalı durumda eğer ayarlamak istiyorsanız kayıt ayarımı açmalısınız\n\n• Açmak için **' + prefix + 'ayar aç** yazabilirsiniz')
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.kayıtsız) return hata('Kayıtsız üye rolü zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.kayıtsız
        hata('Kayıtsız üye rolü başarıyla sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const rol = msg.client.fetchRole(args.join(" "), msg)
      if (!rol) return hata(`Kayıtsız üye rolünü ayarlamak için **${prefix}al @rol**\n\n• Sıfırlamak için ise **${prefix}al sıfırla** yazabilirsiniz`, "ne")
      const rolid = rol.id
      if (sunucudb.kayıt.kayıtsız === rolid) return hata('Kayıtsız üye rolü zaten etiketlediğiniz rolle aynı')
      if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
      if ((sunucudb.kayıt.erkek || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.kız || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.normal || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if ((sunucudb.kayıt.bot || []).includes(rolid)) return hata(`Etiketlediğiniz rol bu sunucudaki botlara verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if (sunucudb.kayıt.yetkili == rolid) return hata(`Etiketlediğiniz rol bu sunucudaki üyeleri kayıt eden rol. Lütfen başka bir rol etiketleyiniz`)
      if (guildMe.roles.highest.position == rol.position) return hata(`<@&${rolid}> adlı rol benim bu sunucudaki en yüksek rolüm ve bu rolü başkasına veremem! Lütfen başka bir rol etiketleyiniz`)
      if (guildMe.roles.highest.position < rol.position) return hata(`<@&${rolid}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      sunucudb.kayıt.kayıtsız = rolid
      hata(`Bundan sonra Üyeleri kayıt ettikten sonra onlardan <@&${rolid}> adlı rolü alacağım\n\n• ‼️ **Uyarı!** Bu rol sadece __**kayıt kanalı**__ ayarlı olduğu zaman verilecektir${sunucudb.kayıt.kanal ? "" : `• Kayıt kanalını ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz`}`, "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
