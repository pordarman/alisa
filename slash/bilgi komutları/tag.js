const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "tag söyle",
    data: new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Eğer ayarlıysa sunucunun tagını yazar"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let tag = []            
            const kayıt = guildDatabase.kayıt
            if (kayıt.tag) tag.push(kayıt.tag.slice(0, -1))
            if (kayıt.dis) tag.push(`#${kayıt.dis}`)
            tag = tag.join(" - ")
            if (tag) return int.reply({ content: tag }).catch(err => { })
            else if (int.member.permissions.has("Administrator")) return int.reply({ content: 'Sunucuda tag ayarlı değil. Ayarlamak için **' + (guildDatabase.prefix || ayarlar.prefix) + 'tag-a** `tagınız` yazabilirsiniz', ephemeral: true }).catch(err => { })
            else return int.reply({ content: 'Bu sunucuda herhangi bir tag ayarlı değil', ephemeral: true }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}