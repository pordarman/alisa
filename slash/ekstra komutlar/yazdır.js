const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "yazdır",
    data: new SlashCommandBuilder()
        .setName("yazdır")
        .setDescription("Bota istediğiniz mesajı yazdırmanızı sağlar")
        .addStringOption(option => option.setName("mesaj").setDescription("Botun yazacağı mesajı giriniz").setRequired(true))
        .addStringOption(option => option.setName("id").setDescription("Botun yanıtlayacağı mesajın ID'sini giriniz").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let messageReferenceId = String(int.options.getString("id", false))
                , yazdırılacakYazı = int.options.getString("mesaj", true)
                , channel = int.channel
            int.reply({ content: `• Mesajın başarıyla gönderildi!`, ephemeral: true }).catch(err => { })
            if (messageReferenceId && Time.isNumber(messageReferenceId)) {
                let messageReference = channel.messages.cache.get(messageReferenceId) || await channel.messages.fetch(messageReferenceId).catch(err => { })
                if (!messageReference) return channel.send({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                return messageReference.reply({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            }
            return channel.send({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}