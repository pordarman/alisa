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
            let guildId = m.guild.id
                , guildDatabase = m.client.guildDatabase(guildId)
                , kisi = guildDatabase.kl[m.id] || []
            kisi.unshift({ type: "remove", timestamp: Date.now() })
            guildDatabase.kl[m.id] = kisi
            db.yazdosya(guildDatabase, guildId)
        }
    }
}