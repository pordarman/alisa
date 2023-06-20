const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 10,
    name: "tag söyle",
    aliases: "tag",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let tag = []
            , tagrol = sunucudb.kayıt
            if (tagrol.tag) tag.push(tagrol.tag.slice(0, -1))
            if (tagrol.dis) tag.push(`#${tagrol.dis}`)
			tag = tag.join(" - ")
            if (tag) return msg.reply({ content: tag }).catch(err => { })
            else msg.react(ayarlar.emoji.np)
            if (msgMember.permissions.has('Administrator')) return msg.reply({ content: `Sunucuda tag ayarlı değil. Ayarlamak için **${prefix}tag-a** \`tagınız\` yazabilirsiniz` }).then(a => setTimeout(() => a.delete().catch(err => { }), 15 * 1000)).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
