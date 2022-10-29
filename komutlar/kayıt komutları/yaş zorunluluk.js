const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    kod: ["yaszorunlu", "yaşzorunlu", "yaş-zorunlu", "yaşzorunluluk", "yaş-zorunluluk"],
    name: "yaş zorunluluk",
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
                    if (sunucudb.kayıt.yaszorunlu) return hata("Bu sunucuda yaş zorunluluğu zaten açık durumda")
                    sunucudb.kayıt.yaszorunlu = true
                    hata("Yaş zorunluluğu başarıyla aktif edildi", "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                case "kapat":
                case "kapalı":
                case "deaktif":
                    if (!sunucudb.kayıt.yaszorunlu) return hata("Bu sunucuda yaş zorunluluğu zaten kapalı durumda")
                    delete sunucudb.kayıt.yaszorunlu
                    hata("Yaş zorunluluğu başarıyla deaktif edildi", "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                default:
                    return hata(`Yaş zorunluluğunu aktif etmek için **${prefix}yaşzorunlu açık**\n\n• Kapatmak için ise **${prefix}yaşzorunlu kapalı** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}