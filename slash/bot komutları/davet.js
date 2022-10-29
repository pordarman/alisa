const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "davet",
    data: new SlashCommandBuilder()
        .setName("davet")
        .setDescription("Botun linklerini gösterir"),
    /**
     * 
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let components = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Davet et").setStyle(5).setURL(ayarlar.davet)).addComponents(new ButtonBuilder().setLabel("Oy ver").setStyle(5).setURL(`https://top.gg/bot/${int.client.user.id}/vote`)).addComponents(new ButtonBuilder().setLabel("Destek sunucum").setStyle(5).setURL(ayarlar.discord))
            if (ayarlar.web) components.addComponents(new ButtonBuilder().setLabel("Web sitesi").setStyle(5).setURL(ayarlar.web))
            int.reply({ content: "Al bakalım şapşik şey seni :)", components: [components] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}