const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "tagrol dis",
    kod: "tagrol-dis",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")            
            let tagroldb = msg.client.t(sunucuid, sunucudb.kayıt.tag)
            let bilgi = () => hata(`Tagrol Discriminator'ü ayarlamak için **${prefix}tagrol-dis <sayı (4 basamaklı)>**\n• Sıfırlamak için ise **${prefix}tagrol-dis sıfırla** yazabilirsiniz\n\n**Örnek**\n• ${prefix}tagrol-dis 0001\n• ${prefix}tagrol-dis #0001`, "h", 30000, { fields: [{ name: "Peki nedir bu Discriminator?", value: "Discriminator aynı isme sahip kullanıcıların birbirine karıştırılmaması için yapılmış bir özelliktir" }, { name: "Peki Discriminator nerde bulunur?", value: "Aslında discord'u kullanan bütün kullanıcılarda bulunur. Kullanıcı adınızın **#** karakterinden sonra 4 basamaklı bir sayı bulunur ve buna __discriminator__ denir" }], image: "https://i.hizliresim.com/jworoog.png" })
            if (!args[0]) return bilgi()
            if (args[0] == "sıfırla") {
                if (!tagroldb.dis && !sunucudb.kayıt.dis) return hata("Bu sunucudaki Discriminator tagı zaten sıfırlanmış durumda")
                delete tagroldb.dis
                delete sunucudb.kayıt.dis
                hata("Discriminator tagı başarıyla sıfırlandı", "b")
                db.yazdosya(sunucudb, sunucuid)
                db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                return;
            }
            const arg = args[0].replace("#", "")
            if (isNaN(arg) || arg.length != 4) return bilgi()
            if (arg == "0000") return hata(`**#0000** etiket tagına hiç kimse sahip olamaz seni şapşik şey seni :)`)
            tagroldb.dis = arg
            sunucudb.kayıt.dis = arg
            hata(`Discriminator tagı başarıyla ayarlandı! Artık birisi **#${arg}** etiket tagını alınca ona tagrol rolünü vereceğim`, "b")
            db.yazdosya(sunucudb, sunucuid)
            db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}

