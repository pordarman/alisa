const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail sıfırla",
    data: new SlashCommandBuilder()
        .setName("jail-sıfırla")
        .setDescription("Sunucudaki bütün jail ayarlarını/bilgilerini siler"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            const embed = new EmbedBuilder()
                .setTitle('Dikkat')
                .setDescription('Tüm jail ayarlarını, ayarlanmış rolleri ve kanalları, jail bilgilerini, sıfırlamak/silmek istediğinizden emin misiniz? \nEğer silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız')
                .setColor('#a80303')
                .setFooter({ text: 'Cevap vermek için 45 saniyeniz vardır' })
                .setTimestamp()
            int.reply({ embeds: [embed] }).catch(err => { })
            var filter = m => m.author.id === int.user.id && ["evet", "hayır"].includes(m.content.toLocaleLowerCase())
            await int.channel.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(a => {
                const m = a.first()
                if (m.content.toLocaleLowerCase() === "evet") {
                    sunucudb.jail = { kisi: {}, son: [] }
                    hata('Bu sunucudaki tüm jail ayarınızı başarıyla sıfırladım', "b")
                    db.yazdosya(sunucudb, sunucuid)
                    return;
                } else m.reply({ content: "İşlem iptal edilmiştir" }).catch(err => { })
            }).catch(() => int.reply({ content: `⏰ <@${int.user.id}>, süreniz bitti!` }).catch(err => { }))
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}