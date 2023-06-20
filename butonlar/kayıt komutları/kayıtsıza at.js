const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "KAYIT_KAYITSIZ",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {

            // Kontroller
            let yetkilirolid = sunucudb.kayıt.yetkili
                , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.get(yetkilirolid) && !intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            } else if (!intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            if (sunucudb.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has("Administrator") ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let memberid = int.customId.replace(this.name, "")
                , member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            let kayıtsızrolid = sunucudb.kayıt.kayıtsız
                , prefix = sunucudb.prefix || ayarlar.prefix
            if (!kayıtsızrolid) return hata(`Şeyyyy... Bu sunucuda bir kayıtsız rolü ayarlanmadığı için bu komutu kullanamazsın şapşik şey seni :(${intMember.permissions.has("Administrator") ? `\n\n• Ama bir kayıtsız rolü ayarlamak isterseniz **${prefix}alınacak-rol @rol** yazabilirsiniz` : ""}`)
            let rol
            if (sunucudb.kayıt.secenek) rol = sunucudb.kayıt.normal || []
            else rol = [...(sunucudb.kayıt.erkek || []), ...(sunucudb.kayıt.kız || [])]
            if (member.roles.cache.has(kayıtsızrolid) && !rol.some(a => member.roles.cache.has(a))) return hata("Heyyy dur bakalım orada! Bu kişi zaten kayıtsıza atılmış durumda!")
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has("ManageNicknames")) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (!guildMe.permissions.has("ManageRoles")) return hata("Rolleri Yönet", "yetkibot")
            if (guild.roles.cache.get(kayıtsızrolid)?.position >= guildMe.roles.highest.position) return hata('Kayıtsız rolü benim rolümün sırasından yüksek olduğu için hiçbir işlem yapamadım')
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Kayıtsıza atmak istediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            
            let kontroltag = sunucudb.kayıt.tag
                , girişisim = sunucudb.kayıt.isimler.giris
                , isim
            if (girişisim) isim = girişisim.replace(/<tag>/g, (kontroltag ? kontroltag.slice(0, -1) : "")).replace(/<isim>/g, member.user.username).slice(0, 32)
            else isim = `${kontroltag || ""}${member.user.username}`.slice(0, 32);
            
            // Üyeyi kayıtsıza atma
            await member.edit({ roles: [kayıtsızrolid], nick: isim }).then(() => {
                let kl = sunucudb.kl[memberid] || []
                kl.unshift({ type: "ka", author: int.user.id, timestamp: Date.now() })
                sunucudb.kl[memberid] = kl
                int.message.reply(`• ⚒️ <@${member.id}> adlı kişi <@${int.user.id}> tarafından kayıtsıza atıldı!`).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                if (err?.code == 10007) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
                if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
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