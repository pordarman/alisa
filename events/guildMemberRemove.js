const db = require("../modüller/database")
const { GuildMember } = require("discord.js")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "guildMemberRemove",
    /**
     * 
     * @param {GuildMember} m 
     */
    async run(m) {
        if (!m.user.bot) {
            let sunucuid = m.guild.id
                , sunucudb = m.client.guildDatabase(sunucuid)
                , kisi = sunucudb.kl[m.id] || []
            kisi.unshift({ type: "remove", timestamp: Date.now() })
            sunucudb.kl[m.id] = kisi
            db.yazdosya(sunucudb, sunucuid)
        }
    }
}