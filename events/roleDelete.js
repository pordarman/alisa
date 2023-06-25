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
            let rolguildId = rol.guild.id
                , guildDatabase = rol.client.guildDatabase(rolguildId)
                , roller = []
                , botrolsilinmeid = guildDatabase.kayıt.bot
            if (botrolsilinmeid && botrolsilinmeid.includes(rol.id)) {
                if (botrolsilinmeid.length == 1) delete guildDatabase.kayıt.bot
                else botrolsilinmeid.splice(botrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Bot rolü`)
            }
            const erkekrolsilinmeid = guildDatabase.kayıt.erkek
            if (erkekrolsilinmeid && erkekrolsilinmeid.includes(rol.id)) {
                if (erkekrolsilinmeid.length == 1) delete guildDatabase.kayıt.erkek
                else erkekrolsilinmeid.splice(erkekrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Erkek rolü`)
            }
            const kızrolsilinmeid = guildDatabase.kayıt.kız
            if (kızrolsilinmeid && kızrolsilinmeid.includes(rol.id)) {
                if (kızrolsilinmeid.length == 1) delete guildDatabase.kayıt.kız
                else kızrolsilinmeid.splice(kızrolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Kız rolü`)
            }
            const uyerolsilinmeid = guildDatabase.kayıt.normal
            if (uyerolsilinmeid && uyerolsilinmeid.includes(rol.id)) {
                if (uyerolsilinmeid.length == 1) delete guildDatabase.kayıt.normal
                else uyerolsilinmeid.splice(uyerolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Üye rolü`)
            }
            const yetkilirolsilinmeid = guildDatabase.premium.yetkili
            if (yetkilirolsilinmeid && yetkilirolsilinmeid.includes(rol.id)) {
                if (yetkilirolsilinmeid.length == 1) delete guildDatabase.premium.yetkili
                else yetkilirolsilinmeid.splice(uyerolsilinmeid.indexOf(rol.id), 1)
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Üye rolü`)
            }
            let tagroldb = rol.client.tagrolDatabase(rolguildId)
            if (tagroldb?.rol == rol.id) {
                delete tagroldb.rol
                db.yaz(rolguildId, tagroldb, "tag rol", "diğerleri")
                roller.push(`Tagrol rolü`)
            }
            if (guildDatabase.kayıt.kayıtsız == rol.id) {
                delete guildDatabase.kayıt.kayıtsız
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Kayıtsız rolü`)
            }
            if (guildDatabase.premium.partner == rol.id) {
                delete guildDatabase.kayıt.kayıtsız
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Partner rolü`)
            }
            if (guildDatabase.kayıt.yetkili == rol.id) {
                delete guildDatabase.kayıt.yetkili
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Kayıt yetkili rolü`)
            }
            if (guildDatabase.jail.yetkili == rol.id) {
                delete guildDatabase.jail.yetkili
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Jail yetkili rolü`)
            }
            if (guildDatabase.jail.rol == rol.id) {
                delete guildDatabase.jail.rol
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Jail rolü`)
            }
            if (guildDatabase.kayıt.vrol == rol.id) {
                delete guildDatabase.kayıt.vrol
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Vip rolü`)
            }
            if (guildDatabase.kayıt.vyetkili == rol.id) {
                delete guildDatabase.kayıt.vyetkili
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Vip yetkili rolü`)
            }
            if (guildDatabase.kayıt.bany == rol.id) {
                delete guildDatabase.kayıt.bany
                db.yazdosya(guildDatabase, rolguildId)
                roller.push(`Ban yetkili rolü`)
            }
            if (guildDatabase.kayıt.kicky == rol.id) {
                delete guildDatabase.kayıt.kicky
                db.yazdosya(guildDatabase, rolguildId)
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
                    .setDescription(`• **${rol.guild.name} - (${rolguildId})** sunucusundaki __${rolll}__ olan **@${rol.name}** adlı rol silinmiştir. Lütfen başka bir rol ayarlayınız.`)
                    .setColor("Blue")
                    .setTimestamp();
                (await rol.client.fetchUserForce(rol.guild.ownerId))?.send({ embeds: [embed] }).catch(err => { });
            }
        } catch (e) {

        }
    }
}