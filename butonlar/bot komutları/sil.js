const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "sil",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const id = int.customId.replace(this.name, "")
            if (int.user.id != id) return int.reply({ embeds: [new EmbedBuilder().setDescription(`<:${int.component.emoji.name}:${int.component.emoji.id}> Butonunu yalnızca yazan kişi (<@${id}>) adlı kişi kullanabilir`).setColor("DarkRed")], ephemeral: true }).catch(err => { })
            int.message.delete().catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}