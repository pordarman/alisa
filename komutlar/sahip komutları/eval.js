const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  name: "eval",
  kod: ["eval", "ev"],
  no: true,
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!args[0]) return msg.react('❌')
      let komuteval = eval(args.join(" "))
      function send(yazı) {
        msg.channel.send(yazı)
      }
      function k() {
        let kayitSayilari = Object.entries(alisa.kayıtsayı).map(a => `• **${Number(a[0]).toLocaleString().replace(/\./, ",")} =>** ${Time.toDateStringForAlisa(a[1])} - ( ${Time.toNow(a[1])} )`), sayfa = Math.ceil(kayitSayilari.length / 30) + 1
        for (let i = 0; i < sayfa; i++) msg.channel.send({ content: kayitSayilari.slice((i * 30 - 30), (i * 30)).join("\n") }).catch(err => { })
      }
      function e() {
        let kayitSayilari = Object.entries(alisa.starih).map(a => `• **${Number(a[0]).toLocaleString().replace(/\./, ",")} =>** ${Time.toDateStringForAlisa(a[1])} - ( ${Time.toNow(a[1])} )`), sayfa = Math.ceil(kayitSayilari.length / 30) + 1
        for (let i = 0; i < sayfa; i++) msg.channel.send({ content: kayitSayilari.slice((i * 30 - 30), (i * 30)).join("\n") }).catch(err => { })
      }
      msg.react(ayarlar.p).catch(err => { })
      if (["string", "number", "float"].includes(typeof komuteval)) msg.reply({ content: String(komuteval || "• Burada gösterilecek hiçbir şey yok...") }).catch(err => { })
    } catch (e) {
      msg.react('❌').catch(err => { })
      msg.reply({ content: "Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```" }).catch(err => { })
    }
  }
}
