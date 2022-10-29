const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "tagrol log",
    kod: "tagrol-log",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let tagroldb = msg.client.t(sunucuid, sunucudb.kayıt.tag)
            if (args[0] === "sıfırla") {
                if (!tagroldb.log) return hata("Tagrol log kanalı zaten sıfırlanmış durumda")
                delete tagroldb.log
                hata('Tagrol log kanalı başarıyla sıfırlanmıştır', "b")
                db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                return;
            }
            const kanal = msg.client.fetchChannel(args.join(" "), msg)
            if (!kanal) return hata(`Tagrol log kanalını ayarlamak için **${prefix}tagrol-log #kanal**\n\n• Sıfırlamak için **${prefix}tagrol-log sıfırla** yazabilirsiniz`, "ne")
            if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
            if (tagroldb.log === kanal.id) return hata("Tagrol log kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
            tagroldb.log = kanal.id
            hata('Tagrol log kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
            db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


