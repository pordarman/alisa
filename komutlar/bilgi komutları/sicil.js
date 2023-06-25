const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "sicil",
    aliases: "sicil",
    cooldown: 10,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {            

            // Kontroller
            if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let kisi = msg.mentions.users.first() || await msg.client.fetchUser(args.join(" "))
            if (!kisi) return hata(Time.isNull(kisi) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            let kisiLog = guildDatabase.kl[kisi.id]?.filter(a => ["j", "mute", "ban", "kick"].includes(a.type) || (a.type == "tj" && a.c))
            if (!kisiLog) return hata("Etiketlediğiniz kişinin herhangi bir sicili bulunmuyor")
            
            let type = (input) => {
                switch (input.type) {
                    case "j":
                        return `\`#${input.number || "??"}\` - **[JAIL]** <@${input.author}> | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "tj":
                        return `\`#${input.number || "??"}\` - **[TEMPJAIL]** <@${input.author}> | ${Time.duration({ ms: input.time, format: "<M> ay, <d> gün, <h> saat, <m> dk, <s> saniye", skipZeros: true })} | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "mute":
                        return `\`#${input.number || "??"}\` - **[MUTE]** <@${input.author}> | ${Time.duration({ ms: input.time, format: "<M> ay, <d> gün, <h> saat, <m> dk, <s> saniye", skipZeros: true })} | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "ban":
                        return `\`#${input.number || "??"}\` - **[BAN]** <@${input.author}> | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "kick":
                        return `\`#${input.number || "??"}\` - **[KICK]** <@${input.author}> | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                }
            }
                , pp = kisi.displayAvatarURL()
                , length = kisiLog.length
                , sayfa = Math.ceil(length / 10)
                , embed = new EmbedBuilder()
                    .setAuthor({ name: kisi.tag, iconURL: pp })
                    .setDescription(`**• <@${kisi.id}> adlı kişinin toplamda __${length}__ tane sicil bilgisi bulundu**\n\n${kisiLog.slice(0, 10).map(a => `• ${type(a)}`).join("\n")}`)
                    .setColor('Black')
                    .setThumbnail(pp)
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
            if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
            let düğmesağ = new ButtonBuilder()
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
            msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === msg.author.id
                const clin = a.createMessageComponentCollector({ filter: filter, time: 120 * 1000 })
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
                    }
                    embed.setDescription(`**• <@${kisi.id}> adlı kişinin toplamda __${length}__ tane log bilgisi bulundu**\n\n${kisiLog.slice((sayfasayısı * 10 - 10), (sayfasayısı * 10)).map(a => `• ${type(a)}`).join("\n")}`)
                        .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                    a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
                })
                clin.on("end", async () => {
                    düğmesağ.setDisabled(true).setStyle(2)
                    düğmesol.setDisabled(true).setStyle(2)
                    düğmesil.setDisabled(true).setStyle(2)
                    düğmesaghizli.setDisabled(true).setStyle(2)
                    düğmesolhizli.setDisabled(true).setStyle(2)
                    a.edit({ content: "Bu mesaj artık aktif değildir", components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
                })
            }).catch(() => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}