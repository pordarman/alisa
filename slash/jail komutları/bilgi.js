const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail bilgi",
    data: new SlashCommandBuilder()
        .setName("jail-bilgi")
        .setDescription("Bir üyenin jail bilgilerini gösterir")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {

            // Kontroller
            let yetkili = sunucudb.jail.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")

            const kisi = int.options.getUser("üye", false)
            const gecmis = sunucudb.jail.kisi[kisi.id]
            if (!gecmis) return hata(`Etiketlediğiniz kişi daha önceden hiç jail'e atılmamış oley 🎉`)
            let pp = kisi.displayAvatarURL()
                , length = gecmis.length
                , sayfa = Math.ceil(length / 8)
                , embed = new EmbedBuilder()
                    .setAuthor({ name: kisi.tag, iconURL: pp })
                    .setThumbnail(pp)
                    .setDescription(`**• <@${kisi.id}> adlı kişinin jail geçmişi**\n\n${gecmis.slice(0, 8).map((a, i) => `**• \`#${length - i}\` ${a.sure || ""}${a.bool ? "📥" : "📤"} Yetkili: <@${a.y}> - Tarih: <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "**" : `\n└> Sebebi:**  ${a.s || "Sebep belirtilmemiş"}`}`).join("\n\n")}`)
                    .setColor("#9e02e2")
                    .setTimestamp()
                    .setFooter({ text: `Sayfa 1/${sayfa}` })
            if (sayfa == 1) return int.reply({ embeds: [embed] }).catch(err => { })
            const düğmesağ = new ButtonBuilder()
                .setStyle(1)
                .setEmoji(ayarlar.emoji.sagok)
                .setCustomId("NOT_sağok")
            const düğmesil = new ButtonBuilder()
                .setStyle(4)
                .setEmoji(ayarlar.emoji.sil)
                .setCustomId("NOT_sil")
            const düğmesol = new ButtonBuilder()
                .setStyle(1)
                .setEmoji(ayarlar.emoji.solok)
                .setCustomId("NOT_solok")
                .setDisabled(true)
            var düğme = new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)
            int.reply({ embeds: [embed], components: [düğme], fetchReply: true }).then(a => {
                const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil"].includes(i.customId) && i.user.id === int.user.id
                const clin = a.createMessageComponentCollector({ filter: filter, time: 100 * 1000 })
                let sayfasayısı = 1
                clin.on("collect", async oklar => {
                    const id = oklar.customId
                    if (id == "NOT_sil") return await a.delete()
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
                    embed.setDescription(`**• <@${kisi.id}> adlı kişinin jail geçmişi** \n\n${gecmis.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).map((a, i) => `**• \`#${(length - ((sayfasayısı - 1) * 8 + i))}\` ${a.sure || ""}${a.bool ? "📥" : "📤"} Yetkili: <@${a.y}> - Tarih: <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "**" : `\n└> Sebebi:**  ${a.s || "Sebep belirtilmemiş"}`}`).join("\n\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                    a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
                })
                clin.on("end", async () => {
                    düğmesağ.setDisabled(true).setStyle(2)
                    düğmesol.setDisabled(true).setStyle(2)
                    düğmesil.setDisabled(true).setStyle(2)
                    a.edit({ content: "Bu mesaj artık aktif değildir", components: [new ActionRowBuilder().addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ)] }).catch(err => { })
                })
            }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}