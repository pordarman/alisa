const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "bot",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            if (int.client.butonsure.some(a => a == int.user.id)) return hata(`Heyyy dur bakalım orada! Zaten halihazırda bir kayıt işlemi gerçekleştiriyorsun!`)
            let prefix = sunucudb.prefix || "."
                , yetkilirolid = sunucudb.kayıt.yetkili
                , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has("Administrator")) return hata(`<@&${yetkilirolid}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has("Administrator")) return hata(`Yönetici`, "yetki")
            if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has("Administrator") ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
            if (!guildMe.permissions.has("ManageNicknames")) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            var botrolid = sunucudb.kayıt.bot
            if (!botrolid) return hata(`Bu sunucuda herhangi bir bot rolü __ayarlanmamış__${intMember.permissions.has("Administrator") ? `\n\n• Ayarlamak için **${prefix}bot-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            var kayıtsızrolid = sunucudb.kayıt.kayıtsız
            if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has("Administrator") ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            let rol = [...botrolid, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
            if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)"in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            var memberid = int.customId.replace(this.name, "")
            let member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu bot artık sunucuda değil şapşik şey seni :(")
            let sahipid = int.user.id
                , rolVarMı = true
            if (botrolid.some(a => member.roles.cache.has(a))) return hata("Kayıt etmek istediğiniz bot zaten daha önceden kayıt edilmiş")
            if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Kayıt etmek istediğiniz botun rolü benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let tag = sunucudb.kayıt.tag
                , kayıtisim = sunucudb.kayıt.isimler.kayıtbot
                , ismi
                , sadeceisim = member.user.username
            if (kayıtisim) ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, sadeceisim).slice(0, 32)
            else ismi = `${tag || ""}${sadeceisim}`.slice(0, 32)
            await member.edit({ roles: [...botrolid, ...member.roles.cache.filter(a => a.id != kayıtsızrolid).map(a => a.id)], nick: ismi }).then(async () => {
                let date = Date.now()
                    , kisivarmıdatabasede = alisa.kisiler[sahipid] || 0
                    , sunucuvarmıdatabasede = alisa.skullanımlar[sunucuid] || 0
                    , date2 = (date / 1000).toFixed(0)
                    , zaman = `<t:${date2}:F>`
                    , botrollerimapleme = botrolid.map(a => "<@&" + a + ">").join(", ")
                    , sahip = sunucudb.kayıtkisiler[sahipid] || {}
                    , kayıtsayısı = sahip.toplam || 0
                    , discordlogo = guild.iconURL()
                    , kişininfotografı = member.user.displayAvatarURL()
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: "Kayıt yapıldı", iconURL: discordlogo })
                        .addFields(
                            {
                                name: "`Kayıt yapan`",
                                value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ayarlar.ranklar[sahip.rank] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                                inline: true
                            },
                            {
                                name: "`Kayıt edilen`",
                                value: `> 👤 **Adı:** <@${memberid}>\n> 📝 **Yeni ismi:** \`${ismi}\`\n> ${ayarlar.emoji.rol} **Verilen rol(ler):** ${botrollerimapleme}`,
                                inline: true
                            }
                        )
                        .setThumbnail(kişininfotografı)
                        .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: int.client.user.displayAvatarURL() })
                        .setColor("#034aa2")
                        .setTimestamp()
                int.message.reply({ embeds: [embed] }).catch(err => { })
                kisivarmıdatabasede += 1
                alisa.kisiler[sahipid] = kisivarmıdatabasede
                sunucuvarmıdatabasede += 1
                alisa.skullanımlar[sunucuid] = sunucuvarmıdatabasede
                alisa.kullanımlar.bot.buton += 1
                sunucudb.son.unshift({ c: "🤖", s: sahipid, k: memberid, z: date2 })
                let logKanali = sunucudb.kayıt.log
                if (logKanali) {
                    const yapılanSeyler = [
                        `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                        `🧰 **KAYIT EDEN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Kayıt sayısı:**  ${kayıtsayısı} - ${sunucudb.kayıt.secenek ? `(${ayarlar.emoji.uye} ${sahip.normal || 0})` : `(${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`}`,
                        `**• Nasıl kayıt etti:**  Buton kullanarak`,
                        `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                        `\n👤 **KAYIT EDİLEN BOT**`,
                        `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                        `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Botta kayıtsız rolü yoktu"}`,
                        `**• Verilen rol(ler):**  ${botrollerimapleme}`,
                        `**• Yeni ismi:**  ${ismi}`,
                        `**• Kayıt şekli:**  Bot 🤖`
                    ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#034aa2")
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: int.client.user.displayAvatarURL() })
                        .setTimestamp()
                    guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
                }
                const toplamherkes = db.topla(sunucuid, 1, "kayıt toplam herkes", "diğerleri")
                if (toplamherkes % 1000 == 0) alisa.kayıtsayı[toplamherkes.toString()] = date
                const obje = { kk: "<@" + memberid + ">", r: botrollerimapleme, z: zaman }
                sahip.son = obje
                if (!sahip.ilk) sahip.ilk = obje
                const isimler = { c: "🤖", n: ismi, r: botrollerimapleme, s: sahipid, z: date2 }
                let kontrolisimler = sunucudb.kayıt[memberid]
                if (kontrolisimler) kontrolisimler.unshift(isimler)
                else sunucudb.isimler[memberid] = [isimler]
                sunucudb.kayıtkisiler[sahipid] = sahip
                db.yazdosya(alisa, "alisa", "diğerleri")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(async err => {
                if (err?.code == 10007) return hata(`<@${int.user.id}>, şeyyyy... Sanırım bu bot artık sunucuda değil şapşik şey seni :(`).catch(err => { })
                if (err?.code == 50013) return hata(`<@${memberid}> adlı botun ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                console.log(err)
                return hata("Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n" + err + "```").catch(err => { })
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }

    }
}