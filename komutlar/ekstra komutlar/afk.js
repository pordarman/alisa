const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 2,
    name: "afk",
    kod: "afk",
    type: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            msg.react(ayarlar.emoji.p).catch(err => { })
            if (!msgMember.nickname?.toLocaleLowerCase()?.includes("[afk]")) msgMember.setNickname(`[AFK] ${msgMember.displayName}`, `AFK moduna giriş yaptı!`).catch(err => { })
            let search = msg.content.search(/(?<= *afk ).+/i)
            , reason
            if (search != -1) reason = msg.content.slice(search)
            sunucudb.afk[msg.author.id] = { s: reason, z: (Date.now() / 1000).toFixed(0) }
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}