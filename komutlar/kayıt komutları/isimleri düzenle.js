const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["isim-ozel", "isim-özel", "isimleridüzenle", "idüzenle", "isimdüzenle", "isimd", "isimözel", "özel-isim"],
    name: "isimleri düzenle",
    cooldown: 5,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            if (!args[0]) return hata(`Yeni gelen kullanıcının ismini düzenlemek için **${prefix}isim-özel giriş**\n• Birisini kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıt**\n\n• Bir __botu__ kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıtbot** yazabilirsiniz`, "ne", 30000)
            
            if (args[0] == "kayıt") {
                if (!args[1]) return hata(`Buradaki değişkenleri kullanarak kayıt edilen kişinin ismini daha güzel bir hale getirebilirsin :)\n• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel kayıt sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <tag>** => Sunucunun tagını ekler - ( ${sunucudb.kayıt.tag || "Tag yok "})\n**• <isim>** => Girdiğiniz ismi ekler - ( Ali )\n**• <tag>** => Eğer yaşını girdiyseniz yaşını ekler, girmediyseniz hiçbir şey eklemez - ( 19 )\n\n**Örnek**\n• ${prefix}isim-özel kayıt <tag> <isim> [<yaş>]\n• ${prefix}isim-özel kayıt ♫ <isim> | <yaş> <tag>`, "ne", 30000)
                if (args[1] == "sıfırla") {
                    delete sunucudb.kayıt.isimler.kayıt
                    msg.reply({ content: `Birisini kayıt ettikten sonra düzenlenecek isim başarıyla sıfırlandı!` }).catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }
                const girilenKomut = args.slice(1).join(" ")
                sunucudb.kayıt.isimler.kayıt = girilenKomut
                let tag = sunucudb.kayıt.tag || " "
                msg.reply({ content: `Birisini kayıt ettikten sonra düzenlenecek isim başarıyla ayarlandı! Bu isim düzenleme işlemi botları etkilemez!!\n\n**Şöyle gözükecek**` }).catch(err => { })
                msg.channel.send({ content: girilenKomut.replace(/<tag>/g, tag.slice(0, -1)).replace(/<isim>/g, "Ali").replace(/<yaş>/g, "19") }).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
            } else if (args[0] == "giriş") {
                if (!args[1]) return hata(`Buradaki değişkenleri kullanarak sunucuya giren kişinin ismini daha güzel bir hale getirebilirsin :)\n• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel giriş sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <tag>** => Sunucunun tagını ekler - ( ${sunucudb.kayıt.tag || "Tag yok "})\n**• <isim>** => Kullanıcının ismini ekler - ( ${msg.author.username} )\n\n**Örnek**\n• ${prefix}isim-özel giriş <tag> <isim>\n• ${prefix}isim-özel giriş ♫ <isim> | <tag>`, "ne", 30000)
                if (args[1] == "sıfırla") {
                    delete sunucudb.kayıt.isimler.giris
                    msg.reply({ content: `Sunucuya yeni girecek kişinin isminin düzenlenmesi başarıyla sıfırlandı!` }).catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }
                const girilenKomut = args.slice(1).join(" ")
                sunucudb.kayıt.isimler.giris = girilenKomut
                let tag = sunucudb.kayıt.tag || " "
                msg.reply({ content: `Sunucuya yeni kullanıcı geldikten sonra düzenlenecek isim başarıyla ayarlandı! Bu isim düzenleme işlemi botları etkilemez!!\n\n• ‼️ **Uyarı!** Bu isim düzenleme sadece __**kayıt kanalı**__ ayarlı olduğu zaman düzenlenecektir${sunucudb.kayıt.kanal ? "" : `• Kayıt kanalını ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz`}\n\n**Şöyle gözükecek**` }).catch(err => { })
                msg.channel.send({ content: girilenKomut.replace(/<tag>/g, tag.slice(0, -1)).replace(/<isim>/g, msg.author.username) }).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
            } else if (args[0] == "kayıtbot") {
                if (!args[1]) return hata(`Buradaki değişkenleri kullanarak kayıt edilen __botun__ ismini daha güzel bir hale getirebilirsin :)\n• Eğer sıfırlamak istiyorsanız **${prefix}isim-özel kayıtbot sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <tag>** => Sunucunun tagını ekler - ( ${sunucudb.kayıt.tag || "Tag yok "})\n**• <isim>** => Botun ismini ekler - ( ${msg.client.user.username} )\n\n**Örnek**\n• ${prefix}isim-özel kayıtbot <tag> <isim>\n• ${prefix}isim-özel kayıtbot ♫ <isim> | <tag>`, "ne", 30000)
                if (args[1] == "sıfırla") {
                    delete sunucudb.kayıt.isimler.kayıtbot
                    msg.reply({ content: `Bir __botu__ kayıt ettikten sonra düzenlenecek isim başarıyla sıfırlandı!` }).catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                }
                const girilenKomut = args.slice(1).join(" ")
                sunucudb.kayıt.isimler.kayıtbot = girilenKomut
                let tag = sunucudb.kayıt.tag || " "
                msg.reply({ content: `Bir __botu__ kayıt ettikten sonra düzenlenecek isim başarıyla ayarlandı! Bu isim düzenleme işlemi sadece botları etkiler!!\n\n**Şöyle gözükecek**` }).catch(err => { })
                msg.channel.send({ content: girilenKomut.replace(/<tag>/g, tag.slice(0, -1)).replace(/<isim>/g, msg.client.user.username) }).catch(err => { })
                db.yazdosya(sunucudb, sunucuid)
                return;
            } else return hata(`Yeni gelen kullanıcının ismini düzenlemek için **${prefix}isim-özel giriş**\n• Birisini kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıt**\n\n• Bir __botu__ kayıt ettikten sonraki ismini düzenlemek için **${prefix}isim-özel kayıtbot** yazabilirsiniz`, "ne", 30000)
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}