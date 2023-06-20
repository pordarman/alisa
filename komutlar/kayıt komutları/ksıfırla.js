const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 60,
    name: "ksil",
    aliases: ["ksifirla", "ksıfırla", "kalıcısıfırla", "kalıcı-sıfırla", "k-sıfırla"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (guild.ownerId != msg.author.id) return hata("Bu komutu kullanabilmek için **Sunucu sahibi** olmalısın şapşik şey seni :(")

            const embed = new EmbedBuilder()
                .setTitle("DİKKATT!!")
                .setDescription("• Tüm kayıtları, ayarlanmış rolleri ve kanalları, kayıt geçmişini, tagrol bilgilerini ve ayarlarını, jail ayarlarını ve diğer **TÜM HER ŞEYİ** sıfırlamak/silmek istediğinizden emin misiniz? \n\n• Eğer silmek istiyorsanız **evet** istemiyorsanız **hayır** yazınız\n\n**Dikkatt!!** Bu işlem kalıcıdır ve geri alınamaz lütfen iyice düşünün...")
                .setColor("#6d0000")
                .setFooter({ text: "Cevap vermek için 2 dakikanız vardır" })
            msg.reply({ embeds: [embed] }).catch(err => { })
            const filter = m => m.author.id == msg.author.id && ["evet", "hayır"].includes(m.content.toLocaleLowerCase())
            await msg.channel.awaitMessages({ filter: filter, max: 1, time: 120 * 1000 }).then(async ms => {
                const mes = ms.first()
                if (mes.content.toLocaleLowerCase() == "evet") {
                    mes.reply({ content: "Bunu yapmak istediğinizden gerçekten emin misiniz? Bu işlem geri alınamaz ve kurtarılamaz bir şekilde silinecektir" }).catch(() => { })
                    await msg.channel.awaitMessages({ filter: filter, max: 1, time: 120 * 1000 }).then(async ms2 => {
                        const mes3 = ms2.first()
                        if (mes3.content.toLocaleLowerCase() == "evet") {
                            sunucudb = { kayıtkisiler: {}, kayıt: { bototo: true, isimler: {}, otoduzeltme: true }, son: [], isimler: {}, jail: { kisi: {}, son: [] }, premium: {}, kl: {}, sc: { sayı: 1, kisi: {} }, say: { veri: { t: true, ü: true, tag: true, sü: true, b: true }, emoji: true }, afk: sunucudb.afk }
                            msg.client.sunucudb[sunucuid] = sunucudb
                            mes3.reply({ content: "Başarıyla bu sunucudaki **BÜTÜN** verilerinizi sıfırladım " }).catch(() => { })
                            db.yaz(sunucuid, { kisi: {} }, "tag rol", "diğerleri")
                            db.yazdosya(sunucudb, sunucuid)
                            return;
                        } else mes3.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
                    }).catch(err => msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { }))
                } else mes.reply({ content: "İşlem iptal edilmiştir" }).catch(() => { })
            }).catch(() => msg.reply({ content: `⏰ <@${msg.author.id}>, süreniz bitti!` }).catch(() => { }))
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}