const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 5,
    name: "fake",
    kod: ["fake", "sahte", "sahtegiriş", "fakegiriş", "sahte-giriş", "fake-giriş"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            let kisi = guild.memberCount + 1
                , sunucusayısı = kisi.toLocaleString().replace(".", ",")
                , ao = new Date()
                , yetkilirolid = sunucudb.kayıt.yetkili
                , yetkilietiket = yetkilirolid ? '<@&' + yetkilirolid + '>' : "__**ROL AYARLI DEĞİL**__"
                , kişi = msg.client.user
                , güvenlik
                , kişininfotografı = kişi.displayAvatarURL()
                , tarih = `<t:${(kişi.createdTimestamp / 1000).toFixed(0)}:F>`
            if (kişi.createdTimestamp > (ao - 1209600000)) güvenlik = `Güvensiz ${ayarlar.emoji.guvensiz}`
            else if (kişi.createdTimestamp > (ao - 2592000000)) güvenlik = `Şüpheli ${ayarlar.emoji.supheli}`
            else güvenlik = `Güvenli ${ayarlar.emoji.guvenli}`
            let mid = kişi.id
            , components = []
            , dugme = new ActionRowBuilder()
            if (sunucudb.kayıt.secenek) dugme.addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTÜYE`).setStyle(1).setEmoji(ayarlar.emoji.uye).setLabel("Üye olarak kayıt et"))
            else dugme.addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTKIZ`).setStyle(1).setEmoji(ayarlar.emoji.kiz).setLabel("Kız olarak kayıt et")).addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTERKEK`).setStyle(1).setEmoji(ayarlar.emoji.erkek).setLabel("Erkek olarak kayıt et"))
            dugme.addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTŞÜPHELİ`).setStyle(4).setLabel("Şüpheliye at").setEmoji("⛔")).addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTYENİDEN`).setStyle(3).setEmoji("🔁").setLabel("Yeniden kayıt et"))
            components.push(dugme, new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`KAYIT_TESTBOT`).setStyle(1).setLabel("Bot olarak kayıt et").setEmoji("🤖")))
            var ozelgirismesajıvarmı = sunucudb.kayıt.özel
            if (ozelgirismesajıvarmı) {
                var girişmesajı = ozelgirismesajıvarmı.yazı
                    .replace(/<sunucuAdı>/g, guild.name)
                    .replace(/<üye>/g, '<@' + mid + '>')
                    .replace(/<üyeTag>/g, kişi.tag)
                    .replace(/<üyeİsim>/g, kişi.username)
                    .replace(/<üyeID>/g, mid)
                    .replace(/<toplam>/g, kisi)
                    .replace(/<tarih>/g, tarih)
                    .replace(/<tarih2>/g, tarih.replace("F", "R"))
                    .replace(/<tarih3>/g, Time.toDateStringForAlisa(kişi.createdTimestamp))
                    .replace(/<güvenlik>/g, güvenlik)
                    .replace(/<rol>/g, yetkilietiket)
                    .replace(/<emojiToplam>/g, msg.client.stringToEmojis(kisi))
                if (ozelgirismesajıvarmı.embed) return msg.channel.send({ content: girişmesajı + "\n" + (ozelgirismesajıvarmı.im || ""), components: components, allowedMentions: { roles: false } }).catch(err => { })
                var embedgiriş = new EmbedBuilder()
                    .setTitle(`${sunucudb.isimler[mid] ? "Tekrar " : ""}Hoşgeldin ${kişi.username} ${ayarlar.emoji.selam} (FAKE)`)
                    .setDescription(girişmesajı)
                    .setColor('Random')
                    .setThumbnail(kişininfotografı)
                    .setTimestamp()
                    .setImage(ozelgirismesajıvarmı.im)
                    .setFooter({ text: 'Nasılsın bakalım ' + kişi.username + '?' })
            } else {
                var embedgiriş = new EmbedBuilder()
                    .setTitle(`${sunucudb.isimler[mid] ? "Tekrar " : ""}Hoşgeldin ${kişi.username} ${ayarlar.emoji.selam} (FAKE)`)
                    .setDescription(`**${ayarlar.emoji.cildir} \`${guild.name}\` adlı sunucumuza hoşgeldiniizz!!\n\n${ayarlar.emoji.woah} Seninle beraber tam olarak ${sunucusayısı} kişi olduukkk\n\n${ayarlar.emoji.icme} Yetkililer seni birazdan kayıt edecektir lütfen biraz sabredin\n\n> Hesabının kurulma tarihi ` + tarih + '\n> Hesap ' + güvenlik + '**')
                    .setColor('Random')
                    .setThumbnail(kişininfotografı)
                    .setTimestamp()
                    .setFooter({ text: 'Nasılsın bakalım ' + kişi.username + '?' })
            }
            const mesajlar = ayarlar.guildMemberAdd
            var rasm = mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${msg.client.user.id}>`)
            return msg.channel.send({ embeds: [embedgiriş], content: `${sunucudb.kayıt.yetkili ? `<@&${sunucudb.kayıt.yetkili}>, ` : ""}${rasm}`, allowedMentions: { roles: false }, components: components }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
