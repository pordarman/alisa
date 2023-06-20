const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 10,
  name: "yenilik",
  aliases: ["yenilik", "yeni", "new"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      const { k, y, h, ts } = alisa.yenilik
      const fields = []
      if (k.length) fields.push({ name: "🆕 Yeni komutlar", value: k.map((a, i) => `**• \`#${i + 1}\`: ${a.replace(/<px>/g, prefix)}**`).join("\n") })
      if (y.length) fields.push({ name: "🪄 Yenilikler ve düzenlemeler", value: y.map((a, i) => `**• \`#${i + 1}\`: ${a.replace(/<px>/g, prefix)}**`).join("\n") })
      if (h.length) fields.push({ name: "🛠️ Hata düzeltmeleri", value: h.map((a, i) => `**• \`#${i + 1}\`: ${a.replace(/<px>/g, prefix)}**`).join("\n") })
      const embed = new EmbedBuilder()
        .setTitle('Botun yenilikleri')
        .addFields(...fields)
        .setColor('#e41755')
        .setFooter({ text: `Son güncelleme: ${ts}` })
        .setThumbnail(msg.client.user.displayAvatarURL())
      msg.reply({ embeds: [embed] }).catch(err => { })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
