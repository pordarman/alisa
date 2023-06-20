const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "üye",
    /**
     * @param {import("../../typedef").exportsRunButtons} param0 
     */
    async run({ int, sunucudb, alisa, hata, sonradan, sunucuid, guild }) {
        try {

            // Eğer bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
            function UpperKelimeler(str) {
                if (!sunucudb.kayıt.otoduzeltme) {
                    let sembol = sunucudb.kayıt.sembol
                    if (sembol) return str.replace(/ /g, " " + sembol)
                    else return str
                }
                const parcalar = str.match(/[\wöçşıüğÖÇŞİÜĞ]+/g)
                if (!parcalar?.length) return str
                parcalar.forEach(a => str = str.replace(a, a[0].toLocaleUpperCase() + a.slice(1).toLocaleLowerCase()))
                let sembol = sunucudb.kayıt.sembol
                if (sembol) return str.replace(/ /g, " " + sembol)
                else return str
            }
            async function kayıt({ memberid, member, sahipid, verilecekRolId, filter, rolVarMı, kayıtsızrolid, prefix, databaseButon }) {
                return await int.channel.awaitMessages({ filter: filter, time: 30000, max: 1 }).then(async mesaj1 => {
                    delete databaseButon[memberid]
                    db.yaz(sunucuid, databaseButon, "buton", "diğerleri")
                    setTimeout(() => int.client.butonsure.delete(memberid + sunucuid), 1000)
                    const mesaj = mesaj1.first()
                    if (mesaj.content.length < 0) return mesaj.reply("• Sanki bir isim yazmalıydın he, ne diyorsun?").catch(err => { })
                    let tag = sunucudb.kayıt.tag
                        , kayıtisim = sunucudb.kayıt.isimler.kayıt
                        , ismi
                        , sadeceisim = mesaj.content.replace(new RegExp(`(<@!?${memberid}>|${memberid}|^\.(kay[ıi]t|erkek|k[ıi]z|e|k) )`, "gm"), "").replace(/ +/g, " ").trim()
                    if (kayıtisim) {
                        if (kayıtisim.indexOf("<yaş>") != -1) {
                            let age = sadeceisim.match(int.client.regex.fetchAge)
                            if (age) {
                                let sınır = sunucudb.kayıt.yassınır
                                if (sınır > age[0]) return mesaj.reply(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`).catch(err => { })
                                sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
                            } else if (sunucudb.kayıt.yaszorunlu) return mesaj.reply("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!").catch(err => { })
                            else age = [""]
                            ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim)).replace(/<yaş>/g, age[0])
                        } else ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim))
                    } else {
                        if (sunucudb.kayıt.yaszorunlu) {
                            let sınır = sunucudb.kayıt.yassınır
                            if (sınır) {
                                let age = sadeceisim.match(int.client.regex.fetchAge)
                                if (!age) return mesaj.reply("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!").catch(err => { })
                                if (sınır > age[0]) return mesaj.reply(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`).catch(err => { })
                            } else if (sadeceisim.search(int.client.regex.fetchAge) == -1) return mesaj.reply("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!").catch(err => { })
                        }
                        ismi = `${tag || ""}${UpperKelimeler(sadeceisim)}`
                    }
                    if (ismi.length > 32) return mesaj.reply(`${ayarlar.emoji.np} Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz`).catch(err => { })
                    await member.edit({ roles: [...verilecekRolId, ...member.roles.cache.filter(a => ![kayıtsızrolid, ...verilecekRolId].includes(a.id)).map(a => a.id)], nick: ismi }).then(async () => {
                        const date = Date.now()
                        mesaj.react(ayarlar.emoji.p).catch(err => { })
                        let kisivarmıdatabasede = alisa.kisiler[sahipid] || 0
                            , sunucuvarmıdatabasede = alisa.skullanımlar[sunucuid] || 0
                            , date2 = (date / 1000).toFixed(0)
                            , zaman = `<t:${date2}:F>`
                            , verilecekRolString = verilecekRolId.map(a => "<@&" + a + ">").join(", ")
                            , sahip = { kız: 0, toplam: 0, erkek: 0, normal: 0, ...sunucudb.kayıtkisiler[sahipid] }
                            , kontrolisimler = sunucudb.isimler[memberid]
                            , desmsg = null
                            , kl = sunucudb.kl[memberid] || []
                            , ranklar = ayarlar.ranklar
                        kl.unshift({ type: "k", c: "Üye", author: sahipid, timestamp: date })
                        sunucudb.kl[memberid] = kl
                        kisivarmıdatabasede += 1
                        alisa.kisiler[sahipid] = kisivarmıdatabasede
                        sunucuvarmıdatabasede += 1
                        alisa.skullanımlar[sunucuid] = sunucuvarmıdatabasede
                        alisa.kullanımlar.kayıt.buton += 1
                        if (!kontrolisimler) {
                            sahip.toplam += 1
                            sahip.erkek += 1
                            let rankIndex = ayarlar.rankSayıları.indexOf(sahip.toplam)
                            if (rankIndex != -1) {
                                sahip.rank = String(rankIndex)
                                desmsg = `• <@${sahipid}> Tebrikler **${ranklar[rankIndex]}** kümesine terfi ettin! 🎉`
                            }
                        } else desmsg = `• <@${memberid}> adlı kişi bu sunucuda daha önceden **${kontrolisimler?.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberid}**)`
                        let kayıtsayısı = sahip.toplam || 0
                            , clientPp = int.client.user.displayAvatarURL()
                            , kişininfotografı = member.displayAvatarURL()
                            , dugmeler = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("İsmini değiştir").setEmoji("📝").setStyle(1).setCustomId("KAYIT_İSİM_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Kayıtsıza at").setEmoji("⚒️").setStyle(4).setCustomId("KAYIT_KAYITSIZ" + memberid))
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
                                .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: clientPp })
                                .setColor('#df5702')
                                .setTimestamp()
                        mesaj.reply({ embeds: [embed], components: [dugmeler] }).catch(err => { })
                        let logkanalid = sunucudb.kayıt.günlük
                        if (logkanalid) {
                            let g = sunucudb.kayıt.gözel
                            const mesajlar = ayarlar.k
                            if (g) {
                                let taglar = []
                                if (tag) taglar.push(tag.slice(0, -1))
                                if (sunucudb.kayıt.dis) taglar.push(`#${sunucudb.kayıt.dis}`)
                                taglar = taglar.join(" - ") || "**TAG YOK**"
                                const kisi = guild.memberCount
                                let r = g.yazı.replace(/<üye>/g, `<@${member.id}>`).replace(/<üyeİsim>/g, member.user.username).replace(/<üyeI[dD]>/g, memberid).replace(/<rol>/g, verilecekRolString).replace(/<üyeTag>/g, member.user.tag).replace(/<toplam>/g, kisi.toLocaleString().replace(".", ",")).replace(/<emojiToplam>/g, int.client.stringToEmojis(kisi)).replace(/<yetkili>/g, `<@${mesaj.author.id}>`).replace(/<yetkiliTag>/g, mesaj.author.tag).replace(/<yetkiliİsim>/g, mesaj.author.username).replace(/<yetkiliI[dD]>/g, sahipid).replace(/<sayı>/g, kayıtsayısı).replace(/<tag>/g, taglar)
                                guild.channels.cache.get(logkanalid)?.send(g.embed ? { content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`), embeds: [new EmbedBuilder().setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`).setDescription(r).setTimestamp().setThumbnail(kişininfotografı).setColor('#df5702')] } : { content: r, allowedMentions: { users: [memberid], roles: !verilecekRolId } }).catch(err => { })
                            } else {
                                const hepsi = new EmbedBuilder()
                                    .setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`)
                                    .setDescription(`${ayarlar.emoji.cildir} **• <@${memberid}> aramıza ${verilecekRolString} rolleriyle katıldı**`)
                                    .addFields(
                                        {
                                            name: "Kaydın bilgileri",
                                            value: `• **Kayıt edilen kişi:** <@${memberid}>\n• **Kayıt eden yetkili:** <@${sahipid}>`
                                        }
                                    )
                                    .setFooter({ text: `Kayıt sayısı => ${kayıtsayısı}` })
                                    .setThumbnail(kişininfotografı)
                                    .setColor('#df5702')
                                const mesajlar = ayarlar.k
                                guild.channels.cache.get(logkanalid)?.send({ embeds: [hepsi], content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`) }).catch(err => { })
                            }
                        }
                        sunucudb.son.unshift({ c: ayarlar.emoji.uye, s: sahipid, k: memberid, z: date2 })
                        let logKanali = sunucudb.kayıt.log
                        if (logKanali) {
                            const yapılanSeyler = [
                                `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                                `🧰 **KAYIT EDEN YETKİLİ**`,
                                `**• Adı:**  <@${mesaj.author.id}> - ${mesaj.author.tag}`,
                                `**• Kayıt sayısı:**  ${kayıtsayısı} - (${ayarlar.emoji.uye} ${sahip.normal || 0})`,
                                `**• Nasıl kayıt etti:**  Buton kullanarak`,
                                `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                                `\n👤 **KAYIT EDİLEN ÜYE**`,
                                `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                                `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Üyede kayıtsız rolü yoktu"}`,
                                `**• Verilen rol(ler):**  ${verilecekRolString}`,
                                `**• Yeni ismi:**  ${ismi}`,
                                `**• Kayıt şekli:**  Üye ${ayarlar.emoji.uye}`,
                                `**• Üye daha önceden kayıt edilmiş mi:**  ${kontrolisimler?.length ? `Evet ${kontrolisimler?.length} kere` : "Hayır"}`
                            ]
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                                .setDescription(yapılanSeyler.join("\n"))
                                .setThumbnail(kişininfotografı)
                                .setColor("#df5702")
                                .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                                .setTimestamp()
                            guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
                        }
                        const toplamherkes = db.topla(sunucuid, 1, "kayıt toplam herkes", "diğerleri")
                        if (toplamherkes % 1000 == 0) alisa.kayıtsayı[toplamherkes.toString()] = date
                        db.topla(sunucuid, 1, "normal toplam herkes", "diğerleri")
                        const obje = { kk: "<@" + memberid + ">", r: verilecekRolString, z: zaman }
                        sahip.son = obje
                        if (!sahip.ilk) sahip.ilk = obje
                        const isimler = { c: ayarlar.emoji.uye, n: ismi, r: verilecekRolString, s: sahipid, z: date2 }
                        if (kontrolisimler) kontrolisimler.unshift(isimler)
                        else sunucudb.isimler[memberid] = [isimler]
                        sunucudb.kayıtkisiler[sahipid] = sahip
                        db.yazdosya(alisa, "alisa", "diğerleri")
                        db.yazdosya(sunucudb, sunucuid)
                    }).catch(async err => {
                        delete databaseButon[memberid]
                        db.yaz(sunucuid, databaseButon, "buton", "diğerleri")
                        if (err?.code == 10007) return mesaj.reply("• Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(").catch(err => { })
                        if (err?.code == 50013) return mesaj.reply(`• <@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                        console.log(err)
                        mesaj.react(ayarlar.emoji.p).catch(err => { })
                        return mesaj.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```", ephemeral: true }).catch(err => { })
                    })
                }).catch(() => {
                    delete databaseButon[memberid]
                    db.yaz(sunucuid, databaseButon, "buton", "diğerleri")
                    int.channel?.send(`⏰ <@${sahipid}>, süreniz bitti!`).catch(err => { })
                    int.client.butonsure.delete(memberid + sunucuid)
                })
            }
            if (sonradan) {
                let memberid = sonradan[0]
                    , sahipid = sonradan[1].sahip
                int.client.butonsure.set(memberid + sunucuid, sahipid)
                setTimeout(() => int.client.butonsure.delete(memberid + sunucuid), 35000)
                return await kayıt({ memberid: memberid, member: await int.client.fetchMemberForce(memberid, int), sahipid: sahipid, verilecekRolId: sunucudb.kayıt.erkek, filter: m => m.author.id == sahipid, rolVarMı: sonradan[1].rolVarMı, kayıtsızrolid: sunucudb.kayıt.kayıtsız, prefix: sunucudb.prefix || ayarlar.prefix, databaseButon: db.bul(sunucuid, "buton", "diğerleri") || {} })
            }

            // Kontroller
            let sahipid = int.user.id
            if (int.client.butonsure.some(a => a == sahipid)) return hata(`Heyyy dur bakalım orada! Zaten halihazırda bir kayıt işlemi gerçekleştiriyorsun!`)
            let prefix = sunucudb.prefix || ayarlar.prefix
                , yetkilirolid = sunucudb.kayıt.yetkili
                , intMember = int.member
            if (!yetkilirolid) return hata(`Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            if (!sunucudb.kayıt.secenek) return hata(`Kayıt seçeneğim __**Cinsiyet**__ olarak ayarlı lütfen \`${prefix}e\` ve \`${prefix}k\` komutlarını kullanınız${intMember.permissions.has('Administrator') ? `\n\n• Eğer üye olarak kayıt etmek isterseniz **${prefix}seç normal** yazabilirsiniz` : ""}`)
            if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
            if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            var verilecekRolId = sunucudb.kayıt.normal
            if (!verilecekRolId) return hata(`Bu sunucuda herhangi bir uye rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kayıt-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            var kayıtsızrolid = sunucudb.kayıt.kayıtsız
            if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            let rol = [...verilecekRolId, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
            if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let memberid = int.customId.replace(this.name, "")
                , member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            if (int.client.butonsure.has(memberid + sunucuid)) return hata("Heyyy dur bakalım orada! Şu anda başkası bu kayıt işlemini gerçekleştiriyor!")
            if (memberid === sahipid) return hata('Kendi kendini kayıt edemezsin şapşik şey seni :)')
            if (memberid == guild.ownerId) return hata("Sunucu sahibini kayıt edemezsin şapşik şey seni :)")
            if (verilecekRolId.some(a => member.roles.cache.has(a))) return hata('Kayıt etmek istediğiniz kişi zaten daha önceden kayıt edilmiş')
            let rolVarMı = true
            if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Kayıt etmek istediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
         
            int.client.butonsure.set(memberid + sunucuid, sahipid)
            let databaseButon = db.bul(sunucuid, "buton", "diğerleri") || {}
            int.message.reply({ content: `${ayarlar.emoji.uye} <@${sahipid}>, kayıt etmek istediğiniz <@${memberid}> adlı kişinin sadece ismini ${sunucudb.kayıt.yaszorunlu ? "ve yaşını" : ""} mesaj olarak yazınız` }).then(async ms => {
                databaseButon[memberid] = { t: this.name, sahip: sahipid, id: ms.id, k: int.channelId, rolVarMı: rolVarMı, d: Date.now() }
                db.yaz(sunucuid, databaseButon, "buton", "diğerleri")
                setTimeout(() => int.client.butonsure.delete(memberid + sunucuid), 35000)
                let filter = m => m.author.id == sahipid
                return await kayıt({ memberid: memberid, member: member, sahipid: sahipid, verilecekRolId: verilecekRolId, filter: filter, rolVarMı: rolVarMı, kayıtsızrolid: kayıtsızrolid, prefix: prefix, databaseButon: databaseButon })
            }).catch(err => int.client.butonsure.delete(memberid + sunucuid))
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }

    }
}