const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    kod: ["sustur", "tempmute", "mute"],
    name: "mute",
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let muteYetkili = sunucudb.kayıt.mutey
            if (muteYetkili) {
                if (!msgMember.roles.cache.has(muteYetkili) && !msgMember.permissions.has('ModerateMembers')) return hata(`<@&${muteYetkili}> rolüne **veya** Üyelere zaman aşımı uygula`, "yetki")
            } else if (!msgMember.permissions.has('ModerateMembers')) return hata("Üyelere zaman aşımı uygula", "yetki")
            if (!guildMe.permissions.has("ModerateMembers")) return hata("Üyelere zaman aşımı uygula", "yetkibot")
            let j = args.join(" ")
            const member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (member.user.bot) return hata("Botları susturamayacağını biliyorsun değil mi?")
            if (member.user.id == msg.author.id) return hata("Kendine mute atamazsın şapşik şey seni :)")
            if (member.user.id == guild.ownerId) return hata("Sunucu sahibine mute atamazsın şapşik şey seni :)")
            if (member.permissions.has("Administrator")) return hata(`Şeyyy... **Yönetici** yetkisine sahip birisini susturamazsın şapşik şey seni :(`)
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let sure = 0
                , sebep = j
                , saniye = sebep.match(msg.client.regex.getSeconds)
                , dakika = sebep.match(msg.client.regex.getMinutes)
                , saat = sebep.match(msg.client.regex.getHours)
                , gün = sebep.match(msg.client.regex.getDays)
            if (saniye) saniye.forEach(sn => sure += sn * 1000)
            if (dakika) dakika.forEach(sn => sure += sn * 60000)
            if (saat) saat.forEach(sn => sure += sn * 3600000)
            if (gün) gün.forEach(sn => sure += sn * 86400000)
            if (!sure) return hata(`Lütfen bir süre giriniz\n\n**Örnek**\n• ${prefix}mute <@${member.id}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n• ${prefix}mute <@${member.id}> 30 dakika`, "h", 20000)
            else if (sure < 1000 || sure > 2332800000) return hata(`Lütfen en az 1 saniye en fazla 27 gün arasında bir zaman giriniz`)
            let durationSure = Time.duration({ ms: sure, skipZeros: true })
            sebep = j.replace(/(?<!\d)\d{1,3} ?(saniye|d?akika|saat|g[üu]n|sn|s|m|dk|h|d)/gi, "").replace(new RegExp(`<@!?${member.id}>|${member.id}`, "g"), "").replace(/ +/, " ").trim() || "Sebep belirtilmemiş"
            await member.timeout(sure, `Mute atan yetkili: ${msg.author.tag} | Süre: ${durationSure} | Sebebi: ${sebep}`).then(() => {
                msg.reply({ content: `• <@${member.id}> adlı kişi **${durationSure}** boyunca __**${sebep}**__ sebebinden yazı ve ses kanallarından men edildi! **Ceza numarası:** \`#${sunucudb.sc.sayı}\``, allowedMentions: { users: [member.id], repliedUser: true } }).then(message => {
                    let sunucumute = db.bul(sunucuid, "mute", "diğerleri") || {}
                    sunucumute[member.id] = { s: Date.now() + sure, m: message.id, a: msg.author.id, k: msg.channelId }
                    let modLog = sunucudb.kayıt.modl
                    if (modLog) {
                        let date = (Date.now() / 1000).toFixed(0)
                            , date2 = ((Date.now() + sure) / 1000).toFixed(0)
                            , kişininfotografı = member.user.displayAvatarURL()
                            , array = [
                                `**🔇 <@${member.id}> adlı üye __geçici__ olarak susturuldu**`,
                                `\n🧰 **SUSTURAN YETKİLİ**`,
                                `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                                `**• Susturma tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                                `\n👤 **SUSTURULAN ÜYE**`,
                                `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                                `**• Susturulma sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                                `**• Susturulma süresi:**  ${durationSure}`,
                                `**• Susturulmanın açılacağı tarih:**  <t:${date2}:F> - <t:${date2}:R>`,
                                `**• Ceza numarası:**  \`#${sunucudb.sc.sayı}\``
                            ]
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                            .setDescription(array.join("\n"))
                            .setThumbnail(kişininfotografı)
                            .setColor("#b90ebf")
                            .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                            .setTimestamp()
                        guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                    }
                    db.yaz(sunucuid, sunucumute, "mute", "diğerleri")
                    let kl = sunucudb.kl[member.id] || []
                    kl.unshift({ type: "mute", time: sure, author: msg.author.id, timestamp: Date.now(), number: sunucudb.sc.sayı })
                    sunucudb.kl[member.id] = kl
                    sunucudb.sc.sayı += 1
                    db.yazdosya(sunucudb, sunucuid)
                    Time.setTimeout(() => {
                        let sunucumute = db.bul(sunucuid, "mute", "diğerleri") || {}
                        if (!sunucumute[member.id]) return;
                        message?.reply({ content: `• <@${member.id}> adlı kişinin susturulması başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } })?.catch(err => { })
                        let kl = msg.client.s(sunucuid).kl[member.id] || []
                        kl.unshift({ type: "unmute", author: msg.author.id, timestamp: Date.now() })
                        sunucudb.kl[member.id] = kl
                        delete sunucumute[member.id]
                        let modLog = sunucudb.kayıt.modl
                        if (modLog) {
                            let date = (Date.now() / 1000).toFixed(0)
                                , kişininfotografı = member.displayAvatarURL()
                                , array = [
                                    `**🔊 <@${member.id}> adlı üyenin susturulması kaldırıldı**`,
                                    `\n🧰 **SUSTURMAYI AÇAN YETKİLİ**`,
                                    `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                                    `\n👤 **SUSTURULMASI AÇILAN ÜYE**`,
                                    `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                                    `**• Açıldığı tarih:**  <t:${date}:F> - <t:${date}:R>`,
                                ]
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                                .setDescription(array.join("\n"))
                                .setThumbnail(kişininfotografı)
                                .setColor("#b90ebf")
                                .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                                .setTimestamp()
                            guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                        }
                        db.yazdosya(sunucudb, sunucuid)
                        db.yaz(sunucuid, sunucumute, "mute", "diğerleri")
                        return;
                    }, sure)
                }).catch(err => { })
            }).catch(err => {
                if (err?.code == 50013) return msg.reply(`• <@${member.id}> adlı kişiyi susturmaya yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                console.log(err)
                msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}