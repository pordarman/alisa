const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 15,
    name: "özel",
    kod: ["ozel", "özel", "özelmesaj", "özelgiriş", "özelgirişmesaj"],
    /**
     * @param {import("../../typedef").exportsRunCommands} param0
     */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, sonradan, guild, msgMember, guildMe }) {
        try {
            async function yaz() {
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "özel", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!sunucudb.kayıt.özel) return msg.reply({ content: "Özelleştirilmiş giriş mesajı zaten ayarlı değil" }).catch(() => { })
                        delete sunucudb.kayıt.özel
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş giriş mesajı başarıyla sıfırlandı` }).catch(() => { })
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    }
                    if (ms.content.length > 3000) return ms.reply({ content: 'Karakter sayısı çok fazla lütfen karakter sayınızı **3000**\'in altında tutmaya çalışın' }).catch(() => { })
                    if (ms.content.length) {
                        let embedlimi = ms.content.includes("<kutusuz>")
                        let image = ms.attachments.first()?.proxyURL || (ms.content.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/i) || [])[0]
                        sunucudb.kayıt.özel = { yazı: ms.content.replace(`<kutusuz>`, "").replace(image, ""), embed: embedlimi, im: image }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş giriş mesajı başarıyla ayarlandı. Nasıl göründüğüne bakmak için **${prefix}fake** yazabilirsiniz` }).catch(() => { })
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    // console.log(err)
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            if (sonradan) return await yaz()
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            if (db.bul(sunucuid, "özel", "diğerleri")) return hata(`Heyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor!`)
            db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now() }, "özel", "diğerleri")
            const kisi = guild.memberCount
            const ao = Date.now()
            if (msg.author.createdTimestamp > (ao - 1209600000)) var güvenlik = `Güvensiz ${ayarlar.emoji.guvensiz}`
            else if (msg.author.createdTimestamp > (ao - 2592000000)) var güvenlik = `Şüpheli ${ayarlar.emoji.supheli}`
            else var güvenlik = `Güvenli ${ayarlar.emoji.guvenli}`
            const embed = new EmbedBuilder()
                .setTitle("Şimdi düşünme zamanı")
                .setDescription(`• İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Giriş mesajının kutusuz olmasını istiyorsanız yazacağın mesajın başına <kutusuz> yazman yeterli!**\n\n**Değişkenler**\n**• <sunucuAdı>** => Sunucu adını yazar - ( ${guild.name} ) \n**• <rol>** => Yetkili rolünü etiketler - ( ${sunucudb.kayıt.yetkili ? "<@&" + sunucudb.kayıt.yetkili + ">" : "__**ROL AYARLI DEĞİL**__"} )\n**• <üye>** => Gelen kişiyi etiketler - ( <@${msg.author.id}> )\n**• <üyeTag>** => Gelen kişinin tüm adını yazar - ( ${msg.author.tag} )\n**• <üyeİsim>** => Gelen kişinin adını yazar - ( ${msg.author.username} )\n**• <üyeID>** => Gelen kişinin ID'sini yazar - ( ${msg.author.id} )\n**• <toplam>** => Sunucunun toplam üye sayısını yazar - ( ${kisi.toLocaleString().replace(/\./, ",")} )\n**• <emojiToplam>** => Sunucunun toplam üye sayısını emojili halde yazar - ( ${msg.client.stringToEmojis(kisi)} )\n**• <tarih>** => Hesabın kuruluş tarihini yazar - ( <t:${(msg.author.createdTimestamp / 1000).toFixed(0)}:F> )\n**• <tarih2>** => Hesabın kuruluş tarihini yazar - ( <t:${(msg.author.createdTimestamp / 1000).toFixed(0)}:R> )\n**• <tarih3>** => Hesabın kuruluş tarihini yazar - ( ${Time.toDateStringForAlisa(msg.author.createdTimestamp)} )\n**• <güvenlik>** => Güvenli olup olmadığını gösterir - ( ${güvenlik})`)
                .setImage("https://i.hizliresim.com/hjv5aum.png")
                .setColor("Blue")
                .setFooter({ text: 'Cevap vermek için 8 dakikanız vardır' })
            msg.reply({ embeds: [embed] }).catch(() => { })
            await yaz()
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}