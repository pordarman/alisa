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
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")

            if (args[0] === "sıfırla") {
                if (!guildDatabase.kayıt.modl) return hata("Moderasyon log kanalı zaten sıfırlanmış durumda")
                delete guildDatabase.kayıt.modl
                hata('Moderasyon log kanalı başarıyla sıfırlanmıştır', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            const kanal = msg.client.fetchChannel(args.join(" "), msg)
            if (!kanal) return hata(`Moderasyon log kanalını ayarlamak için **${prefix}log #kanal**\n\n• Sıfırlamak için ise **${prefix}log sıfırla** yazabilirsiniz`, "ne")
            if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
            if (guildDatabase.kayıt.modl === kanal.id) return hata("Moderasyon log kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
    
            guildDatabase.kayıt.modl = kanal.id
            hata('Moderasyon log kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
