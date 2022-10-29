const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "tempjail",
    data: new SlashCommandBuilder()
        .setName("tempjail")
        .setDescription("Etiketlediğiniz üyeyi süreli jaile atarsınız")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true))
        .addStringOption(option => option.setName("süre").setDescription("Jail süresini giriniz").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Sebebini giriniz").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let yetkili = sunucudb.jail.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let rol = sunucudb.jail.rol
                , prefix = sunucudb.prefix || ayarlar.prefix
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}jail-rol @rol** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (guild.roles.cache.get(rol).position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let member = int.options.getMember("üye", true)
            let date = Date.now()
                , sure = date
                , sebep = int.options.getString("sebep", false)
                , süre = int.options.getString("süre", true)
                , saniye = süre.match(int.client.regex.getSeconds)
                , dakika = süre.match(int.client.regex.getMinutes)
                , saat = süre.match(int.client.regex.getHours)
                , gün = süre.match(int.client.regex.getDays)
            if (saniye) saniye.forEach(sn => sure += sn * 1000)
            if (dakika) dakika.forEach(sn => sure += sn * 60000)
            if (saat) saat.forEach(sn => sure += sn * 3600000)
            if (gün) gün.forEach(sn => sure += sn * 86400000)
            if (sure == date) return hata(`Lütfen bir süre giriniz\n\n**Örnek**\n• ${prefix}tempjail <@${member.id}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n• ${prefix}tempjail <@${member.id}> 30 dakika`, "h", 20000)
            if (member.roles.cache.has(rol)) return hata(`<@${member.id}> adlı kişi zaten jail'e atılmış durumda`)
            let sunucuJail = db.bul(sunucuid, "jail", "diğerleri") || {}, memberRoles = member.roles.cache.map(a => a.id)
            await member.edit({ roles: [rol] }).then(async () => {
                let obje = { d: date, s: sure - date, se: sebep, idler: { c: int.channelId, s: int.user.id } }
                await int.reply({ content: `• <@${member.id}> adlı kişi **${Time.duration({ ms: sure - date, skipZeros: true })}** boyunca __**${sebep || "Sebep belirtilmemiş"}**__ sebebinden jaile atıldı! **Ceza numarası:** \`#${sunucudb.sc.sayı}\``, allowedMentions: { users: [member.id], repliedUser: true }, fetchReply: true }).then(mesaj => {
                    obje.idler.m = mesaj.id
                }).catch(err => { })
                sunucuJail[member.id] = memberRoles
                let kisi = sunucudb.jail.kisi[member.id] || []
                    , kl = sunucudb.kl[member.id] || []
                kl.unshift({ type: "tj", time: sure - date, c: true, author: int.user.id, timestamp: date, number: sunucudb.sc.sayı })
                sunucudb.kl[member.id] = kl
                kisi.unshift({ y: int.user.id, s: sebep, sure: "⏰", z: date, bool: true })
                sunucudb.jail.kisi[member.id] = kisi
                sunucudb.jail.son.unshift({ s: int.user.id, k: member.id, z: date, se: sebep, sure: "⏰", bool: true })
                const clientPp = int.client.user.displayAvatarURL()
                Time.setTimeout(async () => {
                    const sunucudb2 = int.client.s(sunucuid)
                    if (!sunucudb2) return;
                    const rolid = sunucudb2.jail.rol
                    if (!rolid) return;
                    const uye = await int.client.fetchMember(member.id, int)
                    if (!uye) return;
                    let sunucuJail = db.bul(sunucuid, "jail", "diğerleri") || {}
                        , memberRoles = (sunucuJail[member.id] ? sunucuJail[member.id].filter(a => guild.roles.cache.has(a)) : member.roles.cache.filter(a => a.id != rol).map(a => a.id))
                    await member.edit({ roles: memberRoles }).then(async () => {
                        let channel = int.channel
                            , message = channel.messages.cache.get(obje.idler.m) || await channel.messages.fetch({ message: obje.idler.m })
                        if (message) message.reply({ content: `• <@${member.id}> adlı kişinin jail rolü başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } })?.catch(err => { })
                        else channel.send({ content: `• <@${member.id}> adlı kişinin jail rolü başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                        let date2 = Date.now()
                            , obje2 = { y: int.user.id, z: date2, sure: "⏰", bool: false }
                            , kisi = sunucudb2.jail.kisi[member.id]
                            , kl = sunucudb2.kl[member.id] || []
                        kl.unshift({ type: "tj", c: false, author: int.user.id, timestamp: date2 })
                        sunucudb2.kl[member.id] = kl
                        if (kisi) kisi.unshift(obje2)
                        else kisi = [obje2]
                        sunucudb2.jail.kisi[member.id] = kisi
                        sunucudb2.jail.son.unshift({ s: int.user.id, k: uye.id, z: date2, sure: "⏰", bool: false })
                        let log = sunucudb2.jail.log
                        if (log) {
                            let pp = uye.displayAvatarURL()
                                , date3 = (date2 / 1000).toFixed(0)
                                , yapılanSeyler = [
                                    `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**`,
                                    `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                                    `**• Jail'den çıkarılma zamanı:**  <t:${date3}:F> - <t:${date3}:R>`,
                                    `\n👤 **JAIL'DEN ÇIKARILAN KİŞİ**`,
                                    `**• Adı:**  <@${uye.user.id}> - ${uye.user.tag}`,
                                    `**• Alınan rol:**  <@&${rol}>`,
                                    `**• Sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                                    `**• Jail'e atılma zamanı:**  ${zaman}`,
                                    `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                                ]
                                , embed = new EmbedBuilder()
                                    .setAuthor({ name: member.user.tag, iconURL: pp })
                                    .setDescription(yapılanSeyler.join("\n"))
                                    .setThumbnail(pp)
                                    .setColor("#af0003")
                                    .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                                    .setTimestamp()
                            guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                        }
                        let dosya = db.bul(sunucuid, "tempjail", "diğerleri")
                        if (dosya) {
                            if (dosya[uye.id]?.d != date) return;
                            delete dosya[uye.id]
                        } else return;
                        db.yaz(sunucuid, dosya, "tempjail", "diğerleri")
                        delete sunucuJail[member.id]
                        db.yaz(sunucuid, sunucuJail, "jail", "diğerleri")
                        db.yazdosya(sunucudb2, sunucuid)
                        return;
                    }).catch(err => {
                        const embed = new EmbedBuilder()
                            .setTitle("Hata")
                            .setDescription(`**• <@${uye.id}> adlı kişiden jail rolünü alamadım! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n• ${err}`)
                            .setColor("Red")
                            .setTimestamp()
                        return int?.channel?.send({ embeds: [embed] }).catch(err => { })
                    })
                }, sure - date)
                sunucudb.sc.sayı += 1
                let log = sunucudb.jail.log
                let zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                if (log) {
                    let pp = member.displayAvatarURL()
                        , yapılanSeyler = [
                            `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**`,
                            `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                            `**• Jail'e atma zamanı:**  ${zaman}`,
                            `\n👤 **SÜRELİ JAIL'E ATILAN KİŞİ**`,
                            `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                            `**• Verilen rol:**  <@&${rol}>`,
                            `**• Sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                            `**• Jail süresinin bitiş tarihi:**  <t:${(sure / 1000).toFixed(0)}:F> - <t:${(sure / 1000).toFixed(0)}:R>`,
                            `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                        ]
                        , embed = new EmbedBuilder()
                            .setAuthor({ name: member.user.tag, iconURL: pp })
                            .setDescription(yapılanSeyler.join("\n"))
                            .setThumbnail(pp)
                            .setColor("#af0003")
                            .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                            .setTimestamp()
                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                }
                let dosyasunucu = db.bul(sunucuid, "tempjail", "diğerleri") || {}
                dosyasunucu[member.id] = obje
                db.yaz(sunucuid, dosyasunucu, "tempjail", "diğerleri")
                db.yazdosya(sunucudb, sunucuid)
                db.yaz(sunucuid, sunucuJail, "jail", "diğerleri")
            }).catch(err => {
                return hata(`**• <@${member.id}> adlı kişiye jail rolünü veremedim! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n` + "```js\n" + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}