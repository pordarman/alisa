const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail rol",
    data: new SlashCommandBuilder()
        .setName("jail-rol")
        .setDescription("Jail rolünü ayarlarsınız")
        .addSubcommand(subcommand => subcommand.setName("ayarla").setDescription("Jail rolünü ayarla").addRoleOption(a => a.setName("rol").setDescription("Rolü etiketle").setRequired(true)))
        .addSubcommand(a => a.setName("sıfırla").setDescription("Jail rolünü sıfırlarsınız")),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")            
         
            if (int.options.getSubcommand(false) == "kanal") {
                let rol = int.options.getRole("rol", true)
                const rolid = rol.id
                if (guildDatabase.jail.rol === rolid) return hata('Jail rolü zaten etiketlediğiniz rolle aynı')
                if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                if (rolid == guildDatabase.jail.yetkili) return hata(`Etiketlediğiniz rol bu sunucudaki jail yetkili rolü. Lütfen başka bir rol etiketleyiniz`)
               
                guildDatabase.jail.rol = rolid
                hata('Bundan sonra jail\'e atılanlara <@&' + rolid + '> adlı rol verilecek', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            if (!guildDatabase.jail.rol) return hata('Jail rolü zaten sıfırlanmış durumda')
          
            delete guildDatabase.jail.rol
            hata('Jail rolü başarıyla sıfırlandı', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}