const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 60,
    name: "sıfırla",
    aliases: ["sifirla", "sıfırla"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            
            const embed = new EmbedBuilder()
                .setTitle('Dikkat')
                .setDescription(`Tüm kayıt ayarını sıfırlamak istediğinizden emin misiniz. Sıfırlamadan önce **${prefix}kayıtbilgi** yazarak kayıt ayarlarınızı gözden geçirebilirsiniz\n\n• Eğer silmek istiyorsanız **evet**, istemiyorsanız **hayır** yazınız`)
                .setColor('#a80303')
                .setFooter({ text: 'Cevap vermek için 45 saniyeniz vardır' })
                .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
            var filter = m => m.author.id === msg.author.id && ["evet", "hayır"].includes(m.content.toLocaleLowerCase())
            await msg.channel.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(a => {
                const m = a.first()
                if (m.content.toLocaleLowerCase() === "evet") {                    
                    const tagrol = msg.client.tagrolDatabase(sunucuid)
                    sunucudb.kayıt = { vrol: sunucudb.kayıt.vrol, vyetkili: sunucudb.kayıt.vyetkili, bany: sunucudb.kayıt.bany, kicky: sunucudb.kayıt.kicky, modl: sunucudb.kayıt.modl, dis: tagrol.dis, bototo: sunucudb.kayıt.bototo, isimler: {}, otoduzeltme: true }
                    delete tagrol.tag
                    m.reply({ content: "Başarıyla bu sunucudaki kayıt ayarlarınızı sıfırladım" }).catch(() => { })
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