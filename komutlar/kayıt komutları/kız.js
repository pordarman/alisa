const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  cooldown: 3,
  name: "kız",
  kod: ["k", "kız"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      var yetkilirolid = sunucudb.kayıt.yetkili
      if (!yetkilirolid) return hata(`Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      if (!msgMember.roles.cache.has(yetkilirolid) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkilirolid}> rolüne veya Yönetici`, "yetki")
      if (sunucudb.kayıt.secenek) return hata(`Kayıt seçeneğim __**Normal Kayıt**__ olarak ayarlı lütfen \`${prefix}kayıt\` komutunu kullanınız${msgMember.permissions.has('Administrator') ? `\n\n• Eğer kız ve erkek olarak kayıt etmek isterseniz **${prefix}seç cinsiyet** yazabilirsiniz` : ""}`)
      if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${msgMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
      if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
      if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
      var verilecekRolId = sunucudb.kayıt.kız
      if (!verilecekRolId) return hata(`Bu sunucuda herhangi bir kız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      var kayıtsızrolid = sunucudb.kayıt.kayıtsız
      if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      let kayitkanal = sunucudb.kayıt.kanal
      if (!kayitkanal) return hata(`Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
      if (msg.channelId !== kayitkanal) return hata(`Lütfen kayıtları kayıt kanalı olan <#${kayitkanal}> kanalında yapınız`)
      let rol = [...verilecekRolId, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
      if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      let j = args.join(" ")
      var member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
      if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
      if (member.user.bot) {
        if (sunucudb.kayıt.bot) return hata(`Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz **${prefix}bot ${member.id}** yazabilirsiniz`)
        if (msgMember.permissions.has('Administrator')) return hata('Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz ilk önce **' + prefix + 'bot-rol** ile bir bot rolünü ayarlamalısınız')
        return hata('Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz yetkililere bir bot rolü ayarlamasını söyleyiniz')
      }
      const memberid = member.user.id
      const sahipid = msg.author.id
      const butonsure = msg.client.butonsure.get(memberid + sunucuid)
      if (butonsure) {
        if (butonsure == sahipid) return hata("Heyyy dur bakalım orada! Aynı anda hem butonla hem de komutla kayıt edemezsin!")
        return hata("Heyyy dur bakalım orada! Şu anda başkası kayıt işlemini gerçekleştiriyor!")
      }
      if (memberid === sahipid) return hata('Kendi kendini kayıt edemezsin şapşik şey seni :)')
      if (memberid == guild.ownerId) return hata("Sunucu sahibini kayıt edemezsin şapşik şey seni :)")
      let erkekrolseysi = sunucudb.kayıt.erkek || [], rolVarMı = true
      if ([...verilecekRolId, ...erkekrolseysi].some(a => member.roles.cache.has(a))) return hata('Etiketlediğiniz kişi zaten daha önceden kayıt edilmiş')
      if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
      if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
      function UpperKelimeler(str) {
        if (!sunucudb.kayıt.otoduzeltme) {
          let sembol = sunucudb.kayıt.sembol
          if (sembol) return str.replace(/ /g, " " + sembol)
          else return str
        }
        var parcalar = str.match(/[\wöçşıüğÖÇŞİÜĞ]+/g)
        if (!parcalar?.length) return str
        parcalar.forEach(a => str = str.replace(a, a[0].toLocaleUpperCase() + a.slice(1).toLocaleLowerCase()))
        let sembol = sunucudb.kayıt.sembol
        if (sembol) return str.replace(/ /g, " " + sembol)
        else return str
      }
      let tag = sunucudb.kayıt.tag
        , kayıtisim = sunucudb.kayıt.isimler.kayıt
        , ismi
        , sadeceisim = j.replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim()
      if (!sadeceisim) return hata(`Lütfen kayıt edeceğiniz kişinin ismini giriniz\n\n**Örnek**\n• ${prefix}k ${memberid} Güzel Nisa 18\n• ${prefix}k <@${member.id}> Güzel Nisa 18\n• ${prefix}k Güzel Nisa 18 <@${member.id}>`)
      if (kayıtisim) {
        if (kayıtisim.indexOf("<yaş>") != -1) {
          let age = sadeceisim.match(msg.client.regex.fetchAge)
          if (age) {
            let sınır = sunucudb.kayıt.yassınır
            if (sınır > age[0]) return hata(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`)
            sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
          } else if (sunucudb.kayıt.yaszorunlu) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
          else age = [""]
          ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim)).replace(/<yaş>/g, age[0])
        } else ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim))
      } else {
        if (sunucudb.kayıt.yaszorunlu) {
          let sınır = sunucudb.kayıt.yassınır
          if (sınır) {
            let age = sadeceisim.match(msg.client.regex.fetchAge)
            if (!age) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
            if (sınır > age[0]) return hata(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`)
          } else if (sadeceisim.search(msg.client.regex.fetchAge) == -1) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
        }
        ismi = `${tag || ""}${UpperKelimeler(sadeceisim)}`
      }
      if (ismi.length > 32) return hata(' • Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz')
      await member.edit({ roles: [...verilecekRolId, ...member.roles.cache.filter(a => a.id != kayıtsızrolid).map(a => a.id)], nick: ismi }).then(async () => {
        const date = Date.now()
        msg.react(ayarlar.emoji.p).catch(err => { })
        let date2 = (date / 1000).toFixed(0)
          , zaman = `<t:${date2}:F>`
          , desmsg = null
          , verilecekRolString = verilecekRolId.map(a => "<@&" + a + ">").join(", ")
          , sahip = { kız: 0, toplam: 0, erkek: 0, normal: 0, ...sunucudb.kayıtkisiler[sahipid] }
          , kontrolisimler = sunucudb.isimler[memberid]
          , kl = sunucudb.kl[memberid] || []
          , ranklar = ayarlar.ranklar
        kl.unshift({ type: "k", c: "Kız", author: sahipid, timestamp: date })
        sunucudb.kl[memberid] = kl
        if (!kontrolisimler) {
          sahip.toplam += 1
          sahip.kız += 1
          let rankIndex = ayarlar.rankSayıları.indexOf(sahip.toplam)
          if (rankIndex != -1) {
            sahip.rank = String(rankIndex)
            desmsg = `• <@${sahipid}> Tebrikler **${ranklar[rankIndex]}** kümesine terfi ettin! 🎉`
          }
        } else desmsg = `• <@${memberid}> adlı kişi bu sunucuda daha önceden **${kontrolisimler?.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberid}**)`
        let kayıtsayısı = sahip.toplam || 0
          , clientPp = msg.client.user.displayAvatarURL()
          , kişininfotografı = member.displayAvatarURL()
          , dugmeler = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("İsmini değiştir").setEmoji("📝").setStyle(1).setCustomId("KAYIT_İSİM_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Cinsiyetini değiştir").setEmoji("♻️").setStyle(2).setCustomId("KAYIT_CİNSİYET_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Kayıtsıza at").setEmoji("⚒️").setStyle(4).setCustomId("KAYIT_KAYITSIZ" + memberid))
          , embed = new EmbedBuilder()
            .setAuthor({ name: 'Kayıt yapıldı', iconURL: guild.iconURL() })
            .setDescription(desmsg)
            .addFields(
              {
                name: '`Kayıt yapan`',
                value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ranklar[sahip.rank] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
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
            .setColor('#b90ebf')
            .setTimestamp()
        msg.reply({ embeds: [embed], components: [dugmeler] }).catch(err => { })
        let logkanalid = sunucudb.kayıt.günlük
        if (logkanalid) {
          let g = sunucudb.kayıt.gözel
          const mesajlar = [...ayarlar.k, `<@${member.id}> gözümü alan bu güzellik ne böyle`, `Güzelliğin ete kemiğe bürünmüş hali gibisin <m>`, `Güzellik diyince akla sen geliyorsun <m>`, `Yok yok ben iyiyim <m> sadece güzelliğin gözlerimi aldı da`, `<m> uzuun araştırmalarım sonucunda çok güzel olduğuna karar verdim`, `<m> pardon güzellik salonuna mı geldim`, `<m> pardon hanımefendi güzellik yarışmasına katılmayı hiç düşündünüz mü?`, `<m> bu güzelliği taşırken hiç yorulmuyor musun?`, `<m> hanımefendi müsadenizle size yürüyeceğim`, "Şeyy <m> senden Bi ricam var. Nikah masasında ayağımı çiğner misin?"]
          if (g) {
            let taglar = []
            if (tag) taglar.push(tag.slice(0, -1))
            if (sunucudb.kayıt.dis) taglar.push(`#${sunucudb.kayıt.dis}`)
            taglar = taglar.join(" - ") || "**TAG YOK**"
            const kisi = guild.memberCount
            let r = g.yazı.replace(/<üye>/g, `<@${member.id}>`).replace(/<üyeİsim>/g, member.user.username).replace(/<üyeI[dD]>/g, memberid).replace(/<rol>/g, verilecekRolString).replace(/<üyeTag>/g, member.user.tag).replace(/<toplam>/g, kisi.toLocaleString().replace(".", ",")).replace(/<emojiToplam>/g, msg.client.stringToEmojis(kisi)).replace(/<yetkili>/g, `<@${msg.author.id}>`).replace(/<yetkiliTag>/g, msg.author.tag).replace(/<yetkiliİsim>/g, msg.author.username).replace(/<yetkiliI[dD]>/g, sahipid).replace(/<sayı>/g, kayıtsayısı).replace(/<tag>/g, taglar)
            guild.channels.cache.get(logkanalid)?.send(g.embed ? { content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`), embeds: [new EmbedBuilder().setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`).setDescription(r).setTimestamp().setThumbnail(kişininfotografı).setColor('#df5702')] } : { content: r, allowedMentions: { users: [memberid], roles: !verilecekRolId } }).catch(err => { })
          } else {
            const hepsi = new EmbedBuilder()
              .setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`)
              .setDescription(`${ayarlar.emoji.cildir} **• <@${member.id}> aramıza ${verilecekRolString} rolleriyle katıldı**`)
              .addFields(
                {
                  name: "Kaydın bilgileri",
                  value: `• **Kayıt edilen kişi:** <@${memberid}>\n• **Kayıt eden yetkili:** <@${sahipid}>`
                }
              )
              .setFooter({ text: `Kayıt sayısı => ${kayıtsayısı}` })
              .setThumbnail(kişininfotografı)
              .setColor('#b90ebf')
            guild.channels.cache.get(logkanalid)?.send({ embeds: [hepsi], content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`) }).catch(err => { })
          }
        }
        sunucudb.son.unshift({ c: ayarlar.emoji.kiz, s: sahipid, k: memberid, z: date2 })
        let logKanali = sunucudb.kayıt.log
        if (logKanali) {
          const yapılanSeyler = [
            `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
            `🧰 **KAYIT EDEN YETKİLİ**`,
            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
            `**• Kayıt sayısı:**  ${kayıtsayısı} - (${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`,
            `**• Nasıl kayıt etti:**  Komut kullanarak`,
            `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
            `\n👤 **KAYIT EDİLEN ÜYE**`,
            `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
            `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Üyede kayıtsız rolü yoktu"}`,
            `**• Verilen rol(ler):**  ${verilecekRolString}`,
            `**• Yeni ismi:**  ${ismi}`,
            `**• Kayıt şekli:**  Kız ${ayarlar.emoji.kiz}`,
            `**• Üye daha önceden kayıt edilmiş mi:**  ${kontrolisimler?.length ? `Evet ${kontrolisimler?.length} kere` : "Hayır"}`
          ]
          const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
            .setDescription(yapılanSeyler.join("\n"))
            .setThumbnail(kişininfotografı)
            .setColor("#b90ebf")
            .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: clientPp })
            .setTimestamp()
          guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
        }
        const toplamherkes = db.topla(sunucuid, 1, "kayıt toplam herkes", "diğerleri")
        if (toplamherkes % 1000 == 0) {
          alisa.kayıtsayı[toplamherkes.toString()] = date
          db.yazdosya(alisa, "alisa", "diğerleri")
        }
        db.topla(sunucuid, 1, "kız toplam herkes", "diğerleri")
        const obje = { kk: "<@" + memberid + ">", r: verilecekRolString, z: zaman }
        sahip.son = obje
        if (!sahip.ilk) sahip.ilk = obje
        const isimler = { c: ayarlar.emoji.kiz, n: ismi, r: verilecekRolString, s: sahipid, z: date2 }
        if (kontrolisimler) kontrolisimler.unshift(isimler)
        else sunucudb.isimler[memberid] = [isimler]
        sunucudb.kayıtkisiler[sahipid] = sahip
        db.yazdosya(sunucudb, sunucuid)
        return;
      }).catch(async err => {
        if (err?.code == 50013) return msg.reply(`• <@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
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

