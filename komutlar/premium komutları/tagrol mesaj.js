const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 15,
    name: "tagrol mesaj",
    aliases: "tagrol-mesaj",
    pre: true,
    /**
     * @param {import("../../typedef").exportsRunCommands} param0
    */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, sonradan, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")

            let tagroldb = msg.client.tagrolDatabase(sunucuid, sunucudb.kayıt.tag)
            async function yazmesaje() {
                db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now(), f: "mesaje" }, "tagrol mesaj", "diğerleri")
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "tagrol mesaj", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!tagroldb.mesaje) return msg.reply({ content: "Birisi tag alınca atılacak mesajı zaten sıfırlanmış durumda" }).catch(() => { })
                        delete tagroldb.mesaje
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş tag mesajı başarıyla sıfırlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        msg.channel.send({ content: `• <@${msg.author.id}> adlı üye tagımızı **( ${taglar} )** aldı! Ona hoşgeldin diyelim! 🎉` })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    }
                    if (ms.content.length > 1500) return ms.reply({ content: 'Karakter sayısı çok fazla lütfen karakter sayınızı **1500**\'ün altında tutmaya çalışın' }).catch(() => { })
                    if (ms.content.length) {
                        tagroldb.mesaje = { yazı: ms.content }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş tagrol mesajı başarıyla ayarlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        var atılacakMesajEkleme = ms.content
                            .replace(/<tag>/g, taglar)
                            .replace(/<toplam>/g, tagsize)
                            .replace(/<emojiToplam>/g, msg.client.stringToEmojis(tagsize))
                            .replace(/<üye>/g, `<@${msg.author.id}>`)
                            .replace(/<üyeİsim>/g, msg.author.username)
                            .replace(/<üyeI[dD]>/g, msg.author.id)
                            .replace(/<üyeTag>/g, msg.author.tag)
                            .replace(/<rol>/g, tagroldb.rol ? "<@&" + tagroldb.rol + ">" : "__**ROL AYARLI DEĞİL**__")
                        msg.channel.send({ content: atılacakMesajEkleme })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            async function yazmesajk() {
                db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now(), f: "mesajk" }, "tagrol mesaj", "diğerleri")
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "tagrol mesaj", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!tagroldb.mesajk) return msg.reply({ content: "Birisi tag bırakınca atılacak mesajı zaten sıfırlanmış durumda" }).catch(() => { })
                        delete tagroldb.mesajk
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş tag mesajı başarıyla sıfırlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        msg.channel.send({ content: `• <@${msg.author.id}> adlı üye tagımızı **( ${taglar} )** bıraktı... :(` })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    }
                    if (ms.content.length > 1500) return ms.reply({ content: 'Karakter sayısı çok fazla lütfen karakter sayınızı **1500**\'ün altında tutmaya çalışın' }).catch(() => { })
                    if (ms.content.length) {
                        tagroldb.mesajk = { yazı: ms.content }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş tagrol mesajı başarıyla ayarlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        var atılacakMesajEkleme = ms.content
                            .replace(/<tag>/g, taglar)
                            .replace(/<toplam>/g, tagsize)
                            .replace(/<emojiToplam>/g, msg.client.stringToEmojis(tagsize))
                            .replace(/<üye>/g, `<@${msg.author.id}>`)
                            .replace(/<üyeİsim>/g, msg.author.username)
                            .replace(/<üyeI[dD]>/g, msg.author.id)
                            .replace(/<üyeTag>/g, msg.author.tag)
                            .replace(/<rol>/g, tagroldb.rol ? "<@&" + tagroldb.rol + ">" : "__**ROL AYARLI DEĞİL**__")
                        msg.channel.send({ content: atılacakMesajEkleme })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    // console.log(err)
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            async function yazdmesaje() {
                db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now(), f: "dmesaje" }, "tagrol mesaj", "diğerleri")
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "tagrol mesaj", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!tagroldb.dmesaje) return msg.reply({ content: "Birisi tag alınca dm'den atacağım mesaj zaten sıfırlanmış durumda" }).catch(() => { })
                        delete tagroldb.dmesaje
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş dm\'den yazacağım tag mesajı başarıyla sıfırlandı! Artık birisi tag'ımızı alınca ona özelden yazmayacağım` }).catch(() => { })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    }
                    if (ms.content.length) {
                        tagroldb.dmesaje = { yazı: ms.content }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş dm\'den yazacağım tagrol mesajı başarıyla ayarlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        var atılacakMesajEkleme = ms.content
                            .replace(/<tag>/g, taglar)
                            .replace(/<sunucuAdı>/g, guild.name)
                            .replace(/<üye>/g, `<@${msg.author.id}>`)
                            .replace(/<üyeİsim>/g, msg.author.username)
                            .replace(/<üyeI[dD]>/g, msg.author.id)
                            .replace(/<üyeTag>/g, msg.author.tag)
                        msg.channel.send({ content: atılacakMesajEkleme })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    // console.log(err)
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            async function yazdmesajk() {
                db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now(), f: "dmesajk" }, "tagrol mesaj", "diğerleri")
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "tagrol mesaj", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!tagroldb.dmesajk) return msg.reply({ content: "Birisi tag bırakınca dm'den atacağım mesaj zaten sıfırlanmış durumda" }).catch(() => { })
                        delete tagroldb.dmesajk
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş dm\'den yazacağım tag mesajı başarıyla sıfırlandı! Artık birisi tag'ımızı bırakınca ona özelden yazmayacağım` }).catch(() => { })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    }
                    if (ms.content.length) {
                        tagroldb.dmesajk = { yazı: ms.content }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş dm\'den yazacağım tagrol mesajı başarıyla ayarlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        var atılacakMesajEkleme = ms.content
                            .replace(/<tag>/g, taglar)
                            .replace(/<sunucuAdı>/g, guild.name)
                            .replace(/<üye>/g, `<@${msg.author.id}>`)
                            .replace(/<üyeİsim>/g, msg.author.username)
                            .replace(/<üyeI[dD]>/g, msg.author.id)
                            .replace(/<üyeTag>/g, msg.author.tag)
                        msg.channel.send({ content: atılacakMesajEkleme })
                        db.yaz(sunucuid, tagroldb, "tag rol", "diğerleri")
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    // console.log(err)
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            if (sonradan) {
                var tagsize = (await msg.client.getMembers(msg)).filter(a => a.user.username.includes(tagroldb.tag) || a.user.discriminator == tagroldb.dis).size.toString()
                    , taglar = []
                if (tagroldb.tag) taglar.push(tagroldb.tag)
                if (tagroldb.dis) taglar.push(`#${tagroldb.dis}`)
                taglar = taglar.join(" - ") || "**TAG YOK**"
                switch (sonradan.f) {
                    case "mesaje":
                        return await yazmesaje()
                    case "mesajk":
                        return await yazmesajk()
                    case "dmesaje":
                        return await yazdmesaje()
                    default:
                        return await yazdmesajk()
                }
            }
            if (args[0] == "+") {
                var tagsize = (await msg.client.getMembers(msg)).filter(a => a.user.username.includes(tagroldb.tag) || a.user.discriminator == tagroldb.dis).size.toString()
                var taglar = []
                if (tagroldb.tag) taglar.push(tagroldb.tag)
                if (tagroldb.dis) taglar.push(`#${tagroldb.dis}`)
                taglar = taglar.join(" - ") || "**TAG YOK**"
                const embed = new EmbedBuilder()
                    .setTitle("Şimdi düşünme zamanı")
                    .setDescription(`• İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <üye>** => Kişiyi etiketler - ( <@${msg.author.id}> )\n**• <üyeTag>** => Kişinin tüm adını yazar - ( ${msg.author.tag} )\n**• <üyeİsim>** => Kişinin adını yazar - ( ${msg.author.username} )\n**• <üyeID>** => Kişinin ID'sini yazar - ( ${msg.author.id} )\n**• <toplam>** => Toplam taglı üye sayısını yazar - ( ${tagsize} )\n**• <emojiToplam>** => Toplam taglı üye sayısını emojili yazar - ( ${msg.client.stringToEmojis(tagsize)} )\n**• <rol>** => Verilen rolü etiketler (Bu role sahip olanlara bildirim gitmez) - ( ${tagroldb.rol ? "<@&" + tagroldb.rol + ">" : "__**ROL AYARLI DEĞİL**__"} )\n**• <tag>** => Üyenin aldığı tag(ları) gösterir - ( ${taglar} )`)
                    .setColor("Blue")
                    .setFooter({ text: 'Cevap vermek için 8 dakikanız vardır' })
                msg.reply({ embeds: [embed] }).catch(() => { })
                return await yazmesaje()
            } else if (args[0] == "-") {
                var tagsize = (await msg.client.getMembers(msg)).filter(a => a.user.username.includes(tagroldb.tag) || a.user.discriminator == tagroldb.dis).size.toString()
                var taglar = []
                if (tagroldb.tag) taglar.push(tagroldb.tag)
                if (tagroldb.dis) taglar.push(`#${tagroldb.dis}`)
                taglar = taglar.join(" - ") || "**TAG YOK**"
                const embed = new EmbedBuilder()
                    .setTitle("Şimdi düşünme zamanı")
                    .setDescription(`• İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <üye>** => Kişiyi etiketler - ( <@${msg.author.id}> )\n**• <üyeTag>** => Kişinin tüm adını yazar - ( ${msg.author.tag} )\n**• <üyeİsim>** => Kişinin adını yazar - ( ${msg.author.username} )\n**• <üyeID>** => Kişinin ID'sini yazar - ( ${msg.author.id} )\n**• <toplam>** => Toplam taglı üye sayısını yazar - ( ${tagsize} )\n**• <emojiToplam>** => Toplam taglı üye sayısını emojili yazar - ( ${msg.client.stringToEmojis(tagsize)} )\n**• <rol>** => Verilen rolü etiketler (Bu role sahip olanlara bildirim gitmez) - ( ${tagroldb.rol ? "<@&" + tagroldb.rol + ">" : "__**ROL AYARLI DEĞİL**__"} )\n**• <tag>** => Üyenin aldığı tag(ları) gösterir - ( ${taglar} )`)
                    .setColor("Blue")
                    .setFooter({ text: 'Cevap vermek için 8 dakikanız vardır' })
                msg.reply({ embeds: [embed] }).catch(() => { })
                return await yazmesajk()
            } else if (args[0] == "dm") {
                if (args[1] == "+") {
                    var taglar = []
                    if (tagroldb.tag) taglar.push(tagroldb.tag)
                    if (tagroldb.dis) taglar.push(`#${tagroldb.dis}`)
                    taglar = taglar.join(" - ") || "**TAG YOK**"
                    const embed = new EmbedBuilder()
                        .setTitle("Şimdi düşünme zamanı")
                        .setDescription(`• İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <sunucuAdı>** => Sunucu adını yazar - ( ${guild.name} )\n**• <üye>** => Kişiyi etiketler - ( <@${msg.author.id}> )\n**• <üyeTag>** => Kişinin tüm adını yazar - ( ${msg.author.tag} )\n**• <üyeİsim>** => Kişinin adını yazar - ( ${msg.author.username} )\n**• <üyeID>** => Kişinin ID'sini yazar - ( ${msg.author.id} )\n**• <tag>** => Üyenin aldığı tag(ları) gösterir - ( ${taglar} )`)
                        .setColor("Blue")
                        .setFooter({ text: 'Cevap vermek için 8 dakikanız vardır' })
                    msg.reply({ embeds: [embed] }).catch(() => { })
                    return await yazdmesaje()
                } else if (args[1] == "-") {
                    var taglar = []
                    if (tagroldb.tag) taglar.push(tagroldb.tag)
                    if (tagroldb.dis) taglar.push(`#${tagroldb.dis}`)
                    taglar = taglar.join(" - ") || "**TAG YOK**"
                    const embed = new EmbedBuilder()
                        .setTitle("Şimdi düşünme zamanı")
                        .setDescription(`• İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Değişkenler**\n**• <sunucuAdı>** => Sunucu adını yazar - ( ${guild.name} )\n**• <üye>** => Kişiyi etiketler - ( <@${msg.author.id}> )\n**• <üyeTag>** => Kişinin tüm adını yazar - ( ${msg.author.tag} )\n**• <üyeİsim>** => Kişinin adını yazar - ( ${msg.author.username} )\n**• <üyeID>** => Kişinin ID'sini yazar - ( ${msg.author.id} )\n**• <tag>** => Üyenin aldığı tag(ları) gösterir - ( ${taglar} )`)
                        .setColor("Blue")
                        .setFooter({ text: 'Cevap vermek için 8 dakikanız vardır' })
                    msg.reply({ embeds: [embed] }).catch(() => { })
                    return await yazdmesajk()
                }
                return hata(`Birisi tag alınca atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj +**\nBirisi tag alınca ona dm'den atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj dm +**\n\nBirisi tagı bırakınca atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj -**\nBirisi tagı bırakınca dm'den atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj dm -** yazabilirsiniz`, "ne")
            }
            return hata(`Birisi tag alınca atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj +**\nBirisi tag alınca ona dm'den atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj dm +**\n\nBirisi tagı bırakınca atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj -**\nBirisi tagı bırakınca dm'den atacağım mesajı özelleştirmek için **${prefix}tagrol-mesaj dm -** yazabilirsiniz`, "ne")
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}