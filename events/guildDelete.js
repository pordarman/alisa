const { Guild } = require("discord.js")
const db = require("../modüller/database")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "guildDelete",
    /**
     * 
     * @param {Guild} guild 
     */
    async run(guild) {
        try {
            let alisa = db.buldosya("alisa", "diğerleri")
            if (alisa.klserver.includes(guild.id)) return;

            // Sunucudan çıkarıldığı bilgisini belirtilen kanala atar
            db.sil(guild.id, "kur", "diğerleri")
            delete guild.client.sunucudb[guild.id]
            alisa.sunucular.çıkarma[guild.id] = Date.now()
            db.yazdosya(alisa, "alisa", "diğerleri")
            guild.client.secenek.delete(guild.id)
            guild.client.sendChannel({ content: `📤 ${ayarlar.guildDelete[Math.floor(Math.random() * ayarlar.guildDelete.length)].replace("<s>", `${guild.name} - (${guild.id})`)} ( Toplamda **${(await guild.client.shard.broadcastEval(client => client.guilds.cache.size)).reduce((acc, top) => acc + top, 0).toLocaleString().replace(/\./g, ",")}** sunucuya hizmet ediyorum )` }, "KANAL ID")
        } catch (e) {
            console.log(e)
        }
    }
}