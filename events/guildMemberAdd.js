const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, GuildMember } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
const Time = require("../modüller/time")
module.exports = {
    name: "guildMemberAdd",
    /**
     * 
     * @param {GuildMember} m 
     */
    async run(m) {
        try {
            let guildşeysi = m.guild
                , sunucuid = guildşeysi.id
                , botMu = m.user.bot
                , ms = `<@${m.id}>`
                , sunucudb = m.client.s(sunucuid)
            if (!botMu) {
                let kisi = sunucudb.kl[m.id] || []
                kisi.unshift({ type: "add", timestamp: Date.now() })
                sunucudb.kl[m.id] = kisi
                db.yazdosya(sunucudb, sunucuid)
            }
            if (sunucudb.kayıt.ayar) return;
            let mid = m.user.id
                , kayıtkanal = sunucudb.kayıt.kanal
            if (kayıtkanal) {
                const chn = guildşeysi.channels.cache.get(kayıtkanal)
                if (!chn) return;
                let ao = Date.now()
                    , kişininfotografı = m.user.displayAvatarURL()
                    , createdTimestamp = m.user.createdTimestamp
                    , hesaptarih = `<t:${(createdTimestamp / 1000).toFixed(0)}:F>`
                    , kisi = guildşeysi.memberCount
                    , sayısı = kisi.toLocaleString().replace(".", ",")
                    , rolkontrolyetkilirolid = sunucudb.kayıt.yetkili
                    , botkontrolvarmı = sunucudb.kayıt.bototo
                    , embedlar = []
                    , kayıtsızrolalid = sunucudb.kayıt.kayıtsız
                    , memberEdit = {}
                    , jailRole = sunucudb.jail.rol
                    , jailGuild = db.bul(sunucuid, "jail", "diğerleri")
                if (jailRole && jailGuild[mid]) memberEdit.roles = [jailRole]
                else if (kayıtsızrolalid && !(botkontrolvarmı && botMu)) memberEdit.roles = [kayıtsızrolalid, ...m.roles.cache.filter(a => a.id != kayıtsızrolalid).map(a => a.id)]
                if (!botMu) {
                    let kontroltag = sunucudb.kayıt.tag
                        , girişisim = sunucudb.kayıt.isimler.giris
                        , isim
                        , dugme = new ActionRowBuilder()
                        , güvenlik
                        , otos = sunucudb.kayıt.otos
                        , otog = sunucudb.kayıt.otogun
                    if (createdTimestamp > (ao - 1209600000)) güvenlik = `Güvensiz ${ayarlar.emoji.guvensiz}`
                    else if (createdTimestamp > (ao - 2592000000)) güvenlik = `Şüpheli ${ayarlar.emoji.supheli}`
                    else güvenlik = `Güvenli ${ayarlar.emoji.guvenli}`
                    let hesapGuvenliMi = otog ? createdTimestamp > (ao - otog * 86400000) : (güvenlik !== `Güvenli ${ayarlar.emoji.guvenli}`)
                    if (hesapGuvenliMi && otos) {
                        let rols = sunucudb.kayıt.otosrol
                        if (rols) {
                            let mesaj
                            if (otog) mesaj = `kişinin hesabı **${Time.duration({ ms: m.user.createdTimestamp, toNow: true, skipZeros: true })}** içinde açıldığı`
                            else {
                                let split = güvenlik.split(" ")
                                mesaj = `kişi **${split[0] + " hesap " + split[1]}** olduğu`
                            }
                            return await m.edit({ roles: [rols] }).then(() => chn.send({ content: `• ${ms} adlı ${mesaj} için Şüpheli'ye atıldı!` })).catch(async err => {
                                let hatanınSebepleri = []
                                if (!guildşeysi.members.me.permissions.has("ManageRoles")) hatanınSebepleri.push("• Benim **Rolleri Yönet** yetkim yok!")
                                if (guildşeysi.roles.cache.get(rols)?.position >= guildşeysi.members.me.roles.highest?.position) hatanınSebepleri.push(`• Kayıtsız rolü olan <@&${kayıtsızrolalid}> adlı rolün sırası benim rolümün sırasından yüksek!`)
                                if (m.roles.highest.position > guildşeysi.members.me.roles.highest.position) hatanınSebepleri.push(`• Gelen kişinin rolünün sırası benim rolümün sırasından yüksek!`)
                                embedlar.push(new EmbedBuilder().setColor("Red").setTimestamp().setTitle("Hata").setDescription(`• ${ms} adlı kişiye şüpheli rolü olan <@&${rols}> adlı rolü verirken hata oluştu! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`).addFields({ name: "SEBEPLERİ", value: (hatanınSebepleri.join("\n") || "• " + err) }))
                                return await giris()
                            })
                        } else embedlar.push(new EmbedBuilder().setColor("Blue").setTimestamp().setTitle("Bilgilendirme").setDescription(`• ${ms} adlı kişinin hesabı şüpheli fakat bu sunucuda herhangi bir __şüpheli rolü__ ayarlanmadığı için onu şüpheliye atamadım!`))
                    }
                    async function giris() {
                        let ozelgirismesajıvarmı = sunucudb.kayıt.özel
                            , embedgiriş
                            , mesajlar = ayarlar.guildMemberAdd
                        if (girişisim) isim = girişisim.replace(/<tag>/g, (kontroltag ? kontroltag.slice(0, -1) : "")).replace(/<isim>/g, m.user.username).slice(0, 32)
                        else isim = `${kontroltag || ""}${m.user.username}`.slice(0, 32)
                        if (m.displayName != isim) memberEdit.nick = isim
                        if (["roles", "nick"].some(a => a in memberEdit)) await m.edit(memberEdit).catch(err => {
                            let hatanınSebepleri = []
                            if (!guildşeysi.members.me.permissions.has("ManageRoles")) hatanınSebepleri.push("• Benim **Rolleri Yönet** yetkim yok!")
                            if (!guildşeysi.members.me.permissions.has("ManageNicknames")) hatanınSebepleri.push("• Benim **Kullanıcı Adlarını Yönet** yetkim yok")
                            if (guildşeysi.roles.cache.get(kayıtsızrolalid)?.position >= guildşeysi.members.me.roles.highest?.position) hatanınSebepleri.push(`• Kayıtsız rolü olan <@&${kayıtsızrolalid}> adlı rolün sırası benim rolümün sırasından yüksek!`)
                            if (m.roles.highest.position > guildşeysi.members.me.roles.highest.position) hatanınSebepleri.push(`• Gelen kişinin rolünün sırası benim rolümün sırasından yüksek!`)
                            embedlar.push(new EmbedBuilder().setColor("Red").setTimestamp().setTitle("Hata").setDescription(`• ${ms} adlı kişinin rollerini ve ismini düzenlerken bir hata ile karşılaşıldı! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`).addFields({ name: "SEBEPLERİ", value: (hatanınSebepleri.join("\n") || "• " + err) }))
                        })
                        if (sunucudb.kayıt.secenek) dugme.addComponents(new ButtonBuilder().setCustomId("üye" + mid).setStyle(1).setEmoji(ayarlar.emoji.uye).setLabel("Üye olarak kayıt et"))
                        else dugme.addComponents(new ButtonBuilder().setCustomId("kız" + mid).setStyle(1).setEmoji(ayarlar.emoji.kiz).setLabel("Kız olarak kayıt et")).addComponents(new ButtonBuilder().setCustomId("erkek" + mid).setStyle(1).setEmoji(ayarlar.emoji.erkek).setLabel("Erkek olarak kayıt et"))
                        let isimleri = sunucudb.isimler[mid]
                            , tekrar = ""
                        if (isimleri) {
                            tekrar = "Tekrar "
                            if (!(isimleri[0].c == ayarlar.emoji.uye && !sunucudb.kayıt.secenek)) dugme.addComponents(new ButtonBuilder().setCustomId("yeniden" + mid).setStyle(3).setEmoji("🔁").setLabel("Yeniden kayıt et"))
                        }
                        if (hesapGuvenliMi) dugme.addComponents(new ButtonBuilder().setCustomId("şüpheli" + mid).setStyle(4).setLabel("Şüpheliye at").setEmoji("⛔"))
                        if (ozelgirismesajıvarmı) {
                            let rolkontrol = rolkontrolyetkilirolid ? "<@&" + rolkontrolyetkilirolid + ">" : "__**ROL AYARLI DEĞİL**__"
                            var girişmesajı = ozelgirismesajıvarmı.yazı
                                .replace(/<sunucuAdı>/g, guildşeysi.name)
                                .replace(/<üye>/g, ms)
                                .replace(/<üyeTag>/g, m.user.tag)
                                .replace(/<üyeİsim>/g, m.user.username)
                                .replace(/<üyeI[dD]>/g, mid)
                                .replace(/<toplam>/g, sayısı)
                                .replace(/<tarih>/g, hesaptarih)
                                .replace(/<tarih2>/g, hesaptarih.replace("F", "R"))
                                .replace(/<tarih3>/g, Time.toDateStringForAlisa(createdTimestamp))
                                .replace(/<güvenlik>/g, güvenlik)
                                .replace(/<rol>/g, rolkontrol)
                                .replace(/<emojiToplam>/g, m.client.stringToEmojis(kisi))
                            if (ozelgirismesajıvarmı?.embed) return chn?.send({ content: girişmesajı + "\n" + (ozelgirismesajıvarmı.im || ""), embeds: embedlar, components: [dugme] }).catch(err => { })
                            embedgiriş = new EmbedBuilder()
                                .setTitle(`${tekrar}Hoşgeldin ${m.user.username} ${ayarlar.emoji.selam}`)
                                .setDescription(girişmesajı)
                                .setColor("Random")
                                .setThumbnail(kişininfotografı)
                                .setFooter({ text: 'Nasılsın bakalım ' + m.user.username + '?' })
                                .setImage(ozelgirismesajıvarmı.im)
                        } else embedgiriş = new EmbedBuilder().setColor("Random").setThumbnail(kişininfotografı).setDescription(`**${ayarlar.emoji.cildir} \`${guildşeysi.name}\` adlı sunucumuza hoşgeldiniizz!!\n\n${ayarlar.emoji.woah} Seninle beraber tam olarak ${sayısı} kişi olduukkk\n\n${ayarlar.emoji.icme} Yetkililer seni birazdan kayıt edecektir lütfen biraz sabredin\n\n> Hesabın ${hesaptarih} tarihinde kurulmuş\n> Hesap ${güvenlik}**`).setTitle(`${sunucudb.isimler[mid] ? "Tekrar " : ""}Hoşgeldin ${m.user.username} ${ayarlar.emoji.selam}`).setFooter({ text: 'Nasılsın bakalım ' + m.user.username + '?' }).setTimestamp()
                        embedlar.push(embedgiriş)
                        return chn?.send({ embeds: embedlar, content: `${rolkontrolyetkilirolid ? `<@&${rolkontrolyetkilirolid}>, ` : ""}${mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${mid}>`)}`, components: [dugme] }).catch(err => { })
                    }
                    return await giris()
                }
                function giriş(embedlarburdangeliyor = []) {
                    let dugmebot = new ButtonBuilder().setCustomId("bot" + mid).setStyle(1).setLabel("Bot olarak kayıt et").setEmoji("🤖")
                        , dugme = new ActionRowBuilder().addComponents(dugmebot)
                        , ozelgirismesajıvarmı = sunucudb.kayıt.özel
                        , girisembed
                    if (ozelgirismesajıvarmı) {
                        let rolkontrol = rolkontrolyetkilirolid ? "<@&" + rolkontrolyetkilirolid + ">" : "__**ROL AYARLI DEĞİL**__"
                            , özelgirişmesajı = ozelgirismesajıvarmı.yazı
                                .replace(/<sunucuAdı>/g, guildşeysi.name)
                                .replace(/<üye>/g, ms)
                                .replace(/<üyeTag>/g, m.user.tag)
                                .replace(/<üyeİsim>/g, m.user.username)
                                .replace(/<üyeI[dD]>/g, mid)
                                .replace(/<toplam>/g, sayısı)
                                .replace(/<tarih>/g, hesaptarih)
                                .replace(/<tarih2>/g, hesaptarih.replace("F", "R"))
                                .replace(/<tarih3>/g, Time.toDateStringForAlisa(createdTimestamp))
                                .replace(/<güvenlik>/g, "Bot 🤖")
                                .replace(/<rol>/g, rolkontrol)
                                .replace(/<emojiToplam>/g, m.client.stringToEmojis(kisi))
                        if (ozelgirismesajıvarmı.embed) return chn?.send({ content: özelgirişmesajı + "\n" + (ozelgirismesajıvarmı.im || ""), embeds: embedlarburdangeliyor, allowedMentions: { roles: false }, components: [dugme] }).catch(err => { })
                        girisembed = new EmbedBuilder()
                            .setTitle(`Hoşgeldin bot ${ayarlar.emoji.selam}`)
                            .setColor("Random")
                            .setThumbnail(kişininfotografı)
                            .setDescription(özelgirişmesajı)
                            .setTimestamp()
                            .setImage(ozelgirismesajıvarmı.im)
                    } else {
                        girisembed = new EmbedBuilder()
                            .setTitle(`Hoşgeldin bot ${ayarlar.emoji.selam}`)
                            .setDescription(`**${ayarlar.emoji.cildir} \`${guildşeysi.name}\` adlı sunucumuza hoşgeldin bot!!\n\n${ayarlar.emoji.woah} Seninle beraber tam olarak ${sayısı} kişi olduukkk\n\n${ayarlar.emoji.opucuk} Umarım sunucuya iyi bir faydan dokunur seni seviyorum :3\n\n> Hesabın ${hesaptarih} tarihinde kurulmuş\n> Hesap Bot 🤖 **`)
                            .setColor("Random")
                            .setThumbnail(kişininfotografı)
                            .setTimestamp()
                    }
                    embedlarburdangeliyor.push(girisembed)
                    return chn?.send({ embeds: embedlarburdangeliyor, content: `• ${ms} bip bop, bop bip`, components: [dugme] }).catch(err => { })
                }
                if (botkontrolvarmı) {
                    let embedlar = []
                        , botrolid = sunucudb.kayıt.bot
                    if (botrolid) {
                        (async () => {
                            let tag = sunucudb.kayıt.tag
                                , kayıtisim = sunucudb.kayıt.isimler.kayıtbot
                                , ismi
                                , sadeceisim = m.user.username
                            if (kayıtisim) ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, sadeceisim)
                            else ismi = `${tag || ""}${sadeceisim}`
                            return await m.edit({ roles: [...botrolid, ...m.roles.cache.filter(a => ![...botrolid, kayıtsızrolalid].includes(a.id)).map(a => a.id)], nick: ismi }).then(() => {
                                let date = Date.now()
                                    , alisa = db.buldosya("alisa", "diğerleri")
                                    , date2 = (date / 1000).toFixed(0)
                                    , zaman = `<t:${date2}:F>`
                                    , verilecekRolString = botrolid.map(a => "<@&" + a + ">").join(", ")
                                    , toplamherkes = db.topla(sunucuid, 1, "kayıt toplam herkes", "diğerleri")
                                    , benvarmı = sunucudb.kayıtkisiler[m.client.user.id] || { toplam: 0 }
                                if (toplamherkes % 1000 == 0) alisa.kayıtsayı[toplamherkes.toString()] = date
                                benvarmı.toplam += 1
                                var kayıtsayısı = benvarmı.toplam
                                const embed = new EmbedBuilder()
                                    .setAuthor({ name: m.user.tag, iconURL: kişininfotografı })
                                    .setDescription(`**• Bot otomatik olarak kayıt edildi ${ayarlar.emoji.p}**`)
                                    .addFields(
                                        {
                                            name: '`Kayıt yapan`',
                                            value: `> 👤 **Adı:** <@${m.client.user.id}>\n> 🔰 **Rankı:** Botların rankı olmaz :)\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                                            inline: true
                                        },
                                        {
                                            name: '`Kayıt edilen`',
                                            value: `> 👤 **Adı:** ${ms}\n> 📝 **Yeni ismi:** \`${ismi}\`\n> ${ayarlar.emoji.rol} **Verilen rol(ler):** ${verilecekRolString}`,
                                            inline: true
                                        }
                                    )
                                    .setFooter({ text: `${m.client.user.username} Kayıt sistemi`, iconURL: m.client.user.displayAvatarURL() })
                                    .setThumbnail(kişininfotografı)
                                    .setColor('#034aa2')
                                    .setTimestamp()
                                chn?.send({ embeds: [embed] }).catch(err => { })
                                let logKanali = sunucudb.kayıt.log
                                sunucudb.son.unshift({ c: "🤖", s: m.client.user.id, k: mid, z: date2 })
                                if (logKanali) {
                                    const yapılanSeyler = [
                                        `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                                        `🧰 **KAYIT EDEN YETKİLİ**`,
                                        `**• Adı:**  <@${m.client.user.id}> - ${m.client.user.tag}`,
                                        `**• Kayıt sayısı:**  ${kayıtsayısı}`,
                                        `**• Nasıl kayıt etti:**  Otomatik`,
                                        `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                                        `\n👤 **KAYIT EDİLEN ÜYE**`,
                                        `**• Adı:**  ${ms} - ${m.user.tag}`,
                                        `**• Alınan rol:**  <@&${kayıtsızrolalid}>`,
                                        `**• Verilen rol(ler):**  ${verilecekRolString}`,
                                        `**• Yeni ismi:**  ${ismi}`,
                                        `**• Kayıt şekli:**  Bot 🤖`
                                    ]
                                    const embed = new EmbedBuilder()
                                        .setAuthor({ name: m.user.tag, iconURL: kişininfotografı })
                                        .setDescription(yapılanSeyler.join("\n"))
                                        .setThumbnail(kişininfotografı)
                                        .setColor("#b90ebf")
                                        .setTimestamp()
                                        .setFooter({ text: `${m.client.user.username} Log sistemi`, iconURL: m.client.user.displayAvatarURL() })
                                    m.guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
                                }
                                const obje = { kk: "<@" + mid + ">", r: verilecekRolString, z: zaman }
                                benvarmı.son = obje
                                if (!benvarmı.ilk) benvarmı.ilk = obje
                                const isimler = { c: "🤖", n: ismi, r: verilecekRolString, s: m.client.user.id, z: date2 }
                                let kontrolbulisimler = sunucudb.isimler[mid]
                                if (kontrolbulisimler) kontrolbulisimler.unshift(isimler)
                                else sunucudb.isimler[mid] = [isimler]
                                sunucudb.kayıtkisiler[m.client.user.id] = benvarmı
                                db.yazdosya(alisa, "alisa", "diğerleri")
                                db.yazdosya(sunucudb, sunucuid)
                            }).catch(err => {
                                let hatanınSebepleri = []
                                if (!guildşeysi.members.me.permissions.has("ManageRoles")) hatanınSebepleri.push("• Benim **Rolleri Yönet** yetkim yok!")
                                if (!guildşeysi.members.me.permissions.has("ManageNicknames")) hatanınSebepleri.push("• Benim **Kullanıcı Adlarını Yönet** yetkim yok")
                                if (guildşeysi.roles.cache.get(kayıtsızrolalid)?.position >= guildşeysi.members.me.roles.highest?.position) hatanınSebepleri.push(`• Kayıtsız rolü olan <@&${kayıtsızrolalid}> adlı rolün sırası benim rolümün sırasından yüksek!`)
                                if (m.roles.highest.position > guildşeysi.members.me.roles.highest.position) hatanınSebepleri.push(`• Gelen botun rolünün sırası benim rolümün sırasından yüksek!`)
                                embedlar.push(new EmbedBuilder().setColor("Red").setTimestamp().setTitle("Hata").setDescription(`• ${ms} adlı botun rollerini ve ismini düzenlerken bir hata ile karşılaşıldı! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`).addFields({ name: "SEBEPLERİ", value: (hatanınSebepleri.join("\n") || "• " + err) }))
                                return giriş(embedlar)
                            })
                        })()
                    } else return giriş([new EmbedBuilder().setTitle("Bilgilendirme").setDescription("Bu sunucuda herhangi bir bot rolü ayarlanmadığı için botu otomatik olarak kayıt edemedim").setColor("Blue").setTimestamp()])
                } else {
                    let embeds = []
                    if (Object.keys(memberEdit).length) await m.edit(memberEdit).catch(err => {
                        let hatanınSebepleri = []
                        if (!guildşeysi.members.me.permissions.has("ManageRoles")) hatanınSebepleri.push("• Benim **Rolleri Yönet** yetkim yok!")
                        if (guildşeysi.roles.cache.get(kayıtsızrolalid)?.position >= guildşeysi.members.me.roles.highest?.position) hatanınSebepleri.push(`• Kayıtsız rolü olan <@&${kayıtsızrolalid}> adlı rolün sırası benim rolümün sırasından yüksek!`)
                        if (m.roles.highest.position > guildşeysi.members.me.roles.highest.position) hatanınSebepleri.push(`• Gelen botun rolünün sırası benim rolümün sırasından yüksek!`)
                        embeds.push(new EmbedBuilder().setColor("Red").setTimestamp().setTitle("Hata").setDescription(`• ${ms} adlı botun rollerini düzenlerken bir hata ile karşılaşıldı! Lütfen bana **Yönetici** yetkisi verildiğinden ve rolümün üstte olduğunuzdan emin olunuz`).addFields({ name: "SEBEPLERİ", value: (hatanınSebepleri.join("\n") || "• " + err) }))
                    })
                    return giriş(embeds)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}
