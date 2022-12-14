const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    kod: ["otoduzeltme", "otodüzeltme", "oto-düzeltme"],
    name: "oto düzeltme",
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")            
            switch (args[0]) {
                case "aç":
                case "açık":
                case "aktif":
                    if (sunucudb.kayıt.otoduzeltme) return hata("Bu sunucuda otomatik isim düzeltmesi zaten açık durumda")
                    sunucudb.kayıt.otoduzeltme = true
                    hata("Oto isim düzeltmesi başarıyla aktif edildi", "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                case "kapat":
                case "kapalı":
                case "deaktif":
                    if (!sunucudb.kayıt.otoduzeltme) return hata("Bu sunucuda otomatik isim düzeltmesi zaten kapalı durumda")
                    delete sunucudb.kayıt.otoduzeltme
                    hata("Oto isim düzeltmesi başarıyla deaktif edildi", "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                default:
                    return hata(`Oto isim düzetlmesini aktif etmek için **${prefix}otodüzeltme açık**\n\n• Kapatmak için ise **${prefix}otodüzeltme kapalı** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}