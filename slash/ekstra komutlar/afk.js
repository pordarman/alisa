const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "afk",
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("AFK moduna giriş yaparsınız")
        .addStringOption(option => option.setName("sebep").setDescription("AFK sebebini giriniz").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {            
            let intMember = int.member
            if (!intMember.nickname?.toLocaleLowerCase()?.includes("[afk]")) intMember.setNickname(`[AFK] ${intMember.displayName}`, `AFK moduna giriş yaptı!`).catch(err => { })
            guildDatabase.afk[int.user.id] = { s: (int.options.getString("sebep", false) || undefined), z: (Date.now() / 1000).toFixed(0) }
            db.yazdosya(guildDatabase, guildId)
            int.reply({ content: `• <@${int.user.id}> başarıyla AFK moduna giriş yaptın!` }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}