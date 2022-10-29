const { EmbedBuilder, Guild } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "guildCreate",
    /**
     * 
     * @param {Guild} guild 
     */
    async run(guild) {
        try {
            let alisa = db.buldosya("alisa", "diğerleri")
            if (alisa.klserver.includes(guild.id)) return guild.leave()
            db.sil(guild.id, "kur", "diğerleri")
            let { REST } = require('@discordjs/rest')
                , { Routes } = require("discord-api-types/v10")
                , rest = new REST({ version: '10' }).setToken(guild.client.token)
                , sunucudb = db.buldosya(guild.id)
                , prefix = sunucudb.prefix || "."
                , tagrolSunucudb = guild.client.t(guild.id)
                , kayıtsız = sunucudb.kayıt.kayıtsız
                , yetkili = sunucudb.kayıt.yetkili
                , erkekRol = sunucudb.kayıt.erkek || []
                , erkekRolFilter = erkekRol.filter(role => guild.roles.cache.has(role))
                , kızRol = sunucudb.kayıt.kız || []
                , kızRolFilter = kızRol.filter(role => guild.roles.cache.has(role))
                , kayıtRol = sunucudb.kayıt.normal || []
                , kayıtRolFilter = kayıtRol.filter(role => guild.roles.cache.has(role))
                , botRol = sunucudb.kayıt.bot || []
                , botRolFilter = botRol.filter(role => guild.roles.cache.has(role))
                , yetkiliRol = sunucudb.premium.yetkili || []
                , yetkiliRolFilter = yetkiliRol.filter(role => guild.roles.cache.has(role))
                , partnerRol = sunucudb.premium.yetkili
                , kayıtKanal = sunucudb.kayıt.kanal
                , kayıtGunluk = sunucudb.kayıt.günlük
                , kayıtLog = sunucudb.kayıt.log
                , modLog = sunucudb.kayıt.modl
                , tagrolRol = tagrolSunucudb.rol
                , tagrolKanal = tagrolSunucudb.kanal
                , tagrolLog = tagrolSunucudb.log
                , jailRol = sunucudb.jail.rol
                , jailYetkili = sunucudb.jail.yetkili
                , jailLog = sunucudb.jail.log
                , vipRol = sunucudb.kayıt.vrol
                , vipYetkili = sunucudb.kayıt.vyetkili
                , banYetkili = sunucudb.kayıt.bany
                , kickYetkili = sunucudb.kayıt.kicky
                , hatalar = []
                , embeds = []
            if (kayıtsız && !guild.roles.cache.has(kayıtsız)) {
                delete sunucudb.kayıt.kayıtsız
                hatalar.push('Kayıtsız rolü')
            }
            if (yetkili && !guild.roles.cache.has(yetkili)) {
                delete sunucudb.kayıt.yetkili
                hatalar.push('Yetkili rolü')
            }
            if (erkekRolFilter.length != erkekRol.length) {
                if (erkekRolFilter.length) {
                    sunucudb.kayıt.erkek = erkekRolFilter
                    hatalar.push('Erkek rollerinden bazıları')
                } else {
                    delete sunucudb.kayıt.erkek
                    hatalar.push('Erkek rollerinin hepsi')
                }
            }
            if (kızRolFilter.length != kızRol.length) {
                if (kızRolFilter.length) {
                    sunucudb.kayıt.kız = kızRolFilter
                    hatalar.push('Kız rollerinden bazıları')
                } else {
                    delete sunucudb.kayıt.kız
                    hatalar.push('Kız rollerinin hepsi')
                }
            }
            if (kayıtRolFilter.length != kayıtRol.length) {
                if (kayıtRolFilter.length) {
                    sunucudb.kayıt.normal = kayıtRolFilter
                    hatalar.push('Üye rollerinden bazıları')
                } else {
                    delete sunucudb.kayıt.normal
                    hatalar.push('Üye rollerinin hepsi')
                }
            }
            if (botRolFilter.length != botRol.length) {
                if (botRolFilter.length) {
                    sunucudb.kayıt.bot = botRolFilter
                    hatalar.push('Bot rollerinden bazıları')
                } else {
                    delete sunucudb.kayıt.bot
                    hatalar.push('Bot rollerinin hepsi')
                }
            }
            if (yetkiliRolFilter.length != yetkiliRol.length) {
                if (yetkiliRolFilter.length) {
                    sunucudb.premium.yetkili = yetkiliRolFilter
                    hatalar.push('Yetkili rollerinden bazıları')
                } else {
                    delete sunucudb.premium.yetkili
                    hatalar.push('Yetkili rollerinin hepsi')
                }
            }
            if (partnerRol && !guild.roles.cache.has(partnerRol)) {
                delete sunucudb.premium.partner
                hatalar.push('Partner rolü')
            }
            if (kayıtKanal && !guild.channels.cache.has(kayıtKanal)) {
                delete sunucudb.kayıt.kanal
                hatalar.push('Kayıt kanalı')
            }
            if (kayıtGunluk && !guild.channels.cache.has(kayıtGunluk)) {
                delete sunucudb.kayıt.günlük
                hatalar.push('Kayıt günlük kanalı')
            }
            if (kayıtLog && !guild.channels.cache.has(kayıtLog)) {
                delete sunucudb.kayıt.log
                hatalar.push('Kayıt log kanalı')
            }
            if (modLog && !guild.channels.cache.has(modLog)) {
                delete sunucudb.kayıt.modl
                hatalar.push('Moderasyon log kanalı')
            }
            if (tagrolRol && !guild.roles.cache.has(tagrolRol)) {
                delete tagrolSunucudb.rol
                hatalar.push('Tagrol rolü')
            }
            if (tagrolKanal && !guild.channels.cache.has(tagrolKanal)) {
                delete tagrolSunucudb.kanal
                hatalar.push('Tagrol kanalı')
            }
            if (tagrolLog && !guild.channels.cache.has(tagrolLog)) {
                delete tagrolSunucudb.log
                hatalar.push('Tagrol log kanalı')
            }
            if (jailRol && !guild.roles.cache.has(jailRol)) {
                delete sunucudb.jail.rol
                hatalar.push('Jail rolü')
            }
            if (jailYetkili && !guild.roles.cache.has(jailYetkili)) {
                delete sunucudb.jail.yetkili
                hatalar.push('Jail yetkili rolü')
            }
            if (jailLog && !guild.channels.cache.has(jailLog)) {
                delete sunucudb.jail.log
                hatalar.push('Jail log kanalı')
            }
            if (vipRol && !guild.roles.cache.has(vipRol)) {
                delete sunucudb.kayıt.vrol
                hatalar.push('Vip rolü')
            }
            if (vipYetkili && !guild.roles.cache.has(vipYetkili)) {
                delete sunucudb.kayıt.vyetkili
                hatalar.push('Vip yetkili rolü')
            }
            if (banYetkili && !guild.roles.cache.has(banYetkili)) {
                delete sunucudb.kayıt.bany
                hatalar.push('Ban yetkili rolü')
            }
            if (kickYetkili && !guild.roles.cache.has(kickYetkili)) {
                delete sunucudb.kayıt.kicky
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
                    .setDescription(`• **${guild.name} - (${guild.id})** sunucusundaki daha önceden kayıtlı olan __${hat}__ silinmiştir. Lütfen başka bir rol veya kanal ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                embeds.push(embed)
                db.yazdosya(sunucudb, guild.id)
                db.yaz(guild.id, tagrolSunucudb, "tag rol", "diğerleri")
            }
            ; (async () => {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(guild.client.user.id, guild.id),
                        { body: guild.client.slash.commands }
                    ).catch(err => { });
                } catch (error) {
                    console.error(error);
                }
            })();
            guild.client.sunucudb[guild.id] = sunucudb
            let sunucuSayı = (await guild.client.shard.broadcastEval(client => client.guilds.cache.size)).reduce((acc, top) => acc + top, 0)
                , pp = guild.client.user.displayAvatarURL()
            alisa.sunucular.ekleme[guild.id] = Date.now()
            if (sunucuSayı % 100 == 0 && !alisa.starih[sunucuSayı]) alisa.starih[sunucuSayı] = Date.now()
            db.yazdosya(alisa, "alisa", "diğerleri")
            if (sunucudb.kayıt.secenek) guild.client.secenek.add(guild.id)
            const embedtr = new EmbedBuilder()
                .setAuthor({ name: guild.client.user.tag, iconURL: pp })
                .setDescription(`• Beni **${guild.name}** adlı sunucunuza eklediğiniz için teşekkürleeerr <3 sizi asla yüz üstü bırakmayacağım bundan emin olabilirsiniz. \n\n• Şimdi kısaca kendimden bahsetmek gerekirse ben her public sunucuda olması gereken botlardan sadece birisiyim. İçimde birçok özelliğim ve sistemim bulunuyor\n\n**__İşte birkaç özelliğim__**\n ├> Butonlu kayıt sistemi\n ├> Gelişmiş özelleştirilmiş giriş mesajı\n ├> Kayıt edilirken düzenlenecek ismi dilediğiniz gibi özelleştirebilme\n ├> Gelişmiş son kayıtlar komutu, tagrol ve jail sistemi\n ├> Botun istediğiniz ses kanalına girmesini sağlayıp üyeleri karşılama\n └> İstediğiniz zaman tüm her şeyi sıfırlama ve çok daha fazlası!\n\n• Benimle ilgili gelişmeleri takip etmek için **${prefix}yenilik** yazman yeterli\n\n• Artık yeni gelen premium sistemi sayesinde premiumlara özel bir sürü yeni komutlar eklendi! Premium hakkında daha fazla bilgi almak isterseniz **${prefix}pre** yazabilirsiniz\n\n*• Diğer botlardan 5 kat daha hızlı!*\n\n• Eğer herhangi bir sorun olduğunda **${prefix}destek** yazarak veya [Destek Sunucuma](${ayarlar.discord}) gelerek yardım alabilirsiniz!\n\n**SENİN BOTUN SENİN KURALLARIN**`)
                .setColor("#9e02e2")
                .setThumbnail(pp)
                .setFooter({ text: "Pişt pişt seni seviyorum <3" })
            guild.client.sendChannel({ content: `📥 ${ayarlar.guildCreate[Math.floor(Math.random() * ayarlar.guildCreate.length)].replace("<s>", `${guild.name} - (${guild.id})`)} ( Toplamda **${sunucuSayı}** sunucuya hizmet ediyorum )` }, "KANAL ID")
            embeds.unshift(embedtr)
                ; (await guild.client.fetchUserForce(guild.ownerId))?.send({ embeds: embeds }).catch(err => { })
        } catch (e) {
            console.log(e)
        }
    }
}