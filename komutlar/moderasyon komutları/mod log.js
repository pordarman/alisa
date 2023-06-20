const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "mod log",
    aliases: ["modlog", "mod-log"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!sunucudb.kayıt.modl) return hata("Moderasyon log kanalı zaten sıfırlanmış durumda")
                delete sunucudb.kayıt.modl
                hata('Moderasyon log kanalı başarıyla sıfırlanmıştır', "b")
                db.yazdosya(sunucudb, sunucuid)
                return;
            }
            const kanal = msg.client.fetchChannel(args.join(" "), msg)
            if (!kanal) return hata(`Moderasyon log kanalını ayarlamak için **${prefix}log #kanal**\n\n• Sıfırlamak için ise **${prefix}log sıfırla** yazabilirsiniz`, "ne")
            if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
            if (sunucudb.kayıt.modl === kanal.id) return hata("Moderasyon log kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
    
            sunucudb.kayıt.modl = kanal.id
            hata('Moderasyon log kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
