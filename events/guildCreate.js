const { EmbedBuilder, Guild } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
const { REST } = require('@discordjs/rest')
const { Routes } = require("discord-api-types/v10")
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

            // Eğer bot sunucuya daha önceden eklenmişse ve önceki kayıtlı rolleri veya kanalları bulamazsa kayıtlı rol ve kanalın verisini siler ve bunu sunucu sahibine iletir
            let rest = new REST({ version: '10' }).setToken(guild.client.token)
                , guildDatabase = db.buldosya(guild.id)
                , prefix = guildDatabase.prefix || ayarlar.prefix
                , tagrolguildDatabase = guild.client.tagrolDatabase(guild.id)
                , kayıtsız = guildDatabase.kayıt.kayıtsız
                , yetkili = guildDatabase.kayıt.yetkili
                , erkekRol = guildDatabase.kayıt.erkek || []
                , erkekRolFilter = erkekRol.filter(role => guild.roles.cache.has(role))
                , kızRol = guildDatabase.kayıt.kız || []
                , kızRolFilter = kızRol.filter(role => guild.roles.cache.has(role))
                , kayıtRol = guildDatabase.kayıt.normal || []
                , kayıtRolFilter = kayıtRol.filter(role => guild.roles.cache.has(role))
                , botRol = guildDatabase.kayıt.bot || []
                , botRolFilter = botRol.filter(role => guild.roles.cache.has(role))
                , yetkiliRol = guildDatabase.premium.yetkili || []
                , yetkiliRolFilter = yetkiliRol.filter(role => guild.roles.cache.has(role))
                , partnerRol = guildDatabase.premium.yetkili
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
                , hatalar = []
                , embeds = []
            if (kayıtsız && !guild.roles.cache.has(kayıtsız)) {
                delete guildDatabase.kayıt.kayıtsız
                hatalar.push('Kayıtsız rolü')
            }
            if (yetkili && !guild.roles.cache.has(yetkili)) {
                delete guildDatabase.kayıt.yetkili
                hatalar.push('Yetkili rolü')
            }
            if (erkekRolFilter.length != erkekRol.length) {
                if (erkekRolFilter.length) {
                    guildDatabase.kayıt.erkek = erkekRolFilter
                    hatalar.push('Erkek rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.erkek
                    hatalar.push('Erkek rollerinin hepsi')
                }
            }
            if (kızRolFilter.length != kızRol.length) {
                if (kızRolFilter.length) {
                    guildDatabase.kayıt.kız = kızRolFilter
                    hatalar.push('Kız rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.kız
                    hatalar.push('Kız rollerinin hepsi')
                }
            }
            if (kayıtRolFilter.length != kayıtRol.length) {
                if (kayıtRolFilter.length) {
                    guildDatabase.kayıt.normal = kayıtRolFilter
                    hatalar.push('Üye rollerinden bazıları')
                } else {
                    delete guildDatabase.kayıt.normal
                    hatalar.push('Üye rollerinin hepsi')
                }
            }
            if (botRolFilter.length != botRol.length) {
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
            if (partnerRol && !guild.roles.cache.has(partnerRol)) {
                delete guildDatabase.premium.partner
                hatalar.push('Partner rolü')
            }
            if (kayıtKanal && !guild.channels.cache.has(kayıtKanal)) {
                delete guildDatabase.kayıt.kanal
                hatalar.push('Kayıt kanalı')
            }
            if (kayıtGunluk && !guild.channels.cache.has(kayıtGunluk)) {
                delete guildDatabase.kayıt.günlük
                hatalar.push('Kayıt günlük kanalı')
            }
            if (kayıtLog && !guild.channels.cache.has(kayıtLog)) {
                delete guildDatabase.kayıt.log
                hatalar.push('Kayıt log kanalı')
            }
            if (modLog && !guild.channels.cache.has(modLog)) {
                delete guildDatabase.kayıt.modl
                hatalar.push('Moderasyon log kanalı')
            }
            if (tagrolRol && !guild.roles.cache.has(tagrolRol)) {
                delete tagrolguildDatabase.rol
                hatalar.push('Tagrol rolü')
            }
            if (tagrolKanal && !guild.channels.cache.has(tagrolKanal)) {
                delete tagrolguildDatabase.kanal
                hatalar.push('Tagrol kanalı')
            }
            if (tagrolLog && !guild.channels.cache.has(tagrolLog)) {
                delete tagrolguildDatabase.log
                hatalar.push('Tagrol log kanalı')
            }
            if (jailRol && !guild.roles.cache.has(jailRol)) {
                delete guildDatabase.jail.rol
                hatalar.push('Jail rolü')
            }
            if (jailYetkili && !guild.roles.cache.has(jailYetkili)) {
                delete guildDatabase.jail.yetkili
                hatalar.push('Jail yetkili rolü')
            }
            if (jailLog && !guild.channels.cache.has(jailLog)) {
                delete guildDatabase.jail.log
                hatalar.push('Jail log kanalı')
            }
            if (vipRol && !guild.roles.cache.has(vipRol)) {
                delete guildDatabase.kayıt.vrol
                hatalar.push('Vip rolü')
            }
            if (vipYetkili && !guild.roles.cache.has(vipYetkili)) {
                delete guildDatabase.kayıt.vyetkili
                hatalar.push('Vip yetkili rolü')
            }
            if (banYetkili && !guild.roles.cache.has(banYetkili)) {
                delete guildDatabase.kayıt.bany
                hatalar.push('Ban yetkili rolü')
            }
            if (kickYetkili && !guild.roles.cache.has(kickYetkili)) {
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
                    .setDescription(`• **${guild.name} - (${guild.id})** sunucusundaki daha önceden kayıtlı olan __${hat}__ silinmiştir. Lütfen başka bir rol veya kanal ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                embeds.push(embed)
                db.yazdosya(guildDatabase, guild.id)
                db.yaz(guild.id, tagrolguildDatabase, "tag rol", "diğerleri")
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

            // Sunucuya eklendiği bilgisini belirtilen kanala atar
            guild.client.guildDatabase[guild.id] = guildDatabase
            let sunucuSayı = (await guild.client.shard.broadcastEval(client => client.guilds.cache.size)).reduce((acc, top) => acc + top, 0)
                , pp = guild.client.user.displayAvatarURL()
            alisa.sunucular.ekleme[guild.id] = Date.now()
            if (sunucuSayı % 100 == 0 && !alisa.starih[sunucuSayı]) alisa.starih[sunucuSayı] = Date.now()
            db.yazdosya(alisa, "alisa", "diğerleri")
            if (guildDatabase.kayıt.secenek) guild.client.secenek.add(guild.id)
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