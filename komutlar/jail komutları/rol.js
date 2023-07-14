const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "jail rol",
    aliases: ["jail-rol"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!guildDatabase.jail.rol) return hata('Jail rolü zaten sıfırlanmış durumda')
                delete guildDatabase.jail.rol
                hata('Jail rolü başarıyla sıfırlandı', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Jail rolü ayarlamak için **${prefix}jail-rol @rol**\n\n• Sıfırlamak için ise **${prefix}jail-rol sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (guildDatabase.jail.rol === rolid) return hata('Jail rolü zaten etiketlediğiniz rolle aynı')
            if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
            if (rolid == guildDatabase.jail.yetkili) return hata(`Etiketlediğiniz rol bu sunucudaki jail yetkili rolü. Lütfen başka bir rol etiketleyiniz`)
            
            guildDatabase.jail.rol = rolid
            hata('Bundan sonra jail\'e atılanlara <@&' + rolid + '> adlı rol verilecek', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


