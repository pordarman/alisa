const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 5,
    name: "şüpheli gün",
    kod: ["şüpheli-gün", "süpheligün"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let gun = args[0]
            if (!gun) return hata(`Sunucuya yeni giren kullanıcıların şüpheli olarak gözükebilmesi için gerekli gün sayısını ayarlamak için **${prefix}şüpheli-gün 7**\n\n• Sıfırlamak için ise **${prefix}şühepli-gün sıfırla** yazabilirsiniz`, "ne")            
            if (gun == "sıfırla") {
                if (!sunucudb.kayıt.otogun) return hata(`Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli gün sayısı zaten sıfırlanmış durumda!`)
                delete sunucudb.kayıt.otogun
                hata('Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli gün sayısı başarıyla sıfırlandı', "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            gun = gun.replace(/(g|g[uü]n|d|days?)/, "")
            if (!Time.isNumber(gun)) return hata(`Girdiğiniz değer bir sayı değeri değil lütfen değerinizi sayı olarak giriniz\n\n**Örnek**\n• ${prefix}şüpheli-gün 7\n• ${prefix}şüpheli-gün sıfırla`)
            if (gun < 0) gun = -gun
            sunucudb.kayıt.otogun = +gun
            hata(`Bundan sonra **${gun}** gün içinde açılan kişileri şüpheli olarak göstereceğim${sunucudb.kayıt.otos ? " ve onları direkt şüpheli'ye atacağım" : ""}`, "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
