const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "jail yetkili",
    aliases: ["jail-yetkili"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!guildDatabase.jail.yetkili) return hata('Jail yetkili rolü zaten sıfırlanmış durumda')
                delete guildDatabase.jail.yetkili
                hata('Jail yetkili rolü başarıyla sıfırlandı', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Jail yetkili rolü ayarlamak için **${prefix}jail-yetkili @rol**\n\n• Sıfırlamak için ise **${prefix}jail-yetkili sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (guildDatabase.jail.yetkili === rolid) return hata('Jail yetkili rolü zaten etiketlediğiniz rolle aynı')
            if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
            if (rolid == guildDatabase.jail.rol) return hata(`Etiketlediğiniz rol bu sunucudaki jail rolü. Lütfen başka bir rol etiketleyiniz`)
            
            guildDatabase.jail.yetkili = rolid
            hata('Bundan sonra jail\'e <@&' + rolid + '> adlı role sahip olanlar atabilecek', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


