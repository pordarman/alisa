const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  cooldown: 5,
  name: "isim",
  aliases: ["isim", "nick", "nickname", "ad", "adı", "n"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {      

      // Kontroller
      let yetkiliid = guildDatabase.kayıt.yetkili
      if (yetkiliid) {
        if (!msgMember.roles.cache.has(yetkiliid) && !msgMember.permissions.has('ManageNicknames')) return hata(`<@&${yetkiliid}> rolüne **veya** Kullanıcı Adlarını Yönet`, "yetki")
      } else if (!msgMember.permissions.has('ManageNicknames')) return hata(`Kullanıcı Adlarını Yönet`, "yetki")
      if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
      let j = args.join(" ")
      const member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
      if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
      const memberid = member.id
      if (memberid === guild.ownerId) return hata(`Sunucu sahibinin ismini değiştiremem şapşik şey seni :(`)
      if (memberid === msg.author.id && !msgMember.permissions.has('ChangeNickname') && !msgMember.permissions.has('ManageNicknames')) return hata(`Kendi ismini değiştiremezsin şapşik şey seni :)`)
      if (member.roles.highest.position >= guildMe.roles.highest.position && memberid !== msg.client.user.id) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      if (member.roles.highest.position >= msgMember.roles.highest.position && msg.author.id !== guild.ownerId && memberid !== msg.author.id) return hata(`Etiketlediğiniz kişinin sizin rolünüzden yüksek o yüzden onun ismini değiştiremezsiniz`)
      function UpperKelimeler(str) {
        if (!guildDatabase.kayıt.otoduzeltme) {
          if (sembol) return str.replace(/ /g, " " + sembol)
          else return str
        }
        var parcalar = str.match(/[\wöçşıüğÖÇŞİÜĞ]+/g)
        if (!parcalar?.length) return str
        parcalar.forEach(a => str = str.replace(a, a[0].toLocaleUpperCase() + a.slice(1).toLocaleLowerCase()))
        if (sembol) return str.replace(/ /g, " " + sembol)
        else return str
      }
      let tag = guildDatabase.kayıt.tag
      , sembol = guildDatabase.kayıt.sembol
      , sadeceisim = j?.replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "")?.replace(/ +/g, " ")?.trim()
      , isim
      if (member.user.bot) isim = `${tag || ""}${sadeceisim || member.user.username}`
      else {
        let kayıtisim = guildDatabase.kayıt.isimler.kayıt
        if (kayıtisim) {
          if (kayıtisim.indexOf("<yaş>") != -1) {
            let age = sadeceisim.match(msg.client.regex.fetchAge)
            if (age) sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
            else if (guildDatabase.kayıt.yaszorunlu) return hata("Hey bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
            else age = [""]
            isim = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim)).replace(/<yaş>/g, age[0])
          } else isim = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim))
        } else {
          if (guildDatabase.kayıt.yaszorunlu && sadeceisim.search(msg.client.regex.fetchAge) == -1) return hata("Hey bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
          isim = `${tag || ""}${UpperKelimeler(sadeceisim)}`
        }
      }
      if (isim.length > 32) return hata(`Sunucu ismi 32 karakterden fazla olamaz`)
      if (member.nickname === isim) return hata(`<@${memberid}> adlı kişinin ismi yazdığınız isimle aynı zaten`)

      // Üyenin ismini değiştirme
      await member.setNickname(isim).then(() => {
        msg.react(ayarlar.emoji.p).catch(err => { })
        if (!member.user.bot) {
          let kl = guildDatabase.kl[memberid] || []
          kl.unshift({ type: "i", newName: isim, author: msg.author.id, timestamp: Date.now() })
          guildDatabase.kl[memberid] = kl
          db.yazdosya(guildDatabase, guildId)
        }
      }).catch(err => {
        if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin ismini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
        console.log(err)
        msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
      })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
