const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "şüpheli",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let yetkilirolid = sunucudb.kayıt.yetkili
            , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.get(yetkilirolid) && !intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            } else if (!intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            let memberid = int.customId.replace(this.name, "")
                , member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            let rols = sunucudb.kayıt.otosrol
                , prefix = sunucudb.prefix || "."
            if (!rols) return hata(`Şeyyyy... Bu sunucuda herhangi bir __şüpheli__ rolü ayarlanmadığı için bu komutu kullanamazsın şapşik şey seni :(${intMember.permissions.has("Administrator") ? `\n\n• Ama bir şüpheli rolü ayarlamak isterseniz **${prefix}şüpheli-rol @rol** yazabilirsiniz` : ""}`)
            if (member.roles.cache.has(rols)) return hata("Heyyy dur bakalım orada! Bu kişi zaten şüpheliye atılmış durumda!")
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
            await member.edit({ roles: [rols] }).then(() => {
                let kl = sunucudb.kl[memberid] || []
                kl.unshift({ type: "s", author: int.user.id, timestamp: Date.now() })
                sunucudb.kl[memberid] = kl
                int.message.reply(`• ⛔ <@${member.id}> adlı kişi <@${int.user.id}> tarafından Şüpheli'ye atıldı!`).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                if (err?.code == 10007) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
                if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                console.log(err)
                return hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}