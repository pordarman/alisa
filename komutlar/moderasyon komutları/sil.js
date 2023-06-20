const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: ["del", "mesajlarısil", "sil"],
    name: "mesajları sil",
    cooldown: 10,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("ManageMessages")) return hata("Mesajları Yönet", "yetki")
            if (!guildMe.permissions.has("ManageMessages")) return hata("Mesajları Yönet", "yetkibot")
            let sayı = Number(args[0])
            if (!Time.isNumber(sayı)) return hata(`Lütfen geçerli bir __sayı__ giriniz\n\n**Örnek**\n• ${prefix}sil 15\n• ${prefix}sil 500`)
            if (sayı == 0) return hata(`0 tane mesajı nasıl siliyim akıllım :)`)
            if (sayı < 1) sayı = -sayı
            if (sayı > 1000) return hata(`Lütfen girdiğiniz sayı değeri __1000'den küçük__ olsun`)

            sayı += 1
            let dongu = Math.floor(sayı / 100.01)
            , herDongudeSilinecekMesaj
            , silinenMesaj = 0
            if (sayı > 100) herDongudeSilinecekMesaj = 100
            else herDongudeSilinecekMesaj = sayı

            // Mesajları silme
            async function silinecekMesajlar(sm) {
                await msg.channel.bulkDelete(sm, true).then(async messages => {
                    let size = messages.size
                    dongu -= 1
                    sayı -= size
                    silinenMesaj += size
                    if (sayı == 0) return msg.reply({ content: `• <@${msg.author.id}>, __**${silinenMesaj - 1}**__ adet mesaj başarıyla silindi!` }).then(m => setTimeout(() => m.delete().catch(errr => { }), 8000)).catch(err => { })
                    if (dongu != 0) {
                        if (size < 100) return msg.reply({ content: `• <@${msg.author.id}>, __**${silinenMesaj - 1}**__ adet mesaj başarıyla silindi fakat daha önceki mesajları silmeye iznim yok :(` }).catch(err => { })
                        if (sayı > 100) herDongudeSilinecekMesaj = 100
                        else herDongudeSilinecekMesaj = sayı
                        return await silinecekMesajlar(herDongudeSilinecekMesaj)
                    }
                    return msg.reply({ content: `• <@${msg.author.id}>, __**${silinenMesaj}**__ adet mesaj başarıyla silindi!` }).then(m => setTimeout(() => m.delete().catch(errr => { }), 8000)).catch(err => { })
                }).catch(async err => {
                    console.log(err)
                    try {
                        return msg.reply({ content: `• <@${msg.author.id}>, bir hata oluştu!\n` + "```js\n" + err + "```" }).catch(err1 => { })
                    } catch (e) { }
                })
            }
            return await silinecekMesajlar(herDongudeSilinecekMesaj)
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}