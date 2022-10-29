const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 60,
    name: "tagrol sıfırla",
    kod: ["tagrolsıfırla", "tagrol-sıfırla"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            const embed = new EmbedBuilder()
                .setTitle('Dikkat')
                .setDescription(`Tüm tagrol bilgilerinizi sıfırlamak istediğinizden emin misiniz. Sıfırlamadan önce **${prefix}tagrol-bilgi** yazarak tagrol ayarlarınızı gözden geçirebilirsiniz\n\n• Eğer silmek istiyorsanız **evet**, istemiyorsanız **hayır** yazınız`)
                .setColor('#a80303')
                .setFooter({ text: 'Cevap vermek için 45 saniyeniz vardır' })
                .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
            var filter = m => m.author.id === msg.author.id && ["evet", "hayır"].includes(m.content.toLocaleLowerCase())
            await msg.channel.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(a => {
                const m = a.first()
                if (m.content.toLocaleLowerCase() === "evet") {
                    const tagrol = msg.client.t(sunucuid)
                    tagrol = { kisi: {}, tag: sunucudb.kayıt.tag?.slice(0, -1) }
                    delete sunucudb.kayıt.dis
                    m.reply({ content: "Başarıyla bu sunucudaki tagrol bilgilerinizi sıfırladım" }).catch(() => { })
                    db.yaz(sunucuid, tagrol, "tag rol", "diğerleri")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                } else m.reply({ content: "İşlem iptal edilmiştir" }).catch(err => { })
            }).catch(() => {
                msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(err => { })
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}