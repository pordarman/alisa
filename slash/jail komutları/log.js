const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail log",
    data: new SlashCommandBuilder()
        .setName("jail-log")
        .setDescription("Jail log kanalını ayarlarsınız")
        .addSubcommand(subcommand => subcommand.setName("kanal").setDescription("Kanalı etiketle").addChannelOption(a => a.setName("kanal").setDescription("Kanalı etiketle").setRequired(true)))
        .addSubcommand(a => a.setName("sıfırla").setDescription("Jail log kanalını sıfırlarsınız")),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")      

            if (int.options.getSubcommand(false) == "kanal") {
                let kanal = int.options.getChannel("kanal", true)
                if (guildDatabase.jail.log === kanal.id) return hata("Jail log kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
                
                guildDatabase.jail.log = kanal.id
                hata('Jail log kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            if (!guildDatabase.jail.log) return hata("Jail log kanalı zaten sıfırlanmış durumda")
            
            delete guildDatabase.jail.log
            hata('Jail log kanalı başarıyla sıfırlanmıştır', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}