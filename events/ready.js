const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, Client, WebhookClient } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
const Time = require("../modüller/time")
const DiscordVoice = require('@discordjs/voice')
const { REST } = require('@discordjs/rest')
const { Routes } = require("discord-api-types/v10")
module.exports = {
    name: "ready",
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {

        // Gerekli fonksiyonlar
        function ses() {
            Object.entries(db.buldosya("ses", "diğerleri")).filter(([guildId]) => client.shardId(guildId) == client.shard.ids[0]).forEach(([guildId, channelId]) => {
                const sunucu = client.guilds.cache.get(guildId)
                if (sunucu) {
                    let me = sunucu.members.me
                    if (me && !me.voice.channelId) {
                        const kanal = sunucu.channels.cache.get(channelId)
                        if (kanal) DiscordVoice.joinVoiceChannel({ channelId: kanal.id, guildId: sunucu.id, adapterCreator: sunucu.voiceAdapterCreator })
                    }
                }
            })
        }
        async function fetchMessage(channel, messageId, authorId = null) {
            let message = channel.messages.cache.get(messageId)
            if (message) return message
            let justMessages = await channel.messages.fetch({ message: messageId }).catch(err => { })
            if (justMessages) return justMessages
            let channelMessages = await channel.messages.fetch().catch(err => { })
            if (!channelMessages) return null
            message = channelMessages.get(messageId)
            if (message) return message
            message = channelMessages.find(a => a.author.id == authorId)
            return (message || null)
        }

        // Sunuculardaki rolleri ve kanalları kontrol etme
        // Eğer bot kapalıyken kayıtlı bir rol veya kanal silindiyse bunu sunucu sahibine ilet ve kayıtlı olan rolün verisini sil
        let rest = new REST({ version: '10' }).setToken(client.token)
            , tagroldb = db.buldosya("tag rol", "diğerleri")
            , dosyatempjail = db.buldosya("tempjail", "diğerleri")
            , alisa = db.buldosya("alisa", "diğerleri")
        client.guilds.cache.forEach(async (a, id) => {
            if (alisa.klserver.includes(id)) return a.leave()
            let guildDatabase = db.buldosya(id)
                , hatalar = []
                , tagrolguildDatabase = tagroldb[id] || { kisi: {}, tag: (guildDatabase.kayıt.tag ? guildDatabase.kayıt.tag.slice(0, -1) : undefined) }
                , kayıtsız = guildDatabase.kayıt.kayıtsız
                , yetkili = guildDatabase.kayıt.yetkili
                , erkekRol = guildDatabase.kayıt.erkek || []
                , erkekRolFilter = erkekRol.filter(role => a.roles.cache.has(role))
                , kızRol = guildDatabase.kayıt.kız || []
                , kızRolFilter = kızRol.filter(role => a.roles.cache.has(role))
                , kayıtRol = guildDatabase.kayıt.normal || []
                , kayıtRolFilter = kayıtRol.filter(role => a.roles.cache.has(role))
                , botRol = guildDatabase.kayıt.bot || []
                , botRolFilter = botRol.filter(role => a.roles.cache.has(role))
                , yetkiliRol = guildDatabase.premium.yetkili || []
                , yetkiliRolFilter = yetkiliRol.filter(role => a.roles.cache.has(role))
                , partnerRol = guildDatabase.premium.partner
                , kayıtKanal = guildDatabase.kayıt.kanal
                , kayıtGunluk = guildDatabase.kayıt.günlük
                , kayıtLog = guildDatabase.kayıt.log
                , modLog = guildDatabase.kayıt.modl
                , tagrolRol = tagrolguildDatabase.rol
                , tagrolKanal = tagrolguildDatabase.kanal
                , tagrolLog = tagrolguildDatabase.log
                , jailRol = guildDatabase.jail.rol
                , jailYetkili = guildDatabase.jail.yetkili
                , jailLog = guildDatabase.jail.log
                , vipRol = guildDatabase.kayıt.vrol
                , vipYetkili = guildDatabase.kayıt.vyetkili
                , banYetkili = guildDatabase.kayıt.bany
                , kickYetkili = guildDatabase.kayıt.kicky
            if (kayıtsız && !a.roles.cache.has(kayıtsız)) {
                delete guildDatabase.kayıt.kayıtsız
                hatalar.push('Kayıtsız rolü')
            }
            if (yetkili && !a.roles.cache.has(yetkili)) {
                delete guildDatabase.kayıt.yetkili
                hatalar.push('Yetkili rolü')
            }
            if (erkekRolFilter.length < erkekRol.length) {
                if (erkekRolFilter.length) {
                    guildDatabase.kayıt.erkek = erkekRolFilter
                    hatalar.push('Erkek rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.erkek
                    hatalar.push('Erkek rollerinin hepsi')
                }
            }
            if (kızRolFilter.length < kızRol.length) {
                if (kızRolFilter.length) {
                    guildDatabase.kayıt.kız = kızRolFilter
                    hatalar.push('Kız rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.kız
                    hatalar.push('Kız rollerinin hepsi')
                }
            }
            if (kayıtRolFilter.length < kayıtRol.length) {
                if (kayıtRolFilter.length) {
                    guildDatabase.kayıt.normal = kayıtRolFilter
                    hatalar.push('Üye rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.normal
                    hatalar.push('Üye rollerinin hepsi')
                }
            }
            if (botRolFilter.length < botRol.length) {
                if (botRolFilter.length) {
                    guildDatabase.kayıt.bot = botRolFilter
                    hatalar.push('Bot rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.bot
                    hatalar.push('Bot rollerinin hepsi')
                }
            }
            if (yetkiliRolFilter.length != yetkiliRol.length) {
                if (yetkiliRolFilter.length) {
                    guildDatabase.premium.yetkili = yetkiliRolFilter
                    hatalar.push('Yetkili rollerinden bazıları')
                } else {
                    delete guildDatabase.premium.yetkili
                    hatalar.push('Yetkili rollerinin hepsi')
                }
            }
            if (partnerRol && !a.roles.cache.has(partnerRol)) {
                delete guildDatabase.premium.partner
                hatalar.push('Partner rolü')
            }
            if (kayıtKanal && !a.channels.cache.has(kayıtKanal)) {
                delete guildDatabase.kayıt.kanal
                hatalar.push('Kayıt kanalı')
            }
            if (kayıtGunluk && !a.channels.cache.has(kayıtGunluk)) {
                delete guildDatabase.kayıt.günlük
                hatalar.push('Kayıt günlük kanalı')
            }
            if (kayıtLog && !a.channels.cache.has(kayıtLog)) {
                delete guildDatabase.kayıt.log
                hatalar.push('Kayıt log kanalı')
            }
            if (modLog && !a.channels.cache.has(modLog)) {
                delete guildDatabase.kayıt.modl
                hatalar.push('Moderasyon log kanalı')
            }
            if (tagrolRol && !a.roles.cache.has(tagrolRol)) {
                delete tagrolguildDatabase.rol
                hatalar.push('Tagrol rolü')
            }
            if (tagrolKanal && !a.channels.cache.has(tagrolKanal)) {
                delete tagrolguildDatabase.kanal
                hatalar.push('Tagrol kanalı')
            }
            if (tagrolLog && !a.channels.cache.has(tagrolLog)) {
                delete tagrolguildDatabase.log
                hatalar.push('Tagrol log kanalı')
            }
            if (jailRol && !a.roles.cache.has(jailRol)) {
                delete guildDatabase.jail.rol
                hatalar.push('Jail rolü')
            }
            if (jailYetkili && !a.roles.cache.has(jailYetkili)) {
                delete guildDatabase.jail.yetkili
                hatalar.push('Jail yetkili rolü')
            }
            if (jailLog && !a.channels.cache.has(jailLog)) {
                delete guildDatabase.jail.log
                hatalar.push('Jail log kanalı')
            }
            if (vipRol && !a.roles.cache.has(vipRol)) {
                delete guildDatabase.kayıt.vrol
                hatalar.push('Vip rolü')
            }
            if (vipYetkili && !a.roles.cache.has(vipYetkili)) {
                delete guildDatabase.kayıt.vyetkili
                hatalar.push('Vip yetkili rolü')
            }
            if (banYetkili && !a.roles.cache.has(banYetkili)) {
                delete guildDatabase.kayıt.bany
                hatalar.push('Ban yetkili rolü')
            }
            if (kickYetkili && !a.roles.cache.has(kickYetkili)) {
                delete guildDatabase.kayıt.kicky
                hatalar.push('Kick yetkili rolü')
            }
            if (hatalar.length) {
                hatalar = hatalar.join(", ")
                let lastindex = hatalar.lastIndexOf(",")
                    , hat
                if (lastindex == -1) hat = hatalar
                else hat = hatalar.slice(0, lastindex) + " ve " + hatalar.slice(lastindex + 2)
                const embed = new EmbedBuilder()
                    .setTitle('Bilgilendirme')
                    .setDescription(`• **${a.name} - (${a.id})** sunucusundaki kayıtlı olan __${hat}__ silinmiştir. Lütfen başka bir rol veya kanal ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                (await client.fetchUserForce(a.ownerId))?.send({ embeds: [embed] }).catch(err => { });
                db.yazdosya(guildDatabase, id)
                tagroldb[id] = tagrolguildDatabase
                db.yaz(id, tagrolguildDatabase, "tag rol", "diğerleri")
            }

            // Slash komutlarını yükleme
            ; (async () => {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(client.user.id, id),
                        { body: client.slash.commands },
                    ).catch(err => { });
                } catch (error) {
                    console.error(error);
                }
            })();

            // Süreli jaile atılan kişilerin süresinin bitip bitmediğini kontrol etme
            let tempjailsunucu = dosyatempjail[id]
                , rol = guildDatabase.jail.rol
            if (tempjailsunucu && rol) {
                Object.entries(tempjailsunucu).forEach(async ([memberId, object]) => {
                    const uye1 = await client.fetchMemberForce(memberId, { guild: a })
                    if (!uye1) delete tempjailsunucu[memberId]
                    else {
                        let sure = object.d + object.s - Date.now()
                        if (sure < 1) sure = 1
                        Time.setTimeout(async () => {
                            const uye = await client.fetchMemberForce(memberId, { guild: a })
                            if (!uye) return delete tempjailsunucu[memberId]
                            let dosya = db.bul(id, "tempjail", "diğerleri") || {}
                            if (dosya[uye.id]?.d != tempjailsunucu[uye.id]?.d) return;
                            delete tempjailsunucu[uye.id]
                            dosyatempjail[id] = tempjailsunucu
                            let kanal = a.channels.cache.get(object.idler.c)
                                , jailDb = db.bul(id, "jail", "diğerleri") || {}
                            await uye.edit({ roles: (jailDb[uye.id] ? jailDb[uye.id].filter(b => a.roles.cache.has(b)) : uye.roles.cache.filter(b => b.id != rol).map(b => b.id)) }).then(async () => {
                                let date3 = Date.now()
                                    , sahip = await client.fetchUserForce(object.idler.s)
                                    , obje = { y: sahip.id, z: date3, sure: "⏰", bool: false }
                                    , kisi = guildDatabase.jail.kisi[uye.id] || []
                                    , kl = guildDatabase.kl[uye.id] || []
                                kl.unshift({ type: "tj", c: false, author: sahip.id, timestamp: date3 })
                                guildDatabase.kl[uye.id] = kl
                                kisi.unshift(obje)
                                guildDatabase.jail.kisi[uye.id] = kisi
                                guildDatabase.jail.son.unshift({ s: sahip.id, k: uye.id, z: date3, sure: "⏰", bool: false })
                                db.yazdosya(guildDatabase, id)
                                if (object.idler.m) {
                                    let mesaj = await fetchMessage(kanal, object.idler.m)
                                    if (mesaj) mesaj.reply({ content: `• <@${uye.id}> adlı kişinin jail rolü başarıyla kaldırıldı!`, allowedMentions: { users: [uye.id], repliedUser: true } })?.catch(err => { })
                                }
                                let log = guildDatabase.jail.log
                                if (log) {
                                    let pp = uye.displayAvatarURL()
                                        , zaman = `<t:${(object.d / 1000).toFixed(0)}:F> - <t:${(object.d / 1000).toFixed(0)}:R>`
                                        , date2 = (date3 / 1000).toFixed(0)
                                        , yapılanSeyler = [
                                            `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**`,
                                            `**• Adı:**  <@${sahip.id}> - ${sahip.tag}`,
                                            `**• Jail'den çıkarılma zamanı:**  <t:${date2}:F> - <t:${date2}:R>`,
                                            `\n👤 **JAIL'DEN ÇIKARILAN KİŞİ**`,
                                            `**• Adı:**  <@${uye.id}> - ${uye.user.tag}`,
                                            `**• Alınan rol:**  <@&${rol}>`,
                                            `**• Sebebi:**  ${object.se || "Sebep belirtilmemiş"}`,
                                            `**• Jail'e atılma zamanı:**  ${zaman}`,
                                            `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                                        ]
                                    const embed = new EmbedBuilder()
                                        .setAuthor({ name: uye.user.tag, iconURL: pp })
                                        .setDescription(yapılanSeyler.join("\n"))
                                        .setThumbnail(pp)
                                        .setColor("#af0003")
                                        .setFooter({ text: `${client.user.username} Log sistemi`, iconURL: client.user.displayAvatarURL() })
                                        .setTimestamp()
                                    a.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                                }
                                db.yaz(id, tempjailsunucu, "tempjail", "diğerleri")
                            }).catch(err => {
                                return kanal?.send({ embeds: [new EmbedBuilder().setTitle("Hata").setDescription(`**• <@${uye.id}> adlı kişinin rollerini düzenlerken bir hata oluştu! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n• ${err}`).setColor("Red").setTimestamp()] }).catch(err => { })
                            })
                        }, sure)
                    }
                })
            }
            if (guildDatabase.kayıt.secenek) client.secenek.add(id)
            if (guildDatabase.kayıt.özel) guildDatabase.kayıt.özel.yazı = guildDatabase.kayıt.özel.yazı.replace(/<sayı>/g, "<toplam>").replace(/<emojiSayı>/g, "<emojiToplam>")
            client.guildDatabase[id] = guildDatabase
            if (!tagroldb[id]) tagroldb[id] = { kisi: {}, tag: (guildDatabase.kayıt.tag ? guildDatabase.kayıt.tag.slice(0, -1) : undefined) }
        })
        
        // Ses kanallarını kontrol etme
        // Eğer bot ayarlanmış bir ses kanalından bir hata ile çıkarsa ses kanalına tekrar girer
        const FIVE_MINUTE = 1000 * 60 * 5
        setInterval(() => ses(), FIVE_MINUTE);
        ses()

        // Muteli kişileri kontrol etme
        let mute = db.buldosya("mute", "diğerleri")
        Object.entries(mute).forEach(async ([guildId, object]) => {
            Object.entries(object).forEach(async ([memberId, objectMember]) => {
                let gonderilcekMesaj = `• <@${memberId}> adlı kişinin susturulması başarıyla kaldırıldı!`
                if (objectMember.s < Date.now()) {
                    const kanal = client.channels.cache.get(objectMember.k)
                    if (!kanal) return;
                    let guildDatabase = client.guildDatabase(kanal.guildId)
                        , kl = guildDatabase.kl[memberId] || []
                    kl.unshift({ type: "unmute", author: objectMember.a, timestamp: Date.now() })
                    guildDatabase.kl[memberId] = kl
                    db.yazdosya(guildDatabase, kanal.guildId)
                    let mesaj = await fetchMessage(kanal, objectMember.m)
                    if (mesaj) mesaj.reply(gonderilcekMesaj).catch(err => { })
                    else kanal?.send(gonderilcekMesaj).catch(err => { })
                    delete mute[guildId][memberId]
                    let modLog = guildDatabase.kayıt.modl
                    if (modLog) {
                        let date = (Date.now() / 1000).toFixed(0)
                            , author = (await client.fetchUserForce(objectMember.a))
                            , member = (await client.fetchUserForce(memberId))
                            , kişininfotografı = member.displayAvatarURL()
                            , array = [
                                `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**`,
                                `\n🧰 **SUSTURMAYI AÇAN YETKİLİ**`,
                                `**• Adı:**  <@${author.id}> - ${author.tag}`,
                                `**• Susturmayı açtığı tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                                `\n👤 **SUSTURULMASI AÇILAN ÜYE**`,
                                `**• Adı:**  <@${memberId}> - ${member.tag}`
                            ]
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: member.tag, iconURL: kişininfotografı })
                            .setDescription(array.join("\n"))
                            .setThumbnail(kişininfotografı)
                            .setColor("#b90ebf")
                            .setFooter({ text: `${client.user.username} Log sistemi`, iconURL: client.user.displayAvatarURL() })
                            .setTimestamp()
                        kanal.guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                    }
                    return db.yazdosya(mute, "mute", "diğerleri")
                }
                const kanal = client.channels.cache.get(objectMember.k)
                if (!kanal) return;
                Time.setTimeout(async () => {
                    let guildDatabase = client.guildDatabase(kanal.guildId)
                        , kl = guildDatabase.kl[memberId] || []
                    kl.unshift({ type: "unmute", author: objectMember.a, timestamp: Date.now() })
                    guildDatabase.kl[memberId] = kl
                    db.yazdosya(guildDatabase, kanal.guildId)
                    const mesaj = await fetchMessage(kanal, objectMember.m)
                    if (mesaj) mesaj.reply(gonderilcekMesaj).catch(err => { })
                    else kanal?.send(gonderilcekMesaj).catch(err => { })
                    delete mute[guildId][memberId]
                    let modLog = guildDatabase.kayıt.modl
                    if (modLog) {
                        let date = (Date.now() / 1000).toFixed(0)
                            , author = (await client.fetchUserForce(objectMember.a))
                            , member = (await client.fetchUserForce(memberId))
                            , kişininfotografı = member.displayAvatarURL()
                            , array = [
                                `**🔊 <@${memberId}> adlı üyenin susturulması kaldırıldı**`,
                                `\n🧰 **SUSTURMAYI AÇAN YETKİLİ**`,
                                `**• Adı:**  <@${author.id}> - ${author.tag}`,
                                `**• Susturmayı açtığı tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                                `\n👤 **SUSTURULMASI AÇILAN ÜYE**`,
                                `**• Adı:**  <@${memberId}> - ${member.tag}`
                            ]
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: member.tag, iconURL: kişininfotografı })
                            .setDescription(array.join("\n"))
                            .setThumbnail(kişininfotografı)
                            .setColor("#b90ebf")
                            .setFooter({ text: `${client.user.username} Log sistemi`, iconURL: client.user.displayAvatarURL() })
                            .setTimestamp()
                        kanal.guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                    }
                    return db.yazdosya(mute, "mute", "diğerleri")
                }, objectMember.s - Date.now())
            })
        })
        db.yazdosya(mute, "mute", "diğerleri")

        let premiumDosya = db.buldosya("premium", "diğerleri")

        // Butonla kayıt edilen kişileri kontrol etme
        let buttons = db.buldosya("buton", "diğerleri")
        Object.entries(buttons).filter(a => client.shardId(a[0]) == client.shard.ids[0]).forEach(async ([guildId, object]) => {
            Object.entries(object).forEach(async ([memberid, objectMember]) => {
                if (objectMember.d < Date.now() - 60000) return delete buttons[guildId][memberid]
                const kanal = client.channels.cache.get(objectMember.k)
                if (!kanal) return delete buttons[guildId][memberid];
                let guildDatabase = client.guildDatabase(guildId)
                const mesaj = (await fetchMessage(kanal, objectMember.id, objectMember.sahip))
                if (!mesaj) return delete buttons[guildId][memberid]
                let guild = client.guilds.cache.get(guildId)
                if (!guild) return delete buttons[guildId][memberid]
                client.buttonCooldown.set(memberid + guildId, objectMember.sahip)
                client.buttons.get(objectMember.t).run({ int: mesaj, guildDatabase, pre: premiumDosya[guildId], alisa, hata: () => { }, sonradan: objectMember, guild, guildId: guildId })
            })
        })
        Object.entries(buttons).filter(([id, value]) => Object.keys(value).length == 0).forEach(([id]) => delete buttons[id])
        db.yazdosya(buttons, "buton", "diğerleri")

        // Premium sürelerini kontrol etme
        Object.entries(premiumDosya).filter(a => a[1].expiresTimestamp && a[0].search(/\s/) == -1).forEach(async ([guildId, object]) => {
            Time.setTimeout(async () => {
                let dosya = db.buldosya("premium", "diğerleri")
                    , isim = guildId + " - " + Date.now()
                dosya[isim] = dosya[guildId]
                delete dosya[guildId]
                db.yazdosya(dosya, "premium", "diğerleri")
                    , kisi = await client.fetchUserForce(object.author)
                kisi.send(`• Heyy bakıyorum ki ${await client.getGuildNameOrId(guildId)} sunucunun premiumu bitmiş gibi görünüyor :(\n\n• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n• ${ayarlar.discord}`).catch(err => { })
                    ; (await client.fetchUserForce(ayarlar.sahip)).send(`**> PREMİUM BİLGİLENDİRME**\n\n• **${client.guilds.cache.get(guildId)?.name || "❓ Bilinmeyen sunucu"} - (${guildId})** sunucunun premium'u bitmiştir.\n• **Satın alan kişi:** <@${kisi.id}> - ${kisi.tag}\n• **Kullandığı süre:** ${Time.duration(object.totalTime)}`).catch(err => { })
                let guildDatabase = client.guildDatabase(guildId)
                    , tagroldb = client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
                    , object = { kayıt: { yassinir: guildDatabase.kayıt.yassinir }, premium: guildDatabase.premium, tagrol: { dmesaje: tagroldb.dmesaje, dmesajk: tagroldb.dmesajk, mesaje: tagroldb.mesaje, mesajk: tagroldb.mesajk } }
                guildDatabase.premium = {}
                delete guildDatabase.kayıt.yassinir
                delete tagroldb.dmesaje
                delete tagroldb.dmesajk
                delete tagroldb.mesaje
                delete tagroldb.mesajk
                db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                db.yazdosya(guildDatabase, guildId)
                db.yaz(guildId, object, "premium database", "diğerleri")
            }, object.expiresTimestamp - Date.now())
        })

        // Bunlar da bot yeniden başlatıldığında komutların aksamamasını sağlar
        Object.entries(db.buldosya("tagrol mesaj", "diğerleri")).filter(([guildId]) => client.shardId(guildId) == client.shard.ids[0]).forEach(async ([guildId, object]) => {
            if (object.date < Date.now() - 480000) return db.sil(guildId, "tagrol mesaj", "diğerleri")
            const kanal = client.channels.cache.get(object.channelId)
            if (!kanal) return db.sil(guildId, "tagrol mesaj", "diğerleri")
            let guildDatabase = client.guildDatabase(guildId)
            const mesaj = (await fetchMessage(kanal, object.messageId, object.authorId))
            if (!mesaj) return db.sil(guildId, "tagrol mesaj", "diğerleri")
            let guild = client.guilds.cache.get(guildId)
            if (!guild) return db.sil(guildId, "tagrol mesaj", "diğerleri")
            client.commands.get("tagrol-mesaj").run({ guildDatabase, pre: premiumDosya[guildId], alisa, msg: mesaj, args: [], guildId: guildId, hata: () => { }, prefix: (guildDatabase.prefix || ayarlar.prefix), sonradan: true, guild, msgMember: mesaj.member, guildMe: guild.members.me })
        })
        Object.entries(db.buldosya("gözel", "diğerleri")).filter(([guildId]) => client.shardId(guildId) == client.shard.ids[0]).forEach(async ([guildId, object]) => {
            if (object.date < Date.now() - 480000) return db.sil(guildId, "gözel", "diğerleri")
            const kanal = client.channels.cache.get(object.channelId)
            if (!kanal) return db.sil(guildId, "gözel", "diğerleri")
            let guildDatabase = client.guildDatabase(guildId)
            const mesaj = (await fetchMessage(kanal, object.messageId, object.authorId))
            if (!mesaj) return db.sil(guildId, "gözel", "diğerleri")
            let guild = client.guilds.cache.get(guildId)
            if (!guild) return db.sil(guildId, "gözel", "diğerleri")
            client.commands.get("gözel").run({ guildDatabase, pre: premiumDosya[guildId], alisa, msg: mesaj, args: [], guildId: guildId, hata: () => { }, prefix: (guildDatabase.prefix || ayarlar.prefix), sonradan: true, guild, msgMember: mesaj.member, guildMe: guild.members.me })
        })
        Object.entries(db.buldosya("özel", "diğerleri")).filter(([guildId]) => client.shardId(guildId) == client.shard.ids[0]).forEach(async ([guildId, object]) => {
            if (object.date < Date.now() - 480000) return db.sil(guildId, "özel", "diğerleri")
            const kanal = client.channels.cache.get(object.channelId)
            if (!kanal) return db.sil(guildId, "özel", "diğerleri")
            let guildDatabase = client.guildDatabase(guildId)
            const mesaj = (await fetchMessage(kanal, object.messageId, object.authorId))
            if (!mesaj) return db.sil(guildId, "özel", "diğerleri")
            let guild = client.guilds.cache.get(guildId)
            if (!guild) return db.sil(guildId, "özel", "diğerleri")
            client.commands.get("özel").run({ guildDatabase, pre: premiumDosya[guildId], alisa, msg: mesaj, args: [], guildId: guildId, prefix: (guildDatabase.prefix || ayarlar.prefix), hata: () => { }, sonradan: true, guild, msgMember: mesaj.member, guildMe: guild.members.me })
        })
        Object.entries(db.buldosya("kur", "diğerleri")).filter(([guildId]) => client.shardId(guildId) == client.shard.ids[0]).forEach(async ([guildId, object]) => {
            if (object.date < Date.now() - 120000) return db.sil(guildId, "kur", "diğerleri")
            const kanal = client.channels.cache.get(object.channelId)
            if (!kanal) return db.sil(guildId, "kur", "diğerleri")
            let guildDatabase = client.guildDatabase(guildId)
            const mesaj = (await fetchMessage(kanal, object.messageId, object.authorId))
            if (!mesaj) return db.sil(guildId, "kur", "diğerleri")
            let guild = client.guilds.cache.get(guildId)
            if (!guild) return db.sil(guildId, "kur", "diğerleri")
            client.commands.get("kur").run({ guildDatabase, pre: premiumDosya[guildId], alisa, msg: mesaj, args: [], guildId: guildId, prefix: (guildDatabase.prefix || ayarlar.prefix), hata: () => { }, sonradan: object, guild, msgMember: mesaj.member, guildMe: guild.members.me })
        })

        // Eğer bütün shardlar başlatılırsa bot durumu kanalına mesaj atar
        if (client.options.shardCount == client.shard.ids[0] + 1) {
            let snipe = db.buldosya("snipe", "diğerleri")
                , newObject = {};
            (await client.shard.broadcastEval((c, json) => c.channels.cache.filter(a => json[a.id]).map(a => a.id), { context: snipe })).flat().forEach(a => newObject[a] = snipe[a])
            db.yazdosya(newObject, "snipe", "diğerleri")
            client.sendChannel(`🔄 **Bot yeniden başlatıldı! - Başlama süresi: ${Time.duration({ ms: Date.now() - alisa.lastUptime, skipZeros: true })}**`, "")
        }
    }
}
