const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "tagrol kanal",
    kod: "tagrol-kanal",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let tagroldb = msg.client.t(sunucuid, sunucudb.kayıt.tag)
            if (args[0] === "sıfırla") {
                if (!tagroldb.kanal) return hata("Tagrol kanalı zaten sıfırlanmış durumda")
                delete tagroldb.kanal
                hata('Tagrol kanalı başarıyla sıfırlanmıştır', "b")
                db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                return;
            }
            const kanal = msg.client.fetchChannel(args.join(" "), msg)
            if (!kanal) return hata(`Tagrol kanalını ayarlamak için **${prefix}tagrol-kanal #kanal**\n\n• Sıfırlamak için ise **${prefix}tagrol-kanal sıfırla** yazabilirsiniz`, "ne")
            if (kanal.type !== 0) return hata("Etiketlediğiniz kanal bir yazı kanalı değil")
            if (tagroldb.kanal === kanal.id) return hata("Tagrol kanalı zaten <#" + kanal.id + "> kanalı olarak ayarlı")
            tagroldb.kanal = kanal.id
            hata('Tagrol kanalı başarıyla <#' + kanal.id + '> olarak ayarlandı', "b")
            db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


