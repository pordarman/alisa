const { User } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "userUpdate",
    /**
     * 
     * @param {User} oldUser 
     * @param {User} newUser 
     */
    async run(oldUser, newUser) {
        if (oldUser.bot || (oldUser.username == newUser.username && oldUser.discriminator == newUser.discriminator)) return;
        let tümTagRol = db.buldosya("tag rol", "diğerleri")
            , obj = Object.entries(tümTagRol).filter(([id, tagrol]) => !tagrol.ayar && (tagrol.tag || tagrol.dis) && ((oldUser.username + newUser.username).includes(tagrol.tag) || [oldUser.discriminator, newUser.discriminator].includes(tagrol.dis)))
        if (!obj.length) return;
        let shards = {}
        obj.forEach((a) => {
            let shard = newUser.client.shardId(a[0]);
            shards[shard] ||= []
            shards[shard].push(a)
        })
        Object.entries(shards).forEach(async ([shardId, array]) => {
            array.forEach(async ([id, tagrol]) => {
                try {
                    await newUser.client.shard.broadcastEval(async (c, context) => {
                        try {
                            let { EmbedBuilder } = require("discord.js")
                                , db = require("../../../../modüller/database.js")
                                , ayarlar = require("../../../../ayarlar.json")
                                , { oldUser, newUser, id, tagrol } = context
                                , a = c.guilds.cache.get(id)
                            if (!a) return;
                            const uye = await c.fetchMemberForce(oldUser.id, { guild: a })
                            if (!uye) return;
                            let dis = tagrol.dis
                                , tag = tagrol.tag
                                , eskidenTagVarMıydı = oldUser.username.includes(tag)
                                , eskidenDisVarMıydı = oldUser.discriminator == dis
                                , yeniTagVarMı = newUser.username.includes(tag)
                                , yeniDisVarMı = newUser.discriminator == dis
                                , tagDegisim = !eskidenTagVarMıydı && yeniTagVarMı
                                , disDegisim = !eskidenDisVarMıydı && yeniDisVarMı
                            if (tagDegisim || disDegisim) {
                                let date = Date.now()
                                if (!tagrol.kisi[uye.id]) tagrol.kisi[uye.id] = date
                                let rolId = tagrol.rol
                                    , kanalId = tagrol.kanal
                                    , rolhata
                                    , alınanTag = []
                                    , mesajhata
                                    , toplamTaglı
                                if (rolId) await uye.roles.add(rolId).catch(err => { rolhata = err })
                                if (tagDegisim) alınanTag.push(tag)
                                if (disDegisim) alınanTag.push(`#${dis}`)
                                if (tagrol.dmesaje) await uye.send(tagrol.dmesaje.yazı.replace(/<sunucuAdı>/g, a.name).replace(/<tag>/g, alınanTag.join(" - ")).replace(/<üye>/g, `<@${uye.id}>`).replace(/<üyeTag>/g, newUser.tag).replace(/<üyeİsim>/g, newUser.username).replace(/<üyeI[dD]>/g, uye.id)).catch(err => { mesajhata = true })
                                if (tagrol.log) {
                                    let embedler = []
                                    toplamTaglı = (await c.getMembers({ guild: a })).filter(user => user.user.username.includes(tag) || user.user.discriminator == dis).size.toString()
                                    const pp = uye.displayAvatarURL()
                                    if (rolhata) {
                                        const embed2 = new EmbedBuilder()
                                            .setTitle("Hata")
                                            .setColor("Red")
                                            .setDescription(`• <@${uye.id}> adlı kişiye <@&${rolId}> adlı rolü verirken bir hata oluştu!`)
                                            .addFields({ name: "SEBEPLERİ", value: `• ${rolhata}` })
                                        embedler.push(embed2)
                                    }
                                    const bilgiler = [
                                        `**• Sunucuda toplam ${toplamTaglı} taglı üye bulunuyor** 🎉`,
                                        `\n**• Adı:**  <@${uye.id}> - ${uye.user.tag}`,
                                        `**• Aldığı tag:**  ${alınanTag.join(" - ")}`,
                                        `**• Aldığı tarih:**  <t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>\n`
                                    ]
                                    if (rolId) bilgiler.push(`**• Verilen rol:**  ${rolhata ? "Rol verilirken hata oluştu" : `<@&${rolId}>`}`)
                                    if (tagrol.dmesaje) bilgiler.push(`**• DM'den mesaj atıldı mı:**  ${mesajhata ? "DM'den mesaj atamadım, büyük ihtimalle DM'si kapalı" : "Evet atıldı"}`)
                                    const embed = new EmbedBuilder()
                                        .setTitle(`${ayarlar.emoji.p} Tag alındı`)
                                        .setDescription(bilgiler.join("\n"))
                                        .setAuthor({ name: uye.user.tag, iconURL: pp })
                                        .setColor(uye.displayHexColor ?? "#9e02e2")
                                        .setThumbnail(pp)
                                        .setTimestamp()
                                        .setFooter({ text: `${c.user.username} Log sistemi`, iconURL: c.user.displayAvatarURL() })
                                    embedler.push(embed)
                                    a.channels.cache.get(tagrol.log).send({ embeds: embedler }).catch(err => { })
                                }
                                if (kanalId) {
                                    if (tagrol.mesaje) {
                                        toplamTaglı = toplamTaglı ?? (await c.getMembers({ guild: a })).filter(user => user.user.username.includes(tag) || user.user.discriminator == dis).size.toString()
                                        var atılacakMesajEkleme = tagrol.mesaje.yazı
                                            .replace(/<tag>/g, alınanTag.join(" - "))
                                            .replace(/<toplam>/g, toplamTaglı)
                                            .replace(/<emojiToplam>/g, c.stringToEmojis(toplamTaglı))
                                            .replace(/<üye>/g, `<@${uye.id}>`)
                                            .replace(/<üyeTag>/g, newUser.tag)
                                            .replace(/<üyeİsim>/g, newUser.username)
                                            .replace(/<üyeI[dD]>/g, newUser.id)
                                            .replace(/<rol>/g, rolId ? `<@&${rolId}>` : "__**ROL AYARLI DEĞİL**__")
                                    } else var atılacakMesajEkleme = `• <@${uye.id}> adlı üye tagımızı **( ${alınanTag.join(" - ")} )** aldı! Ona hoşgeldin diyelim! 🎉`
                                    a.channels.cache.get(kanalId).send({ content: atılacakMesajEkleme, allowedMentions: { roles: (rolId && ![rolId]), users: [uye.id] } }).catch(err => { })
                                }
                                db.yaz(id, tagrol, "tag rol", "diğerleri")
                            } else if ((eskidenTagVarMıydı || eskidenDisVarMıydı) && (!yeniTagVarMı && !yeniDisVarMı)) {
                                let date = Date.now()
                                    , alınanTarih = tagrol.kisi[uye.id]
                                    , rolId = tagrol.rol
                                    , kanalId = tagrol.kanal
                                    , toplamTaglı
                                    , alınanTag = []
                                    , rolhata
                                    , mesajhata
                                delete tagrol.kisi[uye.id]
                                if (eskidenTagVarMıydı) alınanTag.push(tag)
                                if (eskidenDisVarMıydı) alınanTag.push(`#${dis}`)
                                if (rolId) await uye.roles.remove(rolId).catch(err => { rolhata = err })
                                if (tagrol.dmesajk) await uye.send(tagrol.dmesajk.yazı.replace(/<sunucuAdı>/g, a.name).replace(/<tag>/g, alınanTag.join(" - ")).replace(/<üye>/g, `<@${uye.id}>`).replace(/<üyeTag>/g, newUser.tag).replace(/<üyeİsim>/g, newUser.username).replace(/<üyeI[dD]>/g, uye.id)).catch(err => { mesajhata = true })
                                if (tagrol.log) {
                                    let embedler = []
                                    toplamTaglı = (await c.getMembers({ guild: a })).filter(user => user.user.username.includes(tag) || user.user.discriminator == dis).size.toString()
                                    const pp = uye.displayAvatarURL()
                                    if (rolhata) {
                                        const embed2 = new EmbedBuilder()
                                            .setTitle("Hata")
                                            .setColor("Red")
                                            .setDescription(`• <@${uye.id}> adlı kişiye <@&${rolId}> adlı rolü alırken bir hata oluştu!`)
                                            .addFields({ name: "SEBEPLERİ", value: `• ${rolhata}` })
                                        embedler.push(embed2)
                                    }
                                    const bilgiler = [
                                        `**• Sunucuda toplam ${toplamTaglı} taglı üye bulunuyor** 🎉`,
                                        `\n**• Adı:**  <@${uye.id}> - ${uye.user.tag}`,
                                        `**• Bırakılan tag:**  ${alınanTag.join(" - ")}`,
                                        `**• Bırakılan tarih:**  <t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>\n`
                                    ]
                                    if (alınanTarih) bilgiler.push(`**• Tagı şu tarihte almıştı:**  <t:${(alınanTarih / 1000).toFixed(0)}:F> - <t:${(alınanTarih / 1000).toFixed(0)}:R>\n`)
                                    if (rolId) bilgiler.push(`**• Alınan rol:**  ${rolhata ? "Rol alınırken hata oluştu" : `<@&${rolId}>`}`)
                                    if (tagrol.dmesajk) bilgiler.push(`**• DM'den mesaj atıldı mı:**  ${mesajhata ? "DM'den mesaj atamadım, büyük ihtimalle DM'si kapalı" : "Evet atıldı"}`)
                                    const embed = new EmbedBuilder()
                                        .setAuthor({ name: uye.user.tag, iconURL: pp })
                                        .setTitle(`${ayarlar.emoji.sinirli} Tag bırakıldı :(`)
                                        .setDescription(bilgiler.join("\n"))
                                        .setColor(uye.displayHexColor ?? "#9e02e2")
                                        .setThumbnail(pp)
                                        .setTimestamp()
                                        .setFooter({ text: `${c.user.username} Log sistemi`, iconURL: c.user.displayAvatarURL() })
                                    embedler.push(embed)
                                    a.channels.cache.get(tagrol.log).send({ embeds: embedler }).catch(err => { })
                                }
                                if (kanalId) {
                                    if (tagrol.mesajk) {
                                        toplamTaglı = toplamTaglı ?? (await c.getMembers({ guild: a })).filter(user => user.user.username.includes(tag) || user.user.discriminator == dis).size.toString()
                                        var atılacakMesajEkleme = tagrol.mesajk.yazı
                                            .replace(/<tag>/g, alınanTag.join(" - "))
                                            .replace(/<toplam>/g, toplamTaglı)
                                            .replace(/<emojiToplam>/g, c.stringToEmojis(toplamTaglı))
                                            .replace(/<üye>/g, `<@${uye.id}>`)
                                            .replace(/<üyeTag>/g, newUser.tag)
                                            .replace(/<üyeİsim>/g, newUser.username)
                                            .replace(/<üyeI[dD]>/g, newUser.id)
                                            .replace(/<rol>/g, rolId ? `<@&${rolId}>` : "__**ROL AYARLI DEĞİL**__")
                                    } else var atılacakMesajEkleme = `• <@${uye.id}> adlı üye tagımızı **( ${alınanTag.join(" - ")} )** bıraktı... :(`
                                    a.channels.cache.get(kanalId).send({ content: atılacakMesajEkleme, allowedMentions: { roles: (rolId && ![rolId]), users: [uye.id] } }).catch(err => { })
                                }
                                db.yaz(id, tagrol, "tag rol", "diğerleri")
                            }
                        } catch (e) {
                            c.hook.send("**./kayit.js - (" + id + ")** adlı dosyamda tagrol ile ilgili bir hata var\n```js\n" + e + "```")
                            console.log(e)
                        }
                    }, { context: { id, tagrol, newUser: newUser.toJSON(), oldUser: oldUser.toJSON(), shard: +shardId } })
                } catch (e) {

                }
            })
        })
    }
}