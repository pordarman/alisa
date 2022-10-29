const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  cooldown: 5,
  name: "rolleri al",
  kod: ["kayitsiz", "kayıtsız"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {     
      let yetkili = sunucudb.kayıt.yetkili
      if (yetkili) {
        if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
      } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
      if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${msgMember.permissions.has("Administrator") ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
      if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
      if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
      let kayıtsizrolid = sunucudb.kayıt.kayıtsız
      if (!kayıtsizrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz` : ""}`)
      const kişi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
      if (!kişi) return hata(Time.isNull(kişi) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
      if (!kişi) return hata('Lütfen birisini etiketleyiniz')
      if (kişi.user.bot) return hata('Bu komut botlarda kullanılamaz')
      if (msg.author.id === kişi.id) return hata('Bu komutu kendinde kullanamazsın şapşik şey seni :)')
      if (kişi.roles.highest.position >= msgMember.roles.highest.position && msg.author.id !== guild.ownerId) return hata('Kendi rolünün sırasından yüksek birisini kayıtsız yapamazsın')
      if (kişi.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      if (guild.roles.cache.get(kayıtsizrolid)?.position >= guildMe.roles.highest.position) return hata('Kayıtsız rolünün sırası benim rolümün sırasından yüksek olduğu için hiçbir işlem yapamadım')
      let rol
      if (sunucudb.kayıt.secenek) rol = sunucudb.kayıt.normal || []
      else rol = [...(sunucudb.kayıt.erkek || []), ...(sunucudb.kayıt.kız || [])]
      if (kişi.roles.cache.has(kayıtsizrolid) && !rol.some(a => kişi.roles.cache.has(a))) return hata('Etiketlediğiniz kişi zaten kayıtsız alınmış durumda')
      let kontroltag = sunucudb.kayıt.tag
      , girişisim = sunucudb.kayıt.isimler.giris
      , isim
      if (girişisim) isim = girişisim.replace(/<tag>/g, (kontroltag ? kontroltag.slice(0, -1) : "")).replace(/<isim>/g, kişi.user.username).slice(0, 32)
      else isim = `${kontroltag || ""}${kişi.user.username}`.slice(0, 32);
      (async () => {
        await kişi.edit({ roles: [kayıtsizrolid], nick: isim }).then(() => {
          msg.reply({ content: `• ⚒️ <@${kişi.user.id}> adlı kişiden tüm rolleri alıp başarıyla kayıtsız rolünü verdim`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
          let kl = sunucudb.kl[kişi.id] || []
          kl.unshift({ type: "ka", author: msg.author.id, timestamp: Date.now() })
          sunucudb.kl[kişi.id] = kl
          db.yazdosya(sunucudb, sunucuid)
          return;
        }).catch(err => {
          if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
          console.log(err)
          return msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?' }).catch(err => { })
        })
      })()
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
