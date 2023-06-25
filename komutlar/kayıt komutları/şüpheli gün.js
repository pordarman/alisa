const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 5,
    name: "şüpheli gün",
    aliases: ["şüpheli-gün", "süpheligün"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            let gun = args[0]
            if (!gun) return hata(`Sunucuya yeni giren kullanıcıların şüpheli olarak gözükebilmesi için gerekli gün sayısını ayarlamak için **${prefix}şüpheli-gün 7**\n\n• Sıfırlamak için ise **${prefix}şühepli-gün sıfırla** yazabilirsiniz`, "ne")            
            if (gun == "sıfırla") {
                if (!guildDatabase.kayıt.otogun) return hata(`Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli gün sayısı zaten sıfırlanmış durumda!`)
                delete guildDatabase.kayıt.otogun
                hata('Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli gün sayısı başarıyla sıfırlandı', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            gun = gun.replace(/(g|g[uü]n|d|days?)/, "")
            if (!Time.isNumber(gun)) return hata(`Girdiğiniz değer bir sayı değeri değil lütfen değerinizi sayı olarak giriniz\n\n**Örnek**\n• ${prefix}şüpheli-gün 7\n• ${prefix}şüpheli-gün sıfırla`)
            if (gun < 0) gun = -gun
            guildDatabase.kayıt.otogun = +gun
            hata(`Bundan sonra **${gun}** gün içinde açılan kişileri şüpheli olarak göstereceğim${guildDatabase.kayıt.otos ? " ve onları direkt şüpheli'ye atacağım" : ""}`, "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
