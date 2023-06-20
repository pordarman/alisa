const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  cooldown: 5,
  name: "değiştir",
  aliases: ["degistir", "degis", "değiş", "değiştir"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      let yetkili = sunucudb.kayıt.yetkili
      if (yetkili) {
        if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
      } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
      if (sunucudb.kayıt.secenek) return hata('Bu komut sadece __**Cinsiyet**__ ile kayıt yapanlara özeldir')
      if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${msgMember.permissions.has("Administrator") ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
      if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
      const kızroliddegistirsicin = sunucudb.kayıt.kız
      if (!kızroliddegistirsicin) return hata(`Bu sunucuda herhangi bir kız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kız-rol @rol** yazabilirsiniz` : ""}`)
      const erkekroliddegistirsicin = sunucudb.kayıt.erkek
      if (!erkekroliddegistirsicin) return hata(`Bu sunucuda herhangi bir erkek rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}erkek-rol @rol** yazabilirsiniz` : ""}`)
      const kişi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
      if (!kişi) return hata(Time.isNull(kişi) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
      if (kişi.id === msg.author.id) return hata('Bu komutu kendinde kullanamazsın şapşik şey seni :)')
      if (kişi.user.bot) return hata('Bu komut botlar üzerinde kullanılmaz')
      if (kişi.roles.highest.position >= msgMember.roles.highest.position && msg.author.id !== guild.ownerId) return hata('Etiketlediğiniz kişinin rolünün sırası sizin rolünüzün sırasından yüksek olduğu için bunu yapamazsınız')
      const yuksekroluyarı = [...kızroliddegistirsicin, ...erkekroliddegistirsicin].filter(a => guild.roles.cache.get(a).position >= guildMe.roles.highest.position)
      if (yuksekroluyarı.length) return hata('Bu sunucudaki [' + yuksekroluyarı.map(a => "<@&" + a + ">").join(" | ") + `] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      const erkekrolvarmıkiside = erkekroliddegistirsicin.every(a => kişi.roles.cache.has(a))
      const kızrolvarmıkiside = kızroliddegistirsicin.every(a => kişi.roles.cache.has(a))
      if (!erkekrolvarmıkiside && !kızrolvarmıkiside) return hata("Etiketlediğiniz kişide hem erkek rolü hem de kız rolü bulunmuyor!")

      // Cinsiyeti değiştirme
      if (erkekrolvarmıkiside && kızrolvarmıkiside) {
        const düğmeerkek = new ButtonBuilder()
          .setLabel("Erkek")
          .setCustomId("errkek")
          .setStyle(1)
          .setEmoji(ayarlar.emoji.erkek)
        const düğmekız = new ButtonBuilder()
          .setLabel("Kız")
          .setCustomId("kkız")
          .setStyle(1)
          .setEmoji(ayarlar.emoji.kiz)
        const düğme = new ActionRowBuilder().addComponents(düğmeerkek).addComponents(düğmekız)
        msg.reply({ content: "Etiketlediğiniz kişide hem erkek hem de kız rolü bulunuyor. Lütfen aşağıdaki düğmelerden hangi rolü vermemi istyorsanız onu seçiniz", allowedMentions: { users: false, repliedUser: true }, components: [düğme] }).then(a => {
          const filter = i => ["errkek", "kkız"].includes(i.customId) && i.user.id === msg.author.id
          const clin = a.createMessageComponentCollector({ filter: filter, time: 15 * 1000 })
          clin.on("collect", async oklar => {
            if (oklar.customId == "errkek") {
              await kişi.edit({ roles: [...erkekroliddegistirsicin, ...kişi.roles.cache.filter(a => ![...kızroliddegistirsicin, ...erkekroliddegistirsicin].includes(a.id)).map(a => a.id)] }).then(() => {
                düğmeerkek.setStyle(3).setDisabled(true)
                düğmekız.setStyle(2).setDisabled(true)
                const düğme = new ActionRowBuilder().addComponents(düğmeerkek).addComponents(düğmekız)
                let kl = sunucudb.kl[kişi.id] || []
                kl.unshift({ type: "d", c: true, author: msg.author.id, timestamp: Date.now() })
                sunucudb.kl[kişi.id] = kl
                a.edit({ content: `• ♻️ ${ayarlar.emoji.erkek} <@${kişi.id}> adlı kişiden kız rolünü alıp erkek rolünü verdim`, allowedMentions: { users: false, repliedUser: true }, components: [düğme] }).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
              }).catch(err => {
                if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                console.log(err)
                msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
              })
            } else {
              await kişi.edit({ roles: [...kızroliddegistirsicin, ...kişi.roles.cache.filter(a => ![...kızroliddegistirsicin, ...erkekroliddegistirsicin].includes(a.id)).map(a => a.id)] }).then(() => {
                düğmeerkek.setStyle(2).setDisabled(true)
                düğmekız.setStyle(3).setDisabled(true)
                const düğme = new ActionRowBuilder().addComponents(düğmeerkek).addComponents(düğmekız)
                let kl = sunucudb.kl[kişi.id] || []
                kl.unshift({ type: "d", c: false, author: msg.author.id, timestamp: Date.now() })
                sunucudb.kl[kişi.id] = kl
                a.edit({ content: `• ♻️ ${ayarlar.emoji.kiz} <@${kişi.id}> adlı kişiden erkek rolünü alıp kız rolünü verdim`, allowedMentions: { users: false, repliedUser: true }, components: [düğme] }).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
              }).catch(err => {
                if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                console.log(err)
                msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
              })
            }
          })
          clin.on("end", async () => {
            düğmeerkek.setDisabled(true)
            düğmekız.setDisabled(true)
            const düğme = new ActionRowBuilder().addComponents(düğmeerkek).addComponents(düğmekız)
            a.edit({ content: `${a.content} - *Bu mesaj artık aktif değildir*`, components: [düğme] }).catch(err => { })
          })
        })
      } else if (erkekrolvarmıkiside) {
        await kişi.edit({ roles: [...kızroliddegistirsicin, ...kişi.roles.cache.filter(a => ![...kızroliddegistirsicin, ...erkekroliddegistirsicin].includes(a.id)).map(a => a.id)] }).then(() => {
          let kl = sunucudb.kl[kişi.id] || []
          kl.unshift({ type: "d", c: false, author: msg.author.id, timestamp: Date.now() })
          sunucudb.kl[kişi.id] = kl
          msg.reply({ content: `• ♻️ ${ayarlar.emoji.kiz} <@${kişi.id}> adlı kişiden erkek rolünü alıp kız rolünü verdim`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
          db.yazdosya(sunucudb, sunucuid)
          return;
        }).catch(err => {
          if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
          console.log(err)
          msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
        })
      } else {
        await kişi.edit({ roles: [...erkekroliddegistirsicin, ...kişi.roles.cache.filter(a => ![...kızroliddegistirsicin, ...erkekroliddegistirsicin].includes(a.id)).map(a => a.id)] }).then(() => {
          let kl = sunucudb.kl[kişi.id] || []
          kl.unshift({ type: "d", c: true, author: msg.author.id, timestamp: Date.now() })
          sunucudb.kl[kişi.id] = kl
          msg.reply({ content: `• ♻️ ${ayarlar.emoji.erkek} <@${kişi.id}> adlı kişiden kız rolünü alıp erkek rolünü verdim`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
          db.yazdosya(sunucudb, sunucuid)
          return;
        }).catch(err => {
          if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
          console.log(err)
          msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
        })
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}