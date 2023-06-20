const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "şüpheli",
    cooldown: 5,
    aliases: ["supheli", "şüpheli"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let yetkilirolid = sunucudb.kayıt.yetkili
            if (yetkilirolid) {
                if (!msgMember.roles.cache.has(yetkilirolid) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkilirolid}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let rols = sunucudb.kayıt.otosrol
            if (!rols) return hata(`Bu sunucuda herhangi bir şüpheli rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}şüpheli-rol @rol** yazabilirsiniz` : ""}`)
            let member = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (member.roles.cache.has(rols)) return hata("Heyyy dur bakalım orada! Bu kişi zaten şüpheliye atılmış durumda!")
            if (!guildMe.permissions.has("ManageRoles")) return hata(`Rolleri Yönet`, "yetkibot")

            // Üyeyi şüpheli olarak atama
            await member.edit({ roles: [rols] }).then(() => {
                let kl = sunucudb.kl[member.id] || []
                kl.unshift({ type: "s", author: msg.author.id, timestamp: Date.now() })
                sunucudb.kl[member.id] = kl
                msg.reply(`• ⛔ <@${member.id}> adlı kişi başarıyla Şüpheli'ye atıldı!`)
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                if (err?.code == 50013) return hata(`<@${member.id}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                console.log(err)
                return hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```").catch(err => { })
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}