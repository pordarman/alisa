const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: "s-say",
    name: "sahip say",
    owner: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let shards = await msg.client.shard.broadcastEval(c => ({ sunucu: c.guilds.cache.size, kullanıcı: c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) }))
            msg.reply({ content: `• **${shards.reduce((acc, obj) => acc + obj.sunucu, 0).toLocaleString().replace(/\./, ",")}** sunucu ve **${shards.reduce((acc, obj) => acc + obj.kullanıcı, 0).toLocaleString().replace(/\./, ",")}** kullanıcıya hizmet ediyorum!` }).catch(err => { })
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}