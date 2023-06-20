const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 2,
    name: "davet",
    aliases: ["davet", "ekle", "link", "add"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let components = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Davet et").setStyle(5).setURL(ayarlar.davet)).addComponents(new ButtonBuilder().setLabel("Oy ver").setStyle(5).setURL(`https://top.gg/bot/${msg.client.user.id}/vote`)).addComponents(new ButtonBuilder().setLabel("Destek sunucum").setStyle(5).setURL(ayarlar.discord))
            if (ayarlar.web) components.addComponents(new ButtonBuilder().setLabel("Web sitesi").setStyle(5).setURL(ayarlar.web))
            msg.reply({ content: "Al bakalım şapşik şey seni :)", components: [components] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
