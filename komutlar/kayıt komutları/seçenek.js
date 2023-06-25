const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "seçenek",
    aliases: ["secenek", "seç", "seçenek", "tip"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            
            switch (args[0]) {
                case "cinsiyet":
                case "cin":
                case "c": {
                    if (!guildDatabase.kayıt.secenek) return hata('Bu sunucudaki kayıt seçeneğim zaten __**Cinsiyet**__ olarak ayarlı')
                    msg.client.secenek.delete(guildId)
                    delete guildDatabase.kayıt.normal
                    delete guildDatabase.kayıt.secenek
                    hata('Bu sunucudaki kayıt seçeneğim başarıyla __**Cinsiyet**__ olarak ayarlandı', "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                case "normal":
                case "nor":
                case "n": {
                    if (guildDatabase.kayıt.secenek) return hata('Bu sunucudaki kayıt seçeneğim zaten __**Normal Kayıt**__ olarak ayarlı')
                    msg.client.secenek.add(guildId)
                    delete guildDatabase.kayıt.erkek
                    delete guildDatabase.kayıt.kız
                    guildDatabase.kayıt.secenek = true
                    hata('Bu sunucudaki kayıt seçeneğim başarıyla __**Normal Kayıt**__ olarak ayarlandı', "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                }
                default:
                    return hata(`Kayıt seçeneğini normal olarak ayarlamak için **${prefix}seç normal**\nCinsiyet olarak ayarlamak için **${prefix}seç cinsiyet** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
