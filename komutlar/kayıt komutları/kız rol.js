const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "kız rol",
  kod: ["kiz-rol", "kız-rol"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")      
      if (sunucudb.kayıt.secenek) return hata('Kayıt etme seçeneğiniz __**Normal Kayıt**__ olarak ayarlı\n\n• Eğer kız ve erkek olarak kaydetmek isterseniz **' + prefix + 'seç cinsiyet** yazabilirsiniz')
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.kız) return hata('Kızlara verilecek olan rol zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.kız
        hata('Kızlara verilecek olan rol başarıyla sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const roles = msg.client.fetchRoles(args.join(" "), msg)
      if (roles.size == 0) return hata(`Kız rolü ayarlamak için **${prefix}kız-rol @rol**\n\n• Sıfırlamak için ise **${prefix}kız-rol sıfırla** yazabilirsiniz`, "ne")
      const rolmap = roles.map(a => a.id)
      if (roles.some(a => a.managed == true)) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
      let kayıtsızrolid = sunucudb.kayıt.kayıtsız
      if (rolmap.includes(kayıtsızrolid)) return hata(`Etiketlediğiniz [<@&${kayıtsızrolid}>] adlı rol bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      let yetkilirolid = sunucudb.kayıt.yetkili
      if (rolmap.includes(yetkilirolid)) return hata(`Etiketlediğiniz [<@&${yetkilirolid}>] adlı rol bu sunucudaki üyeleri kayıt eden rol. Lütfen başka bir rol etiketleyiniz`)
      if (roles.size > 5) return hata("Hey hey heyyy sence de biraz fazla rol etiketlemedin mi?")
      const yuksekrolfilter = roles.filter(a => a.position >= guildMe.roles.highest.position)
      if (yuksekrolfilter.length) return hata(`Etiketlediğiniz [${yuksekrolfilter.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      sunucudb.kayıt.kız = rolmap
      hata(`Bundan sonra kızlara [${roles.map(a => "<@&" + a.id + ">").join(" | ")}] adlı rol(leri) vereceğim`, "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

