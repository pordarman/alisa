const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "seçenek",
    kod: ["secenek", "seç", "seçenek", "tip"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            switch (args[0]) {
                case "cinsiyet":
                case "cin":
                case "c": {
                    if (!sunucudb.kayıt.secenek) return hata('Bu sunucudaki kayıt seçeneğim zaten __**Cinsiyet**__ olarak ayarlı')
                    msg.client.secenek.delete(sunucuid)
                    delete sunucudb.kayıt.normal
                    delete sunucudb.kayıt.secenek
                    hata('Bu sunucudaki kayıt seçeneğim başarıyla __**Cinsiyet**__ olarak ayarlandı', "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }
                case "normal":
                case "nor":
                case "n": {
                    if (sunucudb.kayıt.secenek) return hata('Bu sunucudaki kayıt seçeneğim zaten __**Normal Kayıt**__ olarak ayarlı')
                    msg.client.secenek.add(sunucuid)
                    delete sunucudb.kayıt.erkek
                    delete sunucudb.kayıt.kız
                    sunucudb.kayıt.secenek = true
                    hata('Bu sunucudaki kayıt seçeneğim başarıyla __**Normal Kayıt**__ olarak ayarlandı', "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }
                default:
                    return hata(`Kayıt seçeneğini normal olarak ayarlamak için **${prefix}seç normal**\nCinsiyet olarak ayarlamak için **${prefix}seç cinsiyet** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
