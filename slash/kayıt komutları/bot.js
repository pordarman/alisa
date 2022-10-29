const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "bot",
    data: new SlashCommandBuilder()
        .setName("bot")
        .setDescription("Botu kayıt et")
        .addUserOption(option => option.setName("üye").setDescription("botu etiketle").setRequired(true))
        .addStringOption(option => option.setName("isim").setDescription("ismini gir (isteğe bağlı)").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let prefix = sunucudb.prefix || "."
                , yetkilirolid = sunucudb.kayıt.yetkili
                , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has("Administrator")) return hata(`<@&${yetkilirolid}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has("Administrator")) return hata(`Yönetici`, "yetki")
            if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata('Rolleri Yönet', "yetkibot")
            if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            var botrolid = sunucudb.kayıt.bot
            if (!botrolid) return hata(`Bu sunucuda herhangi bir bot rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}bot-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            var kayıtsızrolid = sunucudb.kayıt.kayıtsız
            if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            let kayitkanal = sunucudb.kayıt.kanal
            if (!kayitkanal) return hata(`Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            if (int.channelId !== kayitkanal) return hata(`Lütfen kayıtları kayıt kanalı olan <#${kayitkanal}> kanalında yapınız`)
            let rol = [...botrolid, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position), rolVarMı = true
            if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            var member = int.options.getMember("üye", false)
            if (!member) return hata('Bot rolünü verebilmem için bir botu etiketlemelisiniz')
            if (!member.user.bot) return hata('Bot rolünü verebilmek için insan yerine bir botu etiketleyiniz')
            if (botrolid.some(a => member.roles.cache.has(a))) return hata('Etiketlediğiniz bot zaten daha önceden kayıt olmuş')
            if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
            if (member.id == int.client.user.id) return hata("K-kendimi nasıl kayıt edebilirim?")
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            const memberid = member.user.id
            const sahipid = int.user.id
            let tag = sunucudb.kayıt.tag, kayıtisim = sunucudb.kayıt.isimler.kayıtbot, yenisimi, sadeceisim = (int.options.getString("isim", false) || member.user.username)
            if (kayıtisim) yenisimi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, sadeceisim)
            else yenisimi = `${tag || ""}${sadeceisim}`
            if (yenisimi.length > 32) return hata('Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz')
            await member.edit({ roles: [...botrolid, ...member.roles.cache.filter(a => a.id != kayıtsızrolid).map(a => a.id)], nick: yenisimi }).then(async () => {
                let date = Date.now()
                    , date2 = (date / 1000).toFixed(0)
                    , zaman = `<t:${date2}:F>`
                    , verilecekRolString = botrolid.map(a => "<@&" + a + ">").join(", ")
                    , sahip = sunucudb.kayıtkisiler[sahipid] || {}
                    , kayıtsayısı = sahip.toplam || "0"
                    , ranklar = ayarlar.ranklar
                    , clientPp = int.client.user.displayAvatarURL()
                    , discordlogo = guild.iconURL()
                    , kişininfotografı = member.displayAvatarURL()
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: 'Kayıt yapıldı', iconURL: discordlogo })
                        .addFields(
                            {
                                name: '`Kayıt yapan`',
                                value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ranklar[sahip.rank] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                                inline: true
                            }
                            , {
                                name: '`Kayıt edilen`',
                                value: `> 👤 **Adı:** <@${memberid}>\n> 📝 **Yeni ismi:** \`${ismi}\`\n> ${ayarlar.emoji.rol}rilen rol(ler):** ${verilecekRolString}`,
                                inline: true
                            }
                        )
                        .setThumbnail(kişininfotografı)
                        .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: clientPp })
                        .setColor('#034aa2')
                        .setTimestamp()
                int.reply({ embeds: [embed] }).catch(err => { })
                let logKanali = sunucudb.kayıt.log
                sunucudb.son.unshift({ c: "🤖", s: sahipid, k: memberid, z: date2 })
                if (logKanali) {
                    const yapılanSeyler = [
                        `**• Sunucuda toplam ${sunucudb.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                        `🧰 **KAYIT EDEN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Kayıt sayısı:**  ${kayıtsayısı} - ${sunucudb.kayıt.secenek ? `(${ayarlar.emoji.uye} ${sahip.normal || 0})` : `(${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`}`,
                        `**• Nasıl kayıt etti:**  Komut kullanarak`,
                        `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                        `\n👤 **KAYIT EDİLEN BOT**`,
                        `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                        `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Botta kayıtsız rolü yoktu"}`,
                        `**• Verilen rol(ler):**  ${verilecekRolString}`,
                        `**• Yeni ismi:**  ${yenisimi}`,
                        `**• Kayıt şekli:**  Bot 🤖`
                    ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#034aa2")
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
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
                const isimler = { c: "🤖", n: yenisimi, r: verilecekRolString, s: sahipid, z: date2 }
                let isimlerkontrol = sunucudb.isimler[memberid]
                if (isimlerkontrol) isimlerkontrol.unshift(isimler)
                else sunucudb.isimler[memberid] = [isimler]
                sunucudb.kayıtkisiler[sahipid] = sahip
                db.yazdosya(sunucudb, sunucuid)
            }).catch(async err => {
                if (err?.code == 50013) return hata(`<@${memberid}> adlı botun ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                console.log(err)
                return hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}