const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "alisa",
    data: new SlashCommandBuilder()
        .setName("alisa")
        .setDescription("Dene ve gör :)")
        .addStringOption(option => option.setName("seçenek").setDescription("Bir seçenek gir").setRequired(true).addChoices({ name: "Alisa kimdir", value: "kim" }, { name: "Sıralama", value: "sıra" }, { name: "Sunucu sıralama", value: "ssıra" }, { name: "Alisa toplam", value: "ttop" }, { name: "Komutlar", value: "komut" })),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const seçenek = int.options.getString("seçenek", true)
            if (seçenek == "kim") {
                const prefix = sunucudb.prefix || ayarlar.prefix
                const pp = int.client.user.displayAvatarURL()
                let toplam = Object.values(alisa.sunucular.ekleme)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: int.client.user.username + " kimdir?", iconURL: pp })
                    .setDescription(`• *Botun çıkış tarihi ve botun amacı*`)
                    .setImage("https://media.giphy.com/media/W5eV84IFjKpAnwYPKc/giphy.gif")
                    .setThumbnail(pp)
                    .setColor("#9e02e2")
                    .setFooter({ text: "İyi ki varsınız <3" })
                return int.reply({ embeds: [embed] }).catch(err => { })
            } else if (seçenek == "sıra") {
                let obje = Object.entries(alisa.kisiler).sort((a, b) => b[1] - a[1])
                    , sıra = `• Sen **${obje.length.toLocaleString().replace(/\./g, ",")}** kişi içerisinden **${obje.indexOf(obje.find(a => a[0] == int.user.id)) + 1}.** sıradasın! 🎉`
                    , sayfa = Math.ceil(obje.length / 20)
                    , pp = int.client.user.displayAvatarURL()
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: int.client.user.username, iconURL: pp })
                        .setDescription("• Botun komutlarını en çok kullanan kişiler!\n" + sıra + "\n\n" + obje.slice(0, 20).map((a, i) => {
                            let sampiyonluksirasi = false
                            if (i == 0) sampiyonluksirasi = "👑 "
                            return `\`#${(i + 1)}\` ${sampiyonluksirasi || ""}<@${a[0]}> => **${a[1].toLocaleString().replace(/\./g, ",")}** kere`
                        }).join("\n"))
                        .setThumbnail(pp)
                        .setColor("Purple")
                        .setFooter({ text: `Sayfa 1/${sayfa}` })
                    , düğmesağ = new ButtonBuilder()
                        .setStyle(1)
                        .setEmoji(ayarlar.emoji.sagok)
                        .setCustomId("NOT_sağok")
                    , düğmesil = new ButtonBuilder()
                        .setStyle(4)
                        .setEmoji(ayarlar.emoji.sil)
                        .setCustomId("NOT_sil")
                    , düğmesol = new ButtonBuilder()
                        .setStyle(1)
                        .setEmoji(ayarlar.emoji.solok)
                        .setCustomId("NOT_solok")
                        .setDisabled(true)
                    , düğmesaghizli = new ButtonBuilder()
                        .setStyle(1)
                        .setEmoji(ayarlar.emoji.sagokhizli)
                        .setCustomId("NOT_saghizli")
                    , düğmesolhizli = new ButtonBuilder()
                        .setStyle(1)
                        .setEmoji(ayarlar.emoji.solokhizli)
                        .setCustomId("NOT_solhizli")
                        .setDisabled(true)
                    , düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                int.reply({ embeds: [embed], components: [düğme], fetchReply: true }).then(a => {
                    const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === int.user.id
                    const clin = a.createMessageComponentCollector({ filter: filter, time: 180 * 1000 })
                    let sayfasayısı = 1
                    clin.on("collect", async oklar => {
                        const id = oklar.customId
                        if (id == "NOT_sil") return a.delete()
                        if (["NOT_sağok", "NOT_saghizli"].includes(id)) {
                            düğmesol.setDisabled(false)
                            düğmesolhizli.setDisabled(false)
                            if (sayfasayısı == sayfa) return;
                            if (id === "NOT_sağok") sayfasayısı++;
                            else sayfasayısı += 10
                            if (sayfasayısı > sayfa) sayfasayısı = sayfa
                            if (sayfasayısı == sayfa) {
                                düğmesağ.setDisabled(true)
                                düğmesaghizli.setDisabled(true)
                            }
                            const düğmeeditleme2 = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                            embed.setDescription(`• Botun komutlarını en çok kullanan kişiler!\n${sıra}\n\n${obje.slice((sayfasayısı * 20 - 20), (sayfasayısı * 20)).map((a, i) => {
                                let sampiyonluksirasi = false
                                if (i == 0 + (sayfasayısı * 20 - 20)) sampiyonluksirasi = "👑 "
                                return `\`#${(i + 1) + (sayfasayısı * 20 - 20)}\` ${sampiyonluksirasi || ""}<@${a[0]}> => **${a[1].toLocaleString().replace(/\./g, ",")}** kere`
                            }).join('\n')}`)
                                .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            a.edit({ embeds: [embed], components: [düğmeeditleme2] }).catch(err => { })
                        } else {
                            düğmesağ.setDisabled(false)
                            düğmesaghizli.setDisabled(false)
                            if (sayfasayısı == 1) return;
                            if (id === "NOT_solok") sayfasayısı--;
                            else sayfasayısı -= 10
                            if (sayfasayısı < 1) sayfasayısı = 1
                            if (sayfasayısı == 1) {
                                düğmesol.setDisabled(true)
                                düğmesolhizli.setDisabled(true)
                            }
                            const düğmeeditleme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                            embed.setDescription(`• Botun komutlarını en çok kullanan kişiler!\n${sıra}\n\n${obje.slice((sayfasayısı * 20 - 20), (sayfasayısı * 20)).map((a, i) => {
                                let sampiyonluksirasi = false
                                if (i == 0 + (sayfasayısı * 20 - 20)) sampiyonluksirasi = "👑 "
                                return `\`#${(i + 1) + (sayfasayısı * 20 - 20)}\` ${sampiyonluksirasi || ""}<@${a[0]}> => **${a[1].toLocaleString().replace(/\./g, ",")}** kere`
                            }).join('\n')}`)
                                .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            a.edit({ embeds: [embed], components: [düğmeeditleme] }).catch(err => { })
                        }
                    })
                    clin.on("end", async () => {
                        düğmesağ.setDisabled(true).setStyle(2)
                        düğmesol.setDisabled(true).setStyle(2)
                        düğmesil.setDisabled(true).setStyle(2)
                        düğmesaghizli.setDisabled(true).setStyle(2)
                        düğmesolhizli.setDisabled(true).setStyle(2)
                        const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                        a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                    })
                }).catch(() => { })
            } else if (seçenek == "ttop") {
                {
                    let date = Date.now()
                        , pp = int.client.user.displayAvatarURL()
                        , object = Object.entries(db.buldosya("kayıt toplam herkes", "diğerleri"))
                        , herkes = object.reduce((arr, total) => total[1] + arr, 0)
                        , guilds = await Promise.all(object.sort((a, b) => b[1] - a[1]).slice(0, 8).map(async (a, i) => `• ${int.client.stringToEmojis(i + 1)} **${(await int.client.getGuildNameOrId(a[0].replace("a", ""), false)) || "❓ Bilinmiyor"} [${a[1].toLocaleString().replace(/\./g, ",")}]**`))
                        , shard = await int.client.shard.broadcastEval(c => ({ guild: c.guilds.cache.size, secenek: c.secenek.size }))
                        , seçeneksay
                        , guildsSize
                        , erkeksayı = Object.values(db.buldosya("erkek toplam herkes", "diğerleri")).reduce((arr, total) => total + arr, 0)
                        , kızsayı = Object.values(db.buldosya("kız toplam herkes", "diğerleri")).reduce((arr, total) => total + arr, 0)
                        , i = 0
                    seçeneksay = shard.map(a => a.secenek).reduce((acc, size) => acc + size, 0)
                    guildsSize = shard.map(a => a.guild).reduce((acc, size) => acc + size, 0)
                    let normalsayı = Object.values(db.buldosya("normal toplam herkes", "diğerleri")).reduce((arr, total) => total + arr, 0)
                        , embed = new EmbedBuilder()
                            .setAuthor({ name: int.client.user.tag, iconURL: pp })
                            .addFields(
                                {
                                    name: 'KAYIT EDİLEN (' + herkes.toLocaleString().replace(/\./g, ",") + ')',
                                    value: `${ayarlar.emoji.erkek} **Erkek:**  ${erkeksayı.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.kiz} **Kız:**  ${kızsayı.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.uye} **Üye:**  ${normalsayı.toLocaleString().replace(/\./g, ",")}\n🤖 **Bot:**  ${(herkes - (erkeksayı + kızsayı + normalsayı)).toLocaleString().replace(/\./g, ",")}`,
                                    inline: true
                                },
                                {
                                    name: '\u200b',
                                    value: '\u200b',
                                    inline: true
                                },
                                {
                                    name: 'KAYIT SEÇENEĞİ (' + guildsSize.toLocaleString().replace(/\./g, ",") + ')',
                                    value: `👫 **Cinsiyet:**  ${(guildsSize - seçeneksay).toLocaleString().replace(/\./g, ",")}\n👤 **Normal Kayıt:**  ${seçeneksay.toLocaleString().replace(/\./g, ",")}`,
                                    inline: true
                                },
                                {
                                    name: '📈 En fazla kayıt yapan 8 sunucu',
                                    value: guilds.join("\n")
                                }
                            )
                            .setColor('Black')
                            .setThumbnail(pp)
                            .setTimestamp()
                            .setDescription('**• Bot ile yapılan bütün kayıtların istatiği *(in ' + (Date.now() - date) + " ms)***")
                    int.reply({ embeds: [embed] }).catch(err => { })
                }
            } else if (seçenek == "komut") {
                const prefix = sunucudb.prefix || ayarlar.prefix
                let toplam = 0
                const obje = Object.entries(alisa.kullanımlar).sort((a, b) => (b[1].top + (b[1].buton || 0)) - (a[1].top + (a[1].buton || 0))).filter(a => {
                    const komut = int.client.commands.find(b => b.name == a[0])
                    return !(!komut || komut.no)
                }).map(a => {
                    let komut = int.client.commands.find(b => b.name == a[0] && b.y != true)
                    let yazı = ` ${prefix}${typeof komut.kod == "object" ? komut.kod[0] : komut.kod}`
                    if (yazı.length < 25) yazı = `${yazı}` + " ".repeat((25 - yazı.length))
                    let kackere = a[1].top
                    if (a[1].buton) kackere += a[1].buton
                    toplam += kackere
                    return `#${yazı} ${kackere.toLocaleString().replace(/\./g, ",")} kere${a[1].buton ? ` (${a[1].buton.toLocaleString().replace(/\./g, ",")} buton)` : ""}`
                })
                let yazı = `[ TOPLAM` + " ".repeat((25 - `TOPLAM`.length)) + toplam.toLocaleString().replace(/\./g, ",") + " kere ]\n"
                obje.unshift(yazı)
                const kactanesayfaolacak = Math.ceil(obje.length / 50) + 1
                int.reply({ content: "```css\n" + obje.slice(0, 50).join("\n") + "```" }).catch(err => { })
                for (let i = 2; i < kactanesayfaolacak; i++) {
                    int.channel?.send({ content: "```css\n" + obje.slice((i * 50 - 50), (i * 50)).join("\n") + "```" }).catch(err => { })
                }
            } else return hata("Lütfen geçerli bir seçenek giriniz")
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
