const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "prefix",
  kod: ["prefix", "pref", "px"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      if (!args[0]) return hata("Lütfen yeni prefiximi yazınız")
      const yazı = args.join(" ").toLocaleLowerCase()
      if ([".", "sıfırla"].includes(yazı)) {
        delete sunucudb.prefix
        const em = new EmbedBuilder()
          .setTitle('Prefixiniz başarıyla "." olarak değiştirildi')
          .setDescription('• Yeni prefixiniz **.** oldu')
          .addFields(
            {
              name: 'Örnek',
              value: "```css\n.yardım\n.prefix\n.destek\n@" + msg.client.user.tag + " yardım\n```"
            }
          )
          .setTimestamp()
          .setColor('Blue')
        msg.reply({ embeds: [em] }).catch(err => { })
        db.yazdosya(sunucudb, sunucuid)
        return;
      }
      if (yazı.length > 5) return hata('Prefix uzunluğum 5\'ten uzun olamaz')
      if (prefix === yazı) return hata('Yazdığınız prefix zaten benim prefixim')
      sunucudb.prefix = yazı
      const e = new EmbedBuilder()
        .setTitle('Prefixiniz başarıyla "' + yazı + '" olarak değiştirildi')
        .setDescription('• Yeni prefixiniz **' + yazı + '** oldu')
        .addFields(
          {
            name: 'Örnek',
            value: "```css\n" + yazı + "yardım\n" + yazı + "prefix\n" + yazı + "destek\n@" + msg.client.user.tag + " yardım\n```"
          }
        )
        .setTimestamp()
        .setColor('Blue')
      msg.reply({ embeds: [e] }).catch(err => { })
      db.yazdosya(sunucudb, sunucuid)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

