const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "KAYIT_CİNSİYET_DEĞİŞTİR",
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
            if (sunucudb.kayıt.secenek) return hata(`Bu özellik sadece __**Cinsiyet**__ ile kayıt edenlere özeldir`)
            if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has("Administrator") ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
            let memberid = int.customId.replace(this.name, "")
                , member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            let erkekrol = sunucudb.kayıt.erkek
                , kızrol = sunucudb.kayıt.kız
                , prefix = sunucudb.prefix || ayarlar.prefix
            if (!erkekrol) return hata(`Şeyyyy... Bu sunucuda herhangi bir erkek rolü ayarlanmadığı için bu komutu kullanamazsın şapşik şey seni :(${intMember.permissions.has("Administrator") ? `\n\n• Ama bir erkek rolü ayarlamak isterseniz **${prefix}erkek-rol @rol** yazabilirsiniz` : ""}`)
            if (!kızrol) return hata(`Şeyyyy... Bu sunucuda herhangi bir kız rolü ayarlanmadığı için bu komutu kullanamazsın şapşik şey seni :(${intMember.permissions.has("Administrator") ? `\n\n• Ama bir kız rolü ayarlamak isterseniz **${prefix}kız-rol @rol** yazabilirsiniz` : ""}`)
            if (erkekrol.every(id => member.roles.cache.has(id))) {
                await member.edit({ roles: [...kızrol, ...member.roles.cache.filter(a => ![...kızrol, ...erkekrol].includes(a.id)).map(a => a.id)] }).then(() => {
                    let kl = sunucudb.kl[memberid] || []
                    kl.unshift({ type: "d", c: false, author: int.user.id, timestamp: Date.now() })
                    sunucudb.kl[memberid] = kl
                    int.message.reply(`• ♻️ ${ayarlar.emoji.kiz} <@${int.user.id}>, <@${member.id}> adlı kişiden erkek rolünü alıp kız rolünü verdim`).catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }).catch(err => {
                    if (err?.code == 10007) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
                    if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                    console.log(err)
                    return hata("Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n" + err + "```")
                })
            } else if (kızrol.every(id => member.roles.cache.has(id))) {
                await member.edit({ roles: [...erkekrol, ...member.roles.cache.filter(a => ![...kızrol, ...erkekrol].includes(a.id)).map(a => a.id)] }).then(() => {
                    let kl = sunucudb.kl[memberid] || []
                    kl.unshift({ type: "d", c: true, author: int.user.id, timestamp: Date.now() })
                    sunucudb.kl[memberid] = kl
                    int.message.reply(`• ♻️ ${ayarlar.emoji.erkek} <@${int.user.id}>, <@${member.id}> adlı kişiden kız rolünü alıp erkek rolünü verdim`).catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }).catch(err => {
                    if (err?.code == 10007) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
                    if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                    console.log(err)
                    return hata("Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n" + err + "```")
                })
            } else return hata(`Cinsiyetini değişmek istediğiniz <@${member.id}> adlı kişide erkek veya kız rolleri bulunmuyor`)
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}