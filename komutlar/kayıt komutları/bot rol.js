const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "bot rol",
  kod: "bot-rol",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (args[0] === "sıfırla") {
        if (!sunucudb.kayıt.bot) return hata('Botlara verilecek olan rol zaten sıfırlanmış durumda')
        delete sunucudb.kayıt.bot
        hata('Botlara verilecek olan rol başarıyla sıfırlandı', "b")
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      const roles = msg.client.fetchRoles(args.join(" "), msg)
      if (roles.size == 0) return hata(`Bot rolü ayarlamak için **${prefix}bot-rol @rol**\n\n• Sıfırlamak için ise **${prefix}bot-rol sıfırla** yazabilirsiniz`, "ne")
      const rolmap = roles.map(a => a.id)
      if (roles.some(a => a.managed == true)) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
      let kayıtsızrolid = sunucudb.kayıt.kayıtsız
      if (rolmap.includes(kayıtsızrolid)) return hata(`Etiketlediğiniz [<@&${kayıtsızrolid}>] adlı rol bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      let yetkilirolid = sunucudb.kayıt.yetkili
      if (rolmap.includes(yetkilirolid)) return hata(`Etiketlediğiniz [<@&${yetkilirolid}>] adlı rol bu sunucudaki üyeleri kayıt eden rol. Lütfen başka bir rol etiketleyiniz`)
      const erkekrolfilter = rolmap.filter(a => (sunucudb.kayıt.erkek || []).includes(a))
      if (erkekrolfilter.length) return hata(`Etiketlediğiniz [${erkekrolfilter.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler) bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      let kızrolid = sunucudb.kayıt.kız || []
      const kızrolfilter = rolmap.filter(a => kızrolid.includes(a))
      if (kızrolfilter.length) return hata(`Etiketlediğiniz [${kızrolfilter.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler) bu sunucudaki kızlara üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      let uyerolid = sunucudb.kayıt.normal || []
      const uyerolfilter = rolmap.filter(a => uyerolid.includes(a))
      if (uyerolfilter.length) return hata(`Etiketlediğiniz [${uyerolfilter.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler) bu sunucudaki üyelere üyelere verilecek olan rol. Lütfen başka bir rol etiketleyiniz`)
      if (roles.size > 5) return hata("Hey hey heyyy sence de biraz fazla rol etiketlemedin mi?")
      const yuksekrolfilter = roles.filter(a => a.position >= guildMe.roles.highest.position)
      if (yuksekrolfilter.length) return hata(`Etiketlediğiniz [${yuksekrolfilter.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      sunucudb.kayıt.bot = rolmap
      hata(`Bundan sonra botlara [${roles.map(a => "<@&" + a.id + ">").join(" | ")}] adlı rol(leri) vereceğim`, "b")
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
