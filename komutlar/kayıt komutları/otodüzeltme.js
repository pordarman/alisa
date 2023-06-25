const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["otoduzeltme", "otodüzeltme", "oto-düzeltme"],
    name: "oto düzeltme",
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")            
            
            switch (args[0]) {
                case "aç":
                case "açık":
                case "aktif":
                    if (guildDatabase.kayıt.otoduzeltme) return hata("Bu sunucuda otomatik isim düzeltmesi zaten açık durumda")
                    guildDatabase.kayıt.otoduzeltme = true
                    hata("Oto isim düzeltmesi başarıyla aktif edildi", "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                case "kapat":
                case "kapalı":
                case "deaktif":
                    if (!guildDatabase.kayıt.otoduzeltme) return hata("Bu sunucuda otomatik isim düzeltmesi zaten kapalı durumda")
                    delete guildDatabase.kayıt.otoduzeltme
                    hata("Oto isim düzeltmesi başarıyla deaktif edildi", "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                default:
                    return hata(`Oto isim düzetlmesini aktif etmek için **${prefix}otodüzeltme açık**\n\n• Kapatmak için ise **${prefix}otodüzeltme kapalı** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}