const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: ["yaşsınırı", "yaşsınır", "yaş-sınırı", "yaş-sınır"],
    name: "yaş sınır",
    cooldown: 3,
    pre: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            
            let yas = args[0]
            if (["kapat", "kapalı", "deaktif"].includes(yas)) {
                if (!sunucudb.kayıt.yassınır) return hata("Bu sunucuda yaş zorunluluğu zaten kapalı durumda")
                delete sunucudb.kayıt.yassınır
                hata("Yaş zorunluluğu başarıyla deaktif edildi", "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            if (!yas || !Time.isNumber(yas)) return hata(`Yaş sınırını ayarlamak için için **${prefix}yaşsınır <yaş>**\n\n• Kapatmak için ise **${prefix}yaşsınır kapat** yazabilirsiniz\n\n**Örnek**\n• ${prefix}yaşsınır 14\n• ${prefix}yaşsınır 9`)
            if (yas < 0) yas = String(-yas)
            if (yas > 99) return hata("Lütfen yaş aralığınızı 0-100 arasında tutunuz")
            sunucudb.kayıt.yassınır = +yas
            let ek;
            switch (yas[yas.length - 1]) {
                case "0":
                case "6":
                case "9":
                    ek = "dan"
                    break;
                case "1":
                case "2":
                case "7":
                case "8":
                    ek = "den"
                    break;
                case "3":
                case "4":
                case "5":
                    ek = "ten"
                    break;
            }
            hata(`Bundan sonra yaşı **${yas}'${ek}** küçük olanların kayıt edilmesine izin vermeyeceğim\n\n• ‼️ **Uyarı!** Bu ayar sadece __**yaş zorunluluğu**__ aktif ise çalışacaktır${!sunucudb.kayıt.yaszorunlu ? `\n• Yaş zorunluluğunu aktif etmek için **${prefix}yaşzorunlu açık** yazabilirsiniz` : ""}`, "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}