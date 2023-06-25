const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "zengin",
    aliases: ["zengin", "booster"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (!msgMember.premiumSinceTimestamp && !msgMember.permissions.has("ChangeNickname")) return hata(" **ya** sunucuya boost basmalısın **ya da** Kullanıcı Adı Değiştir", "yetki")
            if (msgMember.id === guild.ownerId) return hata(`Sunucu sahibinin ismini değiştiremem :(`)
            if (msgMember.roles.highest.position >= guildMe.roles.highest.position) return hata(`Sizin rolünüzün sırası benim rolümün sırasından yüksek olduğu için sizin isminizi değiştiremem`)
            if (!args[0]) return hata(`Lütfen yeni isminizi yazınız`)


            let tag = guildDatabase.kayıt.tag
            , kayıtisim = guildDatabase.kayıt.isimler.kayıt
            , isim
            , toLocaleLowerCase = msg.content.toLocaleLowerCase()
            , yeniisim = msg.content.slice(toLocaleLowerCase.search(/(?<= *(zengin|booster) ).+/i))
            if (kayıtisim) {
                if (kayıtisim.indexOf("<yaş>") != -1) {
                    let age = yeniisim.match(msg.client.regex.fetchAge)
                    if (age) yeniisim = yeniisim.replace(age[0], "").replace(/ +/g, " ").trim()
                    else age = [""]
                    isim = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, yeniisim).replace(/<yaş>/g, age[0])
                } else isim = kayıtisim.replace(/<isim>/g, yeniisim).replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/ +/g, " ").trim()
            } else isim = `${tag || ""}${yeniisim}`
            if (isim.length > 32) return hata(`Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz ve tekrar deneyiniz`)

            // Üyenin ismini değiştirme
            await msgMember.setNickname(isim).then(() => {
                msg.react(ayarlar.emoji.p).catch(err => { })
            }).catch(err => {
                console.log(err)
                msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
