const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, Message } = require("discord.js")
const db = require("../modüller/database")
const cokHizliAfkSisteminiKullanıyor = {}
const cooldown = {}
const komutlarıCokHızlıKullanıyor = {}
const cooldowndigerleri = new Set()
const ayarlar = require("../ayarlar.json")
const Time = require("../modüller/time")
module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} msg 
     */
    async run(msg) {
        try {
            let guild = msg.guild
            if (msg.author.bot || !guild) return;
            let alisa = db.buldosya("alisa", "diğerleri")
            if (!alisa) return;
            let sahipid = msg.author.id
                , sunucudb = msg.client.s(guild.id)
                , sunucuafk = sunucudb.afk
                , msgMember
            if (Object.keys(sunucuafk).length) {
                let sahipvarmi = sunucuafk[sahipid]
                    , deneme = []
                if (sahipvarmi) {
                    delete sunucuafk[sahipid]
                    msgMember = msg.member
                    if (msgMember.nickname?.includes("[AFK]")) msgMember.setNickname(msgMember.nickname.replace(/\[AFK\] ?/g, "").trim(), "AFK modundan çıkış yaptı!").catch(err => { })
                    msg.reply({ content: `<@${sahipid}>, geri geldi! Artık AFK değil! Tam olarak __**${Time.duration({ ms: sahipvarmi.z * 1000, toNow: true })}**__ AFK idin!` }).then(a => setTimeout(async () => a.delete().catch(err => { }), 8000)).catch(err => { })
                }
                msg.mentions.members.forEach(a => {
                    const obje = sunucuafk[a.id]
                    if (obje) deneme.push(`‼️ Hey hey heyyy, <@${a.id}> adlı kişi **${obje.s || "Sebep belirtilmemiş"}** sebebinden AFK! • <t:${obje.z}:R>`)
                })
                if (deneme.length) {
                    let karaliste = alisa.kl[sahipid]
                    if (karaliste && (karaliste.sure ? karaliste.sure > Date.now() : true) && karaliste.z && !ayarlar.sahipler.includes(sahipid)) return;
                    let afksistem = cokHizliAfkSisteminiKullanıyor[sahipid] || { s: 0 }
                    afksistem.s += 1
                    if (afksistem.s > 4) {
                        let date = Date.now()
                            , onceden = karaliste?.kls
                            , ekstrasure
                            , sure
                            , obj
                        if (onceden && (onceden.sure ? onceden.sure > Date.now() - 2592000000 : true)) {
                            if (onceden.tekrar) onceden.tekrar += 1
                            else onceden.tekrar = 1
                            switch (onceden.tekrar) {
                                case 1:
                                    ekstrasure = 300000
                                    sure = `• Hey hey heyy <@${sahipid}>, botu çok fazla sıkıntıya sokuyorsun! Bi **5 dakika** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **5 dakikalığına** kara listeye alındı! - (Afk)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                                case 2:
                                    ekstrasure = 3600000
                                    sure = `• Hey hey heyy <@${sahipid}>, botu çok fazla sıkıntıya sokuyorsun! Bi **1 saat** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **1 saatliğine** kara listeye alındı! - (Afk)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                                case 3:
                                    ekstrasure = 86400000
                                    sure = `• Hey hey heyy <@${sahipid}>, botu çok fazla sıkıntıya sokuyorsun! __**Bu son uyarım!**__ Bi **1 gün** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **1 günlüğüne** kara listeye alındı! - (Afk)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                            }
                        } else {
                            onceden = { sure: Date.now() }
                            ekstrasure = 300000
                            sure = `• Hey hey heyy <@${sahipid}>, botu çok fazla sıkıntıya sokuyorsun! Bi **5 dakika** dinlen öyle dene istersen kendine gelirsin.`
                            obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **5 dakikalığına** kara listeye alındı! - (Afk)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                        }
                        msg.client.sendChannel(obj, "KANAL ID")
                        if (ekstrasure) karaliste = { z: (date / 1000).toFixed(0), s: "Afk sistemini çok hızlı kullandı!", sure: date + ekstrasure }
                        else {
                            alisa.kl[sahipid] = { z: (date / 1000).toFixed(0), s: "Afk sistemini çok hızlı kullandı!" }
                            msg.reply({ content: `• <@${sahipid}> maalesef botun kurallarını ihlal ederek kara listeye alındınız :(\n**• Eğer bir yanlış anlaşılma olduğunu düşünüyorsanız destek sunucuma gelip yardım isteyebilirsiniz**\n• ${ayarlar.discord}` }).catch(err => { })
                            db.yazdosya(alisa, "alisa", "diğerleri")
                            return;
                        }
                        karaliste.kls = onceden
                        alisa.kl[sahipid] = karaliste
                        msg.reply({ content: sure }).catch(err => { })
                        db.yazdosya(alisa, "alisa", "diğerleri")
                        return;
                    }
                    if (!afksistem.t) {
                        afksistem.t = setTimeout(() => {
                            let ikinciCokHizliAfkSisteminiKullanıyor = cokHizliAfkSisteminiKullanıyor[sahipid] || { s: 0 }
                            ikinciCokHizliAfkSisteminiKullanıyor.s -= 1
                            if (ikinciCokHizliAfkSisteminiKullanıyor.s < 0) ikinciCokHizliAfkSisteminiKullanıyor.s = 0
                            delete ikinciCokHizliAfkSisteminiKullanıyor.t
                            cokHizliAfkSisteminiKullanıyor[sahipid] = ikinciCokHizliAfkSisteminiKullanıyor
                        }, 750)
                    }
                    cokHizliAfkSisteminiKullanıyor[sahipid] = afksistem
                    msg.reply({ content: deneme.join("\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n"), allowedMentions: { users: false, repliedUser: true, roles: false } }).catch(err => { })
                }
                db.yaz("afk", sunucuafk, msg.guildId)
            }
            let prefix = sunucudb.prefix || "."
                , clientUserArray = [`<@${msg.client.user.id}>`, `<@!${msg.client.user.id}>`]
            if (clientUserArray.includes(msg.content.trim())) {
                let karaliste = alisa.kl[sahipid]
                if (karaliste && (karaliste.sure ? karaliste.sure > Date.now() : true) && karaliste.z && !ayarlar.sahipler.includes(sahipid)) {
                    if (karaliste.sure) return;
                    if (!karaliste.isSee) {
                        msg.reply({ content: `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek botun komutlarına erişim iznin kaldırıldı :(\n• Bundan sonra botun hiçbir komutlarına erişemeyeceksin...\n\n**• Bottan banlanma nedenin:**  __${karaliste.s}__\n\n**• Eğer bir hata yaptığımızı düşünüyorsan botun destek sunucusuna gelip neden ban yediğini sorgulayabilirsin**\n• ${ayarlar.discord}` }).then(() => {
                            karaliste.isSee = true
                            db.yazdosya(alisa, "alisa", "diğerleri")
                        }).catch(err => { })
                    }
                    return;
                }
                let pp = msg.client.user.displayAvatarURL()
                return msg.reply({ embeds: [new EmbedBuilder().setAuthor({ name: "Teşekkürler", iconURL: pp }).setDescription(`• Beni bu sunucuda **<t:${(msg.guild.members.me.joinedTimestamp / 1000).toFixed(0)}:F>** tarihinden beri kullandığınız için teşekkürler\n• Bu sunucudaki prefixim **${prefix}** veya <@${msg.client.user.id}>\n• Yardım menüsüne **${prefix}yardım** veya **<@${msg.client.user.id}>yardım** yazarak ulaşabilirsiniz\n• Eğer yardıma ihtiyacınız varsa **${prefix}destek** yazabilirsiniz`).setColor("Purple").setThumbnail(pp).setTimestamp().setFooter({ text: 'İyi ki varsınız <3', iconURL: guild.iconURL() })], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setURL(ayarlar.davet).setLabel("Beni davet et").setEmoji("💌")).addComponents(new ButtonBuilder().setEmoji("💗").setStyle(5).setURL(`https://top.gg/bot/${msg.client.user.id}/vote`).setLabel("Oy ver")).addComponents(new ButtonBuilder().setStyle(5).setURL(ayarlar.discord).setLabel("Destek sunucum").setEmoji("🎉"))] }).catch(err => { })
            }
            let baslıyormu = [prefix, ...clientUserArray].find(a => msg.content.toLocaleLowerCase().startsWith(a))
            if (baslıyormu) {
                let args = msg.content.slice(baslıyormu.length).trim().split(/\s+/)
                    , komut = msg.client.commands.get(args.shift().toLocaleLowerCase())
                if (!komut) return;
                let karaliste = alisa.kl[sahipid]
                if (karaliste && (karaliste.sure ? karaliste.sure > Date.now() : true) && karaliste.z && !ayarlar.sahipler.includes(sahipid)) {
                    if (karaliste.sure) return;
                    if (!karaliste.isSee) {
                        msg.reply({ content: `• Üzgünüm, botun __bazı__ kurallarını ihlal ederek botun komutlarına erişim iznin kaldırıldı :(\n• Bundan sonra botun hiçbir komutlarına erişemeyeceksin...\n\n**• Bottan banlanma nedenin:**  __${karaliste.s}__\n\n**• Eğer bir hata yaptığımızı düşünüyorsan botun destek sunucusuna gelip neden ban yediğini sorgulayabilirsin**\n• ${ayarlar.discord}` }).then(() => {
                            karaliste.isSee = true
                            db.yazdosya(alisa, "alisa", "diğerleri")
                        }).catch(err => { })
                    }
                    return;
                }
                const sahiplerVarMi = !ayarlar.sahipler.includes(sahipid)
                if (komut.no && sahiplerVarMi) return;
                let guildMe = msg.guild.members.me
                if (!guildMe.permissions.has("EmbedLinks")) return msg.reply("‼️ **Uyarı! Botu kullanabilmek için botun öncelikle `Bağlantı yerleştir` yetkisinin olması gerekir!**").catch(err => { })
                if (!alisa.kurallar.includes(sahipid)) {
                    alisa.kurallar.push(sahipid)
                    msg.channel.send({ embeds: [new EmbedBuilder().setColor("DarkBlue").setDescription(`${ayarlar.emoji.kurallar} Botun kuralları güncellendi. Okumak için butona tıkla.`)], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Kuralları oku").setEmoji(ayarlar.emoji.kurallar).setStyle(1).setCustomId("kurallar"))] }).then(a => setTimeout(() => a.delete().catch(err => { }), 60000)).catch(err => { })
                }
                let pre = db.bul(guild.id, "premium", "diğerleri")
                if (komut.pre && !pre && sahiplerVarMi) return msg.reply({ embeds: [new EmbedBuilder().setDescription(`• Şeyyyy... Bu komut sadece premium sunucularına özeldir :(\n\n• Eğer sizin de bir premiumunuz olsun istiyorsanız **Aylık sadece 10 TL** vererek botun bu muhteşem komutlarını sende kullanabilirsin. Daha fazla detay almak için **${prefix}pre** yazabilirsiniz`).setColor("Red")] }).then(m => setTimeout(() => m.delete().catch(err => { }), 15000)).catch(err => { })
                if (!komut.no) alisa.kullanımlar[komut.name].top += 1
                let kisivarmıdatabasede = alisa.kisiler[sahipid] || 0
                kisivarmıdatabasede += 1
                alisa.kisiler[sahipid] = kisivarmıdatabasede
                let sunucuvarmıdatabasede = alisa.skullanımlar[guild.id] || 0
                sunucuvarmıdatabasede += 1
                alisa.skullanımlar[guild.id] = sunucuvarmıdatabasede
                db.yazdosya(alisa, "alisa", "diğerleri")
                if (sahiplerVarMi) {
                    let komutSahip = komutlarıCokHızlıKullanıyor[sahipid] || { s: 0 }
                    komutSahip.s += 1
                    if (komutSahip.s > 4) {
                        let date = Date.now()
                            , onceden = karaliste?.kls
                            , ekstrasure
                            , sure
                        if (onceden && (onceden.sure ? onceden.sure > Date.now() - 2592000000 : true)) {
                            if (onceden.tekrar) onceden.tekrar += 1
                            else onceden.tekrar = 1
                            let obj
                            switch (onceden.tekrar) {
                                case 1:
                                    ekstrasure = 300000
                                    sure = `• Hey hey heyy <@${sahipid}>, botun komutlarını çok hızlı kullanarak botu çok fazla sıkıntıya sokuyorsun! Bi **5 dakika** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **5 dakikalığına** kara listeye alındı! - (Komut)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                                case 2:
                                    ekstrasure = 3600000
                                    sure = `• Hey hey heyy <@${sahipid}>, botun komutlarını çok hızlı kullanarak botu çok fazla sıkıntıya sokuyorsun! Bi **1 saat** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **1 saatliğine** kara listeye alındı! - (Komut)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                                case 3:
                                    ekstrasure = 43200000
                                    sure = `• Hey hey heyy <@${sahipid}>, botun komutlarını çok hızlı kullanarak botu çok fazla sıkıntıya sokuyorsun! Bi **12 saat** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **1 saatliğine** kara listeye alındı! - (Komut)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                                case 4:
                                    ekstrasure = 86400000
                                    sure = `• Hey hey heyy <@${sahipid}>, botun komutlarını çok hızlı kullanarak botu çok fazla sıkıntıya sokuyorsun! __**Bu son uyarım!**__ Bi **1 gün** dinlen öyle dene istersen kendine gelirsin.`
                                    obj = { content: `• <@${sahipid}> - **(${msg.author.tag})** adlı kişi **1 günlüğüne** kara listeye alındı! - (Komut)\n📅 **Bitiş tarihi:**  <t:${((date + ekstrasure) / 1000).toFixed(0)}:F> - <t:${((date + ekstrasure) / 1000).toFixed(0)}:R>` }
                                    break;
                            }
                            msg.client.channelSend(obj, "KANAL ID")
                        } else {
                            onceden = { sure: Date.now() }
                            alisa.kl[sahipid] = { kls: { sure: Date.now() }, s: "Komutları çok hızlı kullandı!" }
                            db.yazdosya(alisa, "alisa", "diğerleri")
                            if (!cooldowndigerleri.has("cokhizli" + sahipid)) msg.reply({ content: `‼️ Hey sen dur bakalım orada! Çok fazla __art arda__ komut kullanıyorsun, biraz yavaşla lütfen!` }).then(a => {
                                cooldowndigerleri.add("cokhizli" + sahipid)
                                setTimeout(() => {
                                    a.delete().catch(err => { })
                                    cooldowndigerleri.delete("cokhizli" + sahipid)
                                }, 5000)
                            }).catch(err => { })
                            return;
                        }
                        if (ekstrasure) karaliste = { z: (date / 1000).toFixed(0), s: "Komutları çok hızlı kullandı!", sure: date + ekstrasure }
                        else {
                            alisa.kl[sahipid] = { z: (date / 1000).toFixed(0), s: "Komutları çok hızlı kullandı!" }
                            db.yazdosya(alisa, "alisa", "diğerleri")
                            return msg.reply({ content: `• <@${sahipid}> maalesef botun kurallarını ihlal ederek kara listeye alındınız :(\n**• Eğer bir yanlış anlaşılma olduğunu düşünüyorsanız destek sunucuma gelip yardım isteyebilirsiniz**\n• ${ayarlar.discord}` }).catch(err => { })
                        }
                        karaliste.kls = onceden
                        alisa.kl[sahipid] = karaliste
                        db.yazdosya(alisa, "alisa", "diğerleri")
                        return msg.reply({ content: sure }).catch(err => { })
                    }
                    if (cooldowndigerleri.has(msg.channelId)) return msg.reply({ content: "⏰ **Lütfen komutları biraz daha yavaş kullanınız**" }).then(a => setTimeout(() => a.delete().catch(err => { }), 1500)).catch(err => { })
                    let simdikizaman = Date.now()
                        , kisivarmı = cooldown[komut.name + sahipid]
                        , komutsure = pre ? (komut.cooldown * 1000) : 1250
                    if (kisivarmı) {
                        let silmeşeysi = pre ? (kisivarmı - simdikizaman) / 1000 : 1.25
                        if (!cooldowndigerleri.has("yazma" + komut.name + sahipid)) return msg.reply({ content: `⌛ Bu komutu **${silmeşeysi.toFixed(2)} saniye** sonra kullanabilirsiniz.` }).then(a => {
                            cooldowndigerleri.add("yazma" + komut.name + sahipid)
                            setTimeout(() => {
                                a.delete().catch(err => { })
                                cooldowndigerleri.delete("yazma" + komut.name + sahipid)
                            }, silmeşeysi * 1000)
                        }).catch(err => { })
                        return;
                    }
                    if (!komutSahip.t) {
                        komutSahip.t = setTimeout(() => {
                            let ikinciKomutSahip = komutlarıCokHızlıKullanıyor[sahipid] || { s: 0 }
                            ikinciKomutSahip.s -= 1
                            if (ikinciKomutSahip.s < 0) ikinciKomutSahip.s = 0
                            delete ikinciKomutSahip.t
                            komutlarıCokHızlıKullanıyor[sahipid] = ikinciKomutSahip
                        }, 750)
                    }
                    komutlarıCokHızlıKullanıyor[sahipid] = komutSahip
                    cooldown[komut.name + sahipid] = simdikizaman + komutsure
                    cooldowndigerleri.add(msg.channelId)
                    setTimeout(() => delete cooldown[komut.name + sahipid], komutsure)
                    setTimeout(() => cooldowndigerleri.delete(msg.channelId), 1000)
                }
                async function hata(yazı, tip = "h", sure = 12500, { fileds, image = null } = {}) {
                    const embed = new EmbedBuilder().setTimestamp()
                    if (fileds) embed.addFields(...fileds)
                    if (image) embed.setImage(image)
                    switch (tip) {
                        case "yetki":
                            embed.setTitle("Hata").setDescription(`• Bu komutu kullanabilmek için **${yazı}** yetkisine sahip olmalısın şapşik şey seni :(`).setColor("Red")
                            break;
                        case "yetkibot":
                            embed.setTitle("Hata").setDescription(`• Bu komutu kullanabilmek için __benim__ **${yazı}** yetkisine sahip olmam lazım şapşik şey seni :(`).setColor("Red")
                            break;
                        case "h":
                            embed.setTitle("Hata").setDescription(`• ${yazı}`).setColor("Red")
                            break;
                        case "b":
                            if (yazı.includes("\n")) {
                                let split = yazı.split("\n")
                                yazı = `${split[0]} ${ayarlar.emoji.p}\n${split.slice(1).join("\n")}`
                            } else yazı += ` ${ayarlar.emoji.p}`
                            return msg.reply({ embeds: [embed.setTitle("Başarılı").setDescription(yazı).setColor("Green")] }).catch(err => { })
                        default:
                            embed.setTitle("Eksik komut").setDescription(`• ${yazı}`).setColor('Orange')
                            break;
                    }
                    return msg.reply({ embeds: [embed] }).then(a => setTimeout(() => a.delete().catch(err => { }), sure)).catch(err => { })
                }
                if (baslıyormu != prefix) msg["mentions"]["_members"] = msg.mentions.members.filter(a => a.id !== msg.client.user.id)
                try {
                    komut.run({ sunucudb, pre, alisa, msg, args, sunucuid: guild.id, prefix, hata, guild, msgMember: (msgMember || msg.member), guildMe })
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}