const { EmbedBuilder, Role } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "roleDelete",
    /**
     * 
     * @param {Role} rol 
     */
    async run(rol) {
        try {
            if (rol.managed) return;

            // Eğer kayıtlı olan bir rol silinirse bunu sunucu sahibine iletir ve kayıtlı rolün verisini siler
            let rolsunucuid = rol.guild.id
                , sunucudb = rol.client.guildDatabase(rolsunucuid)
                , roller = []
                , botrolsilinmeid = sunucudb.kayıt.bot
            if (botrolsilinmeid && botrolsilinmeid.includes(rol.id)) {
                if (botrolsilinmeid.length == 1) delete sunucudb.kayıt.bot
                else botrolsilinmeid.splice(botrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Bot rolü`)
            }
            const erkekrolsilinmeid = sunucudb.kayıt.erkek
            if (erkekrolsilinmeid && erkekrolsilinmeid.includes(rol.id)) {
                if (erkekrolsilinmeid.length == 1) delete sunucudb.kayıt.erkek
                else erkekrolsilinmeid.splice(erkekrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Erkek rolü`)
            }
            const kızrolsilinmeid = sunucudb.kayıt.kız
            if (kızrolsilinmeid && kızrolsilinmeid.includes(rol.id)) {
                if (kızrolsilinmeid.length == 1) delete sunucudb.kayıt.kız
                else kızrolsilinmeid.splice(kızrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Kız rolü`)
            }
            const uyerolsilinmeid = sunucudb.kayıt.normal
            if (uyerolsilinmeid && uyerolsilinmeid.includes(rol.id)) {
                if (uyerolsilinmeid.length == 1) delete sunucudb.kayıt.normal
                else uyerolsilinmeid.splice(uyerolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Üye rolü`)
            }
            const yetkilirolsilinmeid = sunucudb.premium.yetkili
            if (yetkilirolsilinmeid && yetkilirolsilinmeid.includes(rol.id)) {
                if (yetkilirolsilinmeid.length == 1) delete sunucudb.premium.yetkili
                else yetkilirolsilinmeid.splice(uyerolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Üye rolü`)
            }
            let tagroldb = rol.client.tagrolDatabase(rolsunucuid)
            if (tagroldb?.rol == rol.id) {
                delete tagroldb.rol
                db.yaz(rolsunucuid, tagroldb, "tag rol", "diğerleri")
                roller.push(`Tagrol rolü`)
            }
            if (sunucudb.kayıt.kayıtsız == rol.id) {
                delete sunucudb.kayıt.kayıtsız
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Kayıtsız rolü`)
            }
            if (sunucudb.premium.partner == rol.id) {
                delete sunucudb.kayıt.kayıtsız
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Partner rolü`)
            }
            if (sunucudb.kayıt.yetkili == rol.id) {
                delete sunucudb.kayıt.yetkili
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Kayıt yetkili rolü`)
            }
            if (sunucudb.jail.yetkili == rol.id) {
                delete sunucudb.jail.yetkili
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Jail yetkili rolü`)
            }
            if (sunucudb.jail.rol == rol.id) {
                delete sunucudb.jail.rol
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Jail rolü`)
            }
            if (sunucudb.kayıt.vrol == rol.id) {
                delete sunucudb.kayıt.vrol
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Vip rolü`)
            }
            if (sunucudb.kayıt.vyetkili == rol.id) {
                delete sunucudb.kayıt.vyetkili
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Vip yetkili rolü`)
            }
            if (sunucudb.kayıt.bany == rol.id) {
                delete sunucudb.kayıt.bany
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Ban yetkili rolü`)
            }
            if (sunucudb.kayıt.kicky == rol.id) {
                delete sunucudb.kayıt.kicky
                db.yazdosya(sunucudb, rolsunucuid)
                roller.push(`Kick yetkili rolü`)
            }
            if (roller.length) {
                roller = roller.join(", ")
                let lastindex = roller.lastIndexOf(",")
                    , rolll
                if (lastindex == -1) rolll = roller
                else rolll = roller.slice(0, lastindex) + " ve " + roller.slice(lastindex + 2)
                const embed = new EmbedBuilder()
                    .setTitle("Bilgilendirme")
                    .setDescription(`• **${rol.guild.name} - (${rolsunucuid})** sunucusundaki __${rolll}__ olan **@${rol.name}** adlı rol silinmiştir. Lütfen başka bir rol ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                (await rol.client.fetchUserForce(rol.guild.ownerId))?.send({ embeds: [embed] }).catch(err => { });
            }
        } catch (e) {

        }
    }
}