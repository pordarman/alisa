const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "KAYIT_İSİM_DEĞİŞTİR",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let yetkilirolid = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.get(yetkilirolid) && !intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            } else if (!intMember.permissions.has("Administrator")) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            let memberid = int.customId.replace(this.name, "")
                , buttonCooldown = int.client.buttonCooldown.get("isim" + memberid + guildId)
            if (buttonCooldown) {
                if (buttonCooldown == int.user.id) return hata("Heyyy dur bakalım orada! Zaten şu anda bu işlemi gerçekleştiriyorsun!")
                return hata("Heyyy dur bakalım orada! Şu anda başkası bu kayıt işlemini gerçekleştiriyor!")
            }
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has("ManageNicknames")) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            int.client.buttonCooldown.set("isim" + memberid + guildId, int.user.id)
            const member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`İsmini değiştirmek istediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)

            let filter = m => m.author.id == int.user.id
            int.reply({ content: `• 📝 <@${int.user.id}>, ismini değiştimek istediğiniz <@${memberid}> adlı kişinin lütfen **SADECE İSMİNİ** yazınız`, files: [int.client.namePhoto.isim] }).catch(err => { })

            // Üyenin ismini değiştirme          
            await int.channel.awaitMessages({ filter: filter, time: 30000, max: 1 }).then(async message1 => {
                int.client.buttonCooldown.delete("isim" + memberid + guildId)
                const message = message1.first()
                if (message.content.length == 0) return message.reply("• Sanki bir isim yazmalıydın he, ne diyorsun?").catch(err => { })
                function UpperKelimeler(str) {
                    if (!guildDatabase.kayıt.otoduzeltme) {
                        let sembol = guildDatabase.kayıt.sembol
                        if (sembol) return str.replace(/ /g, " " + sembol)
                        else return str
                    }
                    var parcalar = str.match(/[\wöçşıüğÖÇŞİÜĞ]+/g)
                    if (!parcalar?.length) return str
                    parcalar.forEach(a => str = str.replace(a, a[0].toLocaleUpperCase() + a.slice(1).toLocaleLowerCase()))
                    let sembol = guildDatabase.kayıt.sembol
                    if (sembol) return str.replace(/ /g, " " + sembol)
                    else return str
                }
                let tag = guildDatabase.kayıt.tag
                    , kayıtisim = guildDatabase.kayıt.isimler.kayıt
                    , ismi
                    , sadeceisim = message.content.replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim()
                if (kayıtisim) {
                    if (kayıtisim.indexOf("<yaş>") != -1) {
                        let age = sadeceisim.match(int.client.regex.fetchAge)
                        if (age) sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
                        else if (guildDatabase.kayıt.yaszorunlu) return message.reply("• Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!").catch(err => { })
                        else age = [""]
                        ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim)).replace(/<yaş>/g, age[0])
                    } else ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim))
                } else {
                    if (guildDatabase.kayıt.yaszorunlu && sadeceisim.search(int.client.regex.fetchAge) == -1) return message.reply("• Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!").catch(err => { })
                    ismi = `${tag || ""}${UpperKelimeler(sadeceisim)}`
                }
                if (ismi.length > 32) return message.reply('• Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz').catch(err => { })
                await member.setNickname(ismi).then(() => {
                    message.react(ayarlar.emoji.p).catch(err => { })
                    message.reply(`• <@${member.id}> adlı kişinin ismini **${ismi}** olarak değiştirdim. Bir dahakine daha dikkatli ol <@${int.user.id}> :)`).catch(err => { })
                    let kl = guildDatabase.kl[memberid] || []
                    kl.unshift({ type: "i", newName: ismi, author: int.user.id, timestamp: Date.now() })
                    guildDatabase.kl[memberid] = kl
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }).catch(err => {
                    if (err?.code == 10007) return message.reply("• Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(").catch(err => { })
                    if (err?.code == 50013) return message.reply(`• <@${memberid}> adlı kişinin ismini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                    console.log(err)
                    message.react(ayarlar.emoji.p).catch(err => { })
                    return message.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```", ephemeral: true }).catch(err => { })
                })
            }).catch(() => {
                int.channel?.send(`⏰ <@${int.user.id}>, süreniz bitti!`).catch(err => { })
                int.client.buttonCooldown.delete("isim" + memberid + guildId)
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}