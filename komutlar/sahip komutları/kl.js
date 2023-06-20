const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: "kl",
    name: "kara liste",
    owner: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!args[0]) return msg.reply("Bir şey yazmayı unuttun sanki?")
            if (["list", "liste"].includes(args[0])) {
                const kisilervetarihi = Object.entries(alisa.kl).sort((a, b) => b[1].z - a[1].z).filter(a => (!a[1].sure || Date.now() < a[1].sure))
                let length = kisilervetarihi.length
                if (length == 0) return msg.reply("Kara listede kimse __bulunmuyor__ oleyyy!!! 🎉")
                const sayfa = Math.ceil(length / 8)
                let sıraseysi = []
                , i = 0
                for (const a of kisilervetarihi) {
                    sıraseysi.push(`• \`#${length - i}\` <@${a[0]}> - **(${(await msg.client.fetchUserForce(a[0]))?.tag || "Deleted User#0000"})${a[1].kls ? ` - (Geçici)` : ""}**\n**└> Tarihi:** <t:${a[1].z}:F> - <t:${a[1].z}:R>\n**└> Sebebi:**  __${a[1].s || "Sebep belirtilmemiş!"}__`)
                    i += 1
                }
                const pp = msg.client.user.displayAvatarURL()
                const embed = new EmbedBuilder()
                    .setAuthor({ name: msg.client.user.tag, iconURL: pp })
                    .setThumbnail(pp)
                    .setDescription(`**• Karalistede toplam ${length} kişi bulunuyor**\n\n${sıraseysi.slice(0, 8).join("\n\n")}`)
                    .setColor("DarkRed")
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
                if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
                const düğmesağ = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji("910989094463606876")
                    .setCustomId("NOT_sağok")
                const düğmesil = new ButtonBuilder()
                    .setStyle(4)
                    .setEmoji("910994505304526859")
                    .setCustomId("NOT_sil")
                const düğmesol = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji("910989094190985218")
                    .setCustomId("NOT_solok")
                    .setDisabled(true)
                var düğme = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
                return msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                    const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil"].includes(i.customId) && i.user.id === msg.author.id
                    const clin = a.createMessageComponentCollector({ filter: filter, time: 120 * 1000 })
                    let sayfasayısı = 1
                    clin.on("collect", async oklar => {
                        const id = oklar.customId
                        if (id == "NOT_sil") return await a.delete()
                        if (id == "NOT_sağok") {
                            düğmesol.setDisabled(false)
                            if (sayfasayısı == sayfa) return;
                            sayfasayısı++;
                            if (sayfasayısı == sayfa) düğmesağ.setDisabled(true)
                            var düğmeeditleme2 = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
                            embed.setDescription(`**• Karalistede toplam ${length} kişi bulunuyor**\n\n${sıraseysi.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).join('\n\n')}`)
                                .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            return await a.edit({ embeds: [embed], components: [düğmeeditleme2] }).catch(err => { })
                        } else {
                            düğmesağ.setDisabled(false)
                            if (sayfasayısı == 1) return;
                            sayfasayısı--;
                            if (sayfasayısı == 1) düğmesol.setDisabled(true)
                            var düğmeeditleme = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
                            embed.setDescription(`**• Karalistede toplam ${length} kişi bulunuyor**\n\n${sıraseysi.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).join('\n\n')}`)
                                .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            return await a.edit({ embeds: [embed], components: [düğmeeditleme] }).catch(err => { })
                        }
                    })
                    clin.on("end", async () => {
                        düğmesağ.setDisabled(true).setStyle(2)
                        düğmesol.setDisabled(true).setStyle(2)
                        düğmesil.setDisabled(true).setStyle(2)
                        var düğmeeditnew = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
                        return await a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                    })
                }).catch(err => { })
            }
            if (["s", "server", "sunucu"].some(a => args.includes(a))) {
                let guildId = args.join(" ").match(/\d{17,19}/)
                if (!guildId) return msg.reply("Lütfen geçerli bir sunucu ID'si giriniz")
                guildId = guildId[0]
                if (["ekle", "add", "a", "e"].some(a => args.includes(a))) {
                    if (alisa.klserver.includes(guildId)) return msg.reply("Girdiğiniz sunucu ID'si zaten karalistede __bulunuyor__")
                    alisa.klserver.push(guildId)
                    let sunucu = msg.client.guilds.cache.get(guildId)
                    if (sunucu) sunucu.leave()
                    msg.reply(`${msg.client.getGuildNameOrId(guildId)} sunucu başarıyla karalisteye eklendi!`)
                } else if (["ç", "çıkar", "k", "kaldır"].some(a => args.includes(a))) {
                    if (!alisa.klserver.includes(guildId)) return msg.reply("Girdiğiniz sunucu ID'si zaten karalistede __bulunmuyor__")
                    alisa.klserver.splice(alisa.klserver.indexOf(guildId), 1)
                    msg.reply(`${msg.client.getGuildNameOrId(guildId)} sunucu başarıyla karalisteden çıkarıldı!`)
                } else return msg.reply("Bir şeyi yanlış yazmış olabilir misin?")
                db.yazdosya(alisa, "alisa", "diğerleri")
                return;
            }
            let user = msg.mentions.users.first() || await msg.client.fetchUser(args.join(" "))
            if (!user) return msg.reply("Girdiğiniz ID bir kişiye ait değil! Lütfen geçerli bir ID giriniz!")
            let id = user.id
            if (user.bot) return msg.reply("Ummm botları kara listeye ekleyemezsin :(")
            if (ayarlar.sahipler.includes(id)) return msg.reply("Hey hey heyy, bot geliştiricilerini kara listeye ekleyemezsin!")
            if (["ekle", "add"].some(a => args.includes(a))) {
                if (alisa.kl[id] && !alisa.kl[id]?.kls) return msg.reply("Bu kişi zaten karalistede __bulunuyor__!")
                alisa.kl[id] = { z: (Date.now() / 1000).toFixed(0), s: args[2] ? args.slice(2).join(" ") : false }
                db.yazdosya(alisa, "alisa", "diğerleri")
                msg.reply({ content: `**<@${id}> - (${user.tag})** adlı kişi başarıyla kara listeye alındı!`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
            } else if (["çıkar", "kaldır"].some(a => args.includes(a))) {
                if (!alisa.kl[id]) return msg.reply("Bu kişi zaten karalistede __bulunmuyor__!")
                delete alisa.kl[id]
                db.yazdosya(alisa, "alisa", "diğerleri")
                msg.reply({ content: `**<@${id}> - (${user.tag})** adlı kişi başarıyla kara listeden kaldırıldı!`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
            } else if (args.includes("bilgi")) {
                const kl = alisa.kl[id]
                if (!kl) return msg.reply("Bu kişi karalistede __bulunmuyor__ yey")
                return msg.reply({ content: `**👤 Adı:**  <@${user.id}> - ${user.tag}\n**📜 Sebebi:**  ${kl.s || "Sebep belirtilmemiş"}\n**📅 Karalisteye alınış tarihi:**  <t:${kl.z}:F> - <t:${kl.z}:R>`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
            } else return msg.reply("Bir şeyi yanlış yazmış olabilir misin?")
        } catch (e) {
      msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
      console.log(e)
    }
    }
}