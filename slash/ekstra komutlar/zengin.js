const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "zengin",
    data: new SlashCommandBuilder()
        .setName("zengin")
        .setDescription("Eğer sunucuya boost bastıysanız isminizi değiştirebilirsiniz")
        .addStringOption(option => option.setName("isim").setDescription("yeni isim").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {

            // Kontroller
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageNicknames')) return hata(`Kullanıcı Adlarını Yönet`, "yetkibot")
            const member = int.member
            if (!member.premiumSinceTimestamp && !member.permissions.has("ChangeNickname")) return hata(" **ya** sunucuya boost basmalısın **ya da** Kullanıcı Adı Değiştir", "yetki")
            if (member.id === guild.ownerId) return hata(`Sunucu sahibinin ismini değiştiremem :(`)
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Sizin rolünüzün sırası benim rolümün sırasından yüksek olduğu için sizin isminizi değiştiremem`)
            
            let tag = sunucudb.kayıt.tag
            , kayıtisim = sunucudb.kayıt.isimler.kayıt
            , isim
            , yeniisim = int.options.getString("isim", true)
            if (kayıtisim) {
                if (kayıtisim.indexOf("<yaş>") != -1) {
                    let age = yeniisim.match(int.client.regex.fetchAge)
                    if (age) yeniisim = yeniisim.replace(age[0], "").replace(/ +/g, " ").trim()
                    else age = [""]
                    isim = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, yeniisim).replace(/<yaş>/g, age[0])
                } else isim = kayıtisim.replace(/isim>/g, yeniisim).replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/ +/g, " ").trim()
            } else isim = `${tag || ""}${yeniisim}`
            if (isim.length > 32) return hata(`Sunucu ismi 32 karakterden fazla olamaz lütfen daha kısa yazınız`)

            // Üyenin ismini değiştirme
            await member.setNickname(isim).then(() => int.reply({ content: `• Yeni ismin başarıyla **${isim}** oldu!` }).catch(err => { })).catch(err => {
                console.log(err)
                hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}