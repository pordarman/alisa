const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 60,
    name: "jail sıfırla",
    kod: ["jail-sifirla", "jail-sıfırla"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            const embed = new EmbedBuilder()
                .setTitle('Dikkat')
                .setDescription('Tüm jail ayarlarını, ayarlanmış rolleri ve kanalları, jail bilgilerini, sıfırlamak/silmek istediğinizden emin misiniz? \nEğer silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız')
                .setColor('#a80303')
                .setFooter({ text: 'Cevap vermek için 45 saniyeniz vardır' })
                .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
            var filter = m => m.author.id === msg.author.id && ["evet", "hayır"].includes(m.content.toLocaleLowerCase())
            await msg.channel.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(a => {
                const m = a.first()
                if (m.content.toLocaleLowerCase() === "evet") {
                    sunucudb.jail = { kisi: {}, son: [] }
                    m.reply('Bu sunucudaki bütüm jail ayar ve bilgilerinizi başarıyla sıfırladım').catch(err => { })
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                } else m.reply({ content: "İşlem iptal edilmiştir" }).catch(err => { })
            }).catch(() => msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(err => { }))
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}