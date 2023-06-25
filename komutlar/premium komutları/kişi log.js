const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "kişi log",
    aliases: ["klog", "kişilog", "kişi-log", "log"],
    cooldown: 10,
    pre: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {            

            // Kontroller
            let yetkili = guildDatabase.kayıt.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let kisi = msg.mentions.users.first() || await msg.client.fetchUser(args.join(" "))
            if (!kisi) return hata(Time.isNull(kisi) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            let kisiLog = guildDatabase.kl[kisi.id]
            if (!kisiLog) return hata("Etiketlediğiniz kişinin herhangi bir logu bulunmuyor")
            
            let type = (input) => {
                switch (input.type) {
                    case "ka":
                        return `⚒️ <@${input.author}> tarafından __kayıtsıza__ atıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "i":
                        return `📝 <@${input.author}> tarafından ismi **${input.newName}** olarak değiştirildi | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "d":
                        return `♻️ <@${input.author}> tarafından cinsiyeti **${input.c ? `Erkeğe ${ayarlar.emoji.erkek}` : `Kıza ${ayarlar.emoji.kiz}`}** çevrildi | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "j":
                        return `${ayarlar.emoji.hapis} <@${input.author}> tarafından __jaile__ atıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "uj":
                        return `${ayarlar.emoji.kutlama} <@${input.author}> tarafından jailden çıkarıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "tj":
                        return `⏰ <@${input.author}> tarafından ${input.c ? `**${Time.duration({ ms: input.time, format: "<M> ay, <d> gün, <h> saat, <m> dk, <s> saniye", skipZeros: true })}** süreyle jaile atıldı ` : "jailden çıkarıldı"} | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "mute":
                        return `🔇 <@${input.author}> tarafından **${Time.duration({ ms: input.time, format: "<M> ay, <d> gün, <h> saat, <m> dk, <s> saniye", skipZeros: true })}** süreyle susturuldu | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "unmute":
                        return `🔊 <@${input.author}> tarafından susturulması açıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "add":
                        return `📥 Sunucuya giriş yaptı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "remove":
                        return `📤 Sunucudan çıkış yaptı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "s":
                        return `⛔ <@${input.author}> tarafından __şüpheliye__ atıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "ban":
                        return `${ayarlar.emoji.tokmak} <@${input.author}> tarafından __**${input.reason || "Sebep belirtilmemiş"}**__ sebebinden banlandı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "unban":
                        return `${ayarlar.emoji.yeme} <@${input.author}> tarafından yasaklanması kaldırıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    case "kick":
                        return `${ayarlar.emoji.f} <@${input.author}> tarafından __**${input.reason || "Sebep belirtilmemiş"}**__ sebebinden sunucudan atıldı | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                    default:
                        switch (input.c) {
                            case "Erkek":
                                return `${ayarlar.emoji.erkek} <@${input.author}> tarafından **Erkek** olarak kayıt edildi | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                            case "Kız":
                                return `${ayarlar.emoji.kiz} <@${input.author}> tarafından **Kız** olarak kayıt edildi | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                            default:
                                return `${ayarlar.emoji.uye} <@${input.author}> tarafından **Üye** olarak kayıt edildi | <t:${(input.timestamp / 1000).toFixed(0)}:F>`
                        }
                }
            }
                , pp = kisi.displayAvatarURL()
                , length = kisiLog.length
                , sayfa = Math.ceil(length / 10)
                , embed = new EmbedBuilder()
                    .setAuthor({ name: kisi.tag, iconURL: pp })
                    .setDescription(`**• <@${kisi.id}> adlı kişinin toplamda __${length}__ adet log bilgisi bulundu**\n\n${kisiLog.slice(0, 10).map(a => `• ${type(a)}`).join("\n")}`)
                    .setColor('Black')
                    .setThumbnail(pp)
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
            if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
            const düğmesağ = new ButtonBuilder()
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
                    embed.setDescription(`**• <@${kisi.id}> adlı kişinin toplamda __${length}__ adet log bilgisi bulundu**\n\n${kisiLog.slice((sayfasayısı * 10 - 10), (sayfasayısı * 10)).map(a => `• ${type(a)}`).join("\n")}`)
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