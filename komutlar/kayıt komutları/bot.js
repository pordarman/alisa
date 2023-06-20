const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  cooldown: 3,
  name: "bot",
  aliases: ["b", "bot"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {      

      // Kontroller
      var yetkilirolid = sunucudb.kayıt.yetkili
      if (yetkilirolid) {
        if (!msgMember.roles.cache.has(yetkilirolid) && !msgMember.permissions.has("Administrator")) return hata(`<@&${yetkilirolid}> rolüne **veya** Yönetici`, "yetki")
      } else if (!msgMember.permissions.has("Administrator")) return hata(`Yönetici`, "yetki")
      if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${msgMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
      if (!guildMe.permissions.has('ManageRoles')) return hata('Rolleri Yönet', "yetkibot")
      if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
      var botrolid = sunucudb.kayıt.bot
      if (!botrolid) return hata(`Bu sunucuda herhangi bir bot rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}bot-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      var kayıtsızrolid = sunucudb.kayıt.kayıtsız
      if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      let kayitkanal = sunucudb.kayıt.kanal
      if (!kayitkanal) return hata(`Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      if (msg.channelId !== kayitkanal) return hata(`Lütfen kayıtları kayıt kanalı olan <#${kayitkanal}> kanalında yapınız`)
      let rol = [...botrolid, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
      , rolVarMı = true
      if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      let j = args.join(" ")
      var member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
      if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz bot sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir botu etiketleyiniz ya da ID\'sini giriniz")
      if (!member.user.bot) return hata('Bot rolünü verebilmek için insan yerine bir botu etiketleyiniz')
      if (botrolid.some(a => member.roles.cache.has(a))) return hata('Etiketlediğiniz bot zaten daha önceden kayıt olmuş')
      if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
      if (member.id == msg.client.user.id) return msg.reply("K-kendimi nasıl kayıt edebilirim?").catch(err => { })
      if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      const memberid = member.user.id
      const sahipid = msg.author.id
      let tag = sunucudb.kayıt.tag
      , kayıtisim = sunucudb.kayıt.isimler.kayıtbot
      , ismi
      , sadeceisim = j.replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim() || member.user.username
      if (kayıtisim) ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, sadeceisim)
      else ismi = `${tag || ""}${sadeceisim}`
      if (ismi.length > 32) return hata('Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz')

      // Botu kayıt etme
      await member.edit({ roles: [...botrolid, ...member.roles.cache.filter(a => a.id != kayıtsızrolid).map(a => a.id)], nick: ismi }).then(async () => {
        const date = Date.now()
        msg.react(ayarlar.emoji.p).catch(err => { })
        let date2 = (date / 1000).toFixed(0)
          , zaman = `<t:${date2}:F>`
          , verilecekRolString = botrolid.map(a => "<@&" + a + ">").join(", ")
          , sahip = sunucudb.kayıtkisiler[sahipid] || {}
          , kayıtsayısı = sahip.toplam || "0"
          , clientPp = msg.client.user.displayAvatarURL()
          , discordlogo = guild.iconURL()
          , kişininfotografı = member.displayAvatarURL()
          , embed = new EmbedBuilder()
            .setAuthor({ name: 'Kayıt yapıldı', iconURL: discordlogo })
            .addFields(
              {
                  name: '`Kayıt yapan`',
                  value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ayarlar.ranklar[sahip.rank] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                  inline: true
              }
              , {
                  name: '`Kayıt edilen`',
                  value: `> 👤 **Adı:** <@${memberid}>\n> 📝 **Yeni ismi:** \`${ismi}\`\n> ${ayarlar.emoji.rol} **Verilen rol(ler):** ${verilecekRolString}`,
                  inline: true
              }
          )
            .setThumbnail(kişininfotografı)
            .setFooter({ text: `${msg.client.user.username} Kayıt sistemi`, iconURL: clientPp })
            .setColor('#034aa2')
            .setTimestamp()
        msg.reply({ embeds: [embed] }).catch(err => { })
        sunucudb.son.unshift({ c: "🤖", s: sahipid, k: memberid, z: date2 })
        let logKanali = sunucudb.kayıt.log
        if (logKanali) {
          const yapılanSeyler = [
            `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
            `🧰 **KAYIT EDEN YETKİLİ**`,
            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
            `**• Kayıt sayısı:**  ${kayıtsayısı} - ${sunucudb.kayıt.secenek ? `(${ayarlar.emoji.uye} ${sahip.normal || 0})` : `(${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`}`,
            `**• Nasıl kayıt etti:**  Komut kullanarak`,
            `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
            `\n👤 **KAYIT EDİLEN BOT**`,
            `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
            `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Botta kayıtsız rolü yoktu"}`,
            `**• Verilen rol(ler):**  ${verilecekRolString}`,
            `**• Yeni ismi:**  ${ismi}`,
            `**• Kayıt şekli:**  Bot 🤖`
          ]
          const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
            .setDescription(yapılanSeyler.join("\n"))
            .setThumbnail(kişininfotografı)
            .setColor("#034aa2")
            .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: clientPp })
            .setTimestamp()
          guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
        }
        const toplamherkes = db.topla(sunucuid, 1, "kayıt toplam herkes", "diğerleri")
        if (toplamherkes % 1000 == 0) {
          alisa.kayıtsayı[toplamherkes.toString()] = date
          db.yazdosya(alisa, "alisa", "diğerleri")
        }
        const obje = { kk: "<@" + memberid + ">", r: verilecekRolString, z: zaman }
        sahip.son = obje
        if (!sahip.ilk) sahip.ilk = obje
        const isimler = { c: "🤖", n: ismi, r: verilecekRolString, s: sahipid, z: date2 }
        let isimlerkontrol = sunucudb.isimler[memberid]
        if (isimlerkontrol) isimlerkontrol.unshift(isimler)
        else sunucudb.isimler[memberid] = [isimler]
        sunucudb.kayıtkisiler[sahipid] = sahip
        db.yazdosya(sunucudb, sunucuid)
        return;
      }).catch(async err => {
        if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı botun ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
        console.log(err)
        msg.react(ayarlar.emoji.p).catch(err => { })
        return msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```" }).catch(err => { })
      })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
