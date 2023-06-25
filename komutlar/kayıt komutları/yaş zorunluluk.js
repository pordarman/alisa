const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["yaszorunlu", "yaşzorunlu", "yaş-zorunlu", "yaşzorunluluk", "yaş-zorunluluk"],
    name: "yaş zorunluluk",
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
                    if (guildDatabase.kayıt.yaszorunlu) return hata("Bu sunucuda yaş zorunluluğu zaten açık durumda")
                    guildDatabase.kayıt.yaszorunlu = true
                    hata("Yaş zorunluluğu başarıyla aktif edildi", "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                case "kapat":
                case "kapalı":
                case "deaktif":
                    if (!guildDatabase.kayıt.yaszorunlu) return hata("Bu sunucuda yaş zorunluluğu zaten kapalı durumda")
                    delete guildDatabase.kayıt.yaszorunlu
                    hata("Yaş zorunluluğu başarıyla deaktif edildi", "b")
                    db.yazdosya(guildDatabase, guildId)
                    return;
                default:
                    return hata(`Yaş zorunluluğunu aktif etmek için **${prefix}yaşzorunlu açık**\n\n• Kapatmak için ise **${prefix}yaşzorunlu kapalı** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}