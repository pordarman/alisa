const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "ban yetkili",
    kod: ["ban-yetkili", "ban-rol", "bany"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")            
            if (args[0] === "sıfırla") {
                if (!sunucudb.kayıt.bany) return hata('Üyeleri banlayacak yetkili rolü zaten sıfırlanmış durumda')
                delete sunucudb.kayıt.bany
                hata('Üyeleri banlayacak yetkili rolü başarıyla sıfırlandı', "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            const rol = msg.client.fetchRole(args.join(" "), msg)
            if (!rol) return hata(`Üyeleri banlayacak yetkili rolü ayarlamak için **${prefix}bany @rol**\n\n• Sfırlamak için ise **${prefix}bany sıfırla** yazabilirsiniz`, "ne")
            const rolid = rol.id
            if (rol.managed) return hata(`Botların oluşturduğu rolleri botlardan başka kimse sahip olamadığı için bu rolü seçemezsiniz`)
            sunucudb.kayıt.bany = rolid
            hata(`Bundan sonra üyeleri <@&${rolid}> adlı role sahip kişiler banlayabilecek`, "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


