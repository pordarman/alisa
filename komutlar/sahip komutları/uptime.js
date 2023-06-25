const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    owner: true,
    aliases: "uptime",
    name: "uptime",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let shards = await msg.client.shard.broadcastEval(c => ({ uptime: c.uptime, memory: process.memoryUsage().heapUsed, shard: c.shard.ids[0] }))
            msg.reply({ content: shards.map(a => `• \`#${a.shard}\` - **${Time.duration({ ms: a.uptime, format: "__<d>__ gün, __<h>__ saat, __<m>__ dakika, __<s>__ saniye", skipZeros: true })} - ( ${(a.memory / 1024 / 1024).toFixed(2)} mb )**`).join("\n") + `\n\n• **Toplam bellek:  __${(shards.map(a => a.memory).reduce((acc, memory) => acc + memory, 0) / 1024 / 1024).toFixed(2)} mb__**` }).catch(err => { })
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}