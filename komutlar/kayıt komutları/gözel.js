const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 15,
    name: "günlük özel",
    kod: ["gozel", "gözel", "günlüközel", "g-özel", "günlük-özel", "özel-günlük", "özelgünlük"],
    /**
     * @param {import("../../typedef").exportsRunCommands} param0
     */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, sonradan, guild, msgMember, guildMe }) {
        try {            
            async function yaz() {
                var filter = m => m.author.id === msg.author.id
                await msg.channel?.awaitMessages({ filter: filter, max: 1, time: 1000 * 60 * 8 }).then(a => {
                    db.sil(sunucuid, "gözel", "diğerleri")
                    let ms = a.first()
                    if (ms.content === 'iptal') return msg.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    if (ms.content.toLocaleLowerCase() === 'sıfırla') {
                        if (!sunucudb.kayıt.gözel) return msg.reply({ content: "Özelleştirilmiş günlük mesajı zaten ayarlı değil" }).catch(() => { })
                        delete sunucudb.kayıt.gözel
                        msg.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş günlük mesajı başarıyla sıfırlandı` }).catch(() => { })
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    }
                    let kutulu = ms.content.includes("<kutulu>")
                    if (ms.content.length > (kutulu ? 3000 : 1000)) return ms.reply({ content: `Karakter sayısı çok fazla lütfen karakter sayınızı **${(kutulu ? "3000" : "1000")}**'in altında tutmaya çalışın` }).catch(() => { })
                    if (ms.content.length) {
                        let yazı = ms.content.replace("<kutulu>", "")
                        sunucudb.kayıt.gözel = { yazı: yazı, embed: kutulu }
                        ms.reply({ content: `${ayarlar.emoji.p} Özelleştirilmiş günlük mesajı başarıyla ayarlandı\n\n**Şöyle gözükecek**` }).catch(() => { })
                        msg.channel.send(kutulu ? { content: ayarlar.k[Math.floor(Math.random() * ayarlar.k.length)].replace("<m>", `<@${msg.client.user.id}>`), embeds: [new EmbedBuilder().setTitle(`Aramıza hoşgeldin ${msg.client.user.username} ${ayarlar.emoji.selam}`).setDescription(yazı).setThumbnail(msg.client.user.displayAvatarURL()).setColor("Random").setTimestamp()] } : { content: yazı.replace(/<üye>/g, `<@${msg.client.user.id}>`).replace(/<üyeİsim>/g, msg.client.user.username).replace(/<üyeI[dD]>/g, msg.client.user.id).replace(/<rol>/g, rol?.map(a => `<@&${a}>`)?.join(", ") || "@Rol @Rol").replace(/<üyeTag>/g, msg.client.user.tag).replace(/<toplam>/g, kisi.toLocaleString().replace(/\./, ",")).replace(/<emojiToplam>/g, msg.client.stringToEmojis(kisi)).replace(/<yetkili>/g, `<@${msg.author.id}>`).replace(/<yetkiliTag>/g, msg.author.tag).replace(/<yetkiliİsim>/g, msg.author.username).replace(/<yetkiliI[Dd]>/g, msg.author.id).replace(/<sayı>|<count>/g, (sunucudb.kayıtkisiler[msg.author.id]?.toplam || 0)).replace(/<tag>/g, taglar), allowedMentions: { users: [msg.client.user.id], roles: !(rol || []) } })
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    } else ms.reply({ content: "Keşke bir yazı yazsaydın be" }).catch(() => { })
                }).catch(err => {
                    // console.log(err)
                    msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { })
                })
            }
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            let rol
            if (sunucudb.kayıt.secenek) rol = sunucudb.kayıt.normal
            else rol = sunucudb.kayıt.erkek || sunucudb.kayıt.kız
            let taglar = []
            if (sunucudb.kayıt.tag) taglar.push(sunucudb.kayıt.tag.slice(0, -1))
            if (sunucudb.kayıt.dis) taglar.push(`#${sunucudb.kayıt.dis}`)
            taglar = taglar.join(" - ") || "**NO TAG**"
            const kisi = guild.memberCount
            if (sonradan) return await yaz()
            if (db.bul(sunucuid, "gözel", "diğerleri")) return hata(`Heyyy dur bakalım orada! Şu anda başka bir yetkili özel mesajı ayarlıyor!`)
            db.yaz(sunucuid, { channelId: msg.channelId, messageId: msg.id, authorId: msg.author.id, date: Date.now() }, "gözel", "diğerleri")
            const embed = new EmbedBuilder()
                .setTitle("Şimdi düşünme zamanı")
                .setDescription('İptal etmek için **iptal**\n• Sıfırlamak için ise **sıfırla** yazabilirsiniz\n\n**Kayıt mesajının kutulu olmasını istiyorsanız yazacağın mesajın başına <kutulu> yazman yeterli!**\n\n**Değişkenler**\n' + `**• <üye>** => Kayıt edilen kişiyi etiketler - ( <@${msg.client.user.id}> )\n**• <üyeTag>** => Kayıt edilen kişinin tüm adını yazar - ( ${msg.client.user.tag} )\n**• <üyeİsim>** => Kayıt edilen kişinin adını yazar - ( ${msg.client.user.username} )\n**• <üyeID>** => Kayıt edilen kişinin ID'sini yazar - ( ${msg.client.user.id} )\n**• <rol>** => Verilen rolü etikerler (bu role sahip olanlara bildirim gitmez) - ( ${rol?.map(a => `<@&${a}>`)?.join(", ") || "@Role @Role"} )\n**• <tag>** => Sunucunun tag(larını) yazar - ( ${taglar} )\n**• <toplam>** => Sunucuda bulunan kişi sayısını yazar - ( ${kisi.toLocaleString().replace(/\./, ",")} )\n**• <emojiToplam>** => Sunucuda bulunan kişi sayısını emojili yazar - ( ${msg.client.stringToEmojis(kisi)} )\n**• <yetkili>** => Kayıt eden yetkiliyi etiketler - ( <@${msg.author.id}> )\n**• <yetkiliTag>** => Kayıt eden yetkilinin adını yazar - ( ${msg.author.tag} )\n**• <yetkiliİsim>** => Kayıt eden yetkilinin tüm adını yazar - ( ${msg.author.username} )\n**• <yetkiliID>** => Kayıt eden yetkilinin ID'sini yazar - ( ${msg.author.id} )\n**• <sayı>** => Kayıt eden yetkilinin kayıt sayısını yazar - ( ${sunucudb.kayıtkisiler[msg.author.id]?.toplam || "0"} )`)
                .setImage("https://i.hizliresim.com/dbe56m0.png")
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