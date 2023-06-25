const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "mute yetkili",
    aliases: ["mute-yetkili", "mute-rol", "mutey"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!guildDatabase.kayıt.mutey) return hata('Üyeleri susturacak yetkili rolü zaten sıfırlanmış durumda')
                delete guildDatabase.kayıt.mutey
                hata('Üyeleri susturacak yetkili rolü başarıyla sıfırlandı', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Üyeleri susturacak yetkili rolü ayarlamak için **${prefix}mutey @rol**\n\n• Sfırlamak için ise **${prefix}mutey sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (rol.managed) return hata(`Botların oluşturduğu rolleri botlardan başka kimse sahip olamadığı için bu rolü seçemezsiniz`)
       
            guildDatabase.kayıt.mutey = rolid
            hata(`Bundan sonra üyeleri <@&${rolid}> adlı role sahip kişiler susturabilecek`, "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


