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
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!sunucudb.kayıt.mutey) return hata('Üyeleri susturacak yetkili rolü zaten sıfırlanmış durumda')
                delete sunucudb.kayıt.mutey
                hata('Üyeleri susturacak yetkili rolü başarıyla sıfırlandı', "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Üyeleri susturacak yetkili rolü ayarlamak için **${prefix}mutey @rol**\n\n• Sfırlamak için ise **${prefix}mutey sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (rol.managed) return hata(`Botların oluşturduğu rolleri botlardan başka kimse sahip olamadığı için bu rolü seçemezsiniz`)
       
            sunucudb.kayıt.mutey = rolid
            hata(`Bundan sonra üyeleri <@&${rolid}> adlı role sahip kişiler susturabilecek`, "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


