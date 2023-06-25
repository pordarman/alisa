const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "isimler",
    data: new SlashCommandBuilder()
        .setName("isimler")
        .setDescription("Bir üyenin önceden nasıl kayıt edildiğini gösterir")
        .addUserOption(option => option.setName("üye").setDescription("üyeyi etiketle").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let yetkili = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            } else if (!intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            let kişi = int.options.getUser("üye", true)
            if (!kişi) return hata(Time.isNull(kişi) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            let isimgecmisii = guildDatabase.isimler[kişi.id]
            if (!isimgecmisii) return hata(`Etiketlediğiniz kişi daha önceden hiç kayıt edilmediği için tablo gösterilemiyor`)
            
            const embed = new EmbedBuilder().setAuthor({ name: kişi.tag, iconURL: kişi.displayAvatarURL() }).setColor("Random").setTimestamp()
            let length = isimgecmisii.length
                , isimgecmisigecmeli = isimgecmisii.map((a, i) => `• \`#${length - i}\` ${a.c} **${a.n}** (${a.r}) (**Kayıt eden:** <@${a.s}>) | <t:${a.z}:F>`), uzunluk = isimgecmisigecmeli.length, sayfa = Math.ceil(uzunluk / 15)
            embed.setDescription(`**• <@${kişi.id}> adlı kişinin toplam __${length}__ tane isim geçmişi bulundu**  \n\n${isimgecmisigecmeli.slice(0, 15).join("\n")}`).setFooter({ text: `Sayfa 1/${sayfa}` })
            if (sayfa == 1) return int.reply({ embeds: [embed] }).catch(err => { })
            let düğmesağ = new ButtonBuilder().setStyle(1).setEmoji(ayarlar.emoji.sagok).setCustomId("NOT_sağok")
                , düğmesil = new ButtonBuilder().setStyle(4).setEmoji(ayarlar.emoji.sil).setCustomId("NOT_sil")
                , düğmesol = new ButtonBuilder().setStyle(1).setEmoji(ayarlar.emoji.solok).setCustomId("NOT_solok").setDisabled(true)
                , düğme = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
            int.reply({ embeds: [embed], components: [düğme], fetchReply: true }).then(a => {
                let filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil"].includes(i.customId) && i.user.id === int.user.id
                    , clin = a.createMessageComponentCollector({ filter: filter, time: 100 * 1000 })
                    , sayfasayısı = 1
                clin.on("collect", async oklar => {
                    const id = oklar.customId
                    if (id == "NOT_sil") return a.delete()
                    if (id == "NOT_sağok") {
                        if (sayfasayısı == sayfa) return;
                        düğmesol.setDisabled(false)
                        sayfasayısı++;
                        if (sayfasayısı == sayfa) düğmesağ.setDisabled(true)
                    } else {
                        if (sayfasayısı == 1) return;
                        düğmesağ.setDisabled(false)
                        sayfasayısı--;
                        if (sayfasayısı == 1) düğmesol.setDisabled(true)
                    }
                    embed.setDescription(`**• <@${kişi.id}> adlı kişinin toplam __${length}__ tane isim geçmişi bulundu**  \n\n${isimgecmisigecmeli.slice((sayfasayısı * 15 - 15), (sayfasayısı * 15)).join("\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                    return a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
                })
                clin.on("end", async () => {
                    düğmesağ.setDisabled(true).setStyle(2)
                    düğmesol.setDisabled(true).setStyle(2)
                    düğmesil.setDisabled(true).setStyle(2)
                    return a.edit({ content: "Bu mesaj artık aktif değildir", components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
                })
            }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}