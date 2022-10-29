const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yenilik",
    data: new SlashCommandBuilder()
        .setName("yenilik")
        .setDescription("Bot gelen yenilikleri gösterir"),
    /**
     * 
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const prefix = sunucudb.prefix || ayarlar.prefix
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
                .setThumbnail(int.client.user.displayAvatarURL())
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}