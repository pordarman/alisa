const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 30,
    name: "jail bilgi",
    aliases: "jail-bilgi",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {            

            // Kontroller
            let yetkili = guildDatabase.jail.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            const kisi = msg.mentions.users.first() || await msg.client.fetchUser(args[0], msg)
            if (!kisi) return hata(Time.isNull(kisi) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            const gecmis = guildDatabase.jail.kisi[kisi.id]
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
            if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
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
            msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil"].includes(i.customId) && i.user.id === msg.author.id
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
                    embed.setDescription(`**• <@${kisi.id}> adlı kişinin jail geçmişi**\n\n${gecmis.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).map((a, i) => `**• \`#${(length - ((sayfasayısı - 1) * 8 + i))}\` ${a.sure || ""}${a.bool ? "📥" : "📤"} Yetkili: <@${a.y}> - Tarih: <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "**" : `\n└> Sebebi:**  ${a.s || "Sebep belirtilmemiş"}`}`).join("\n\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
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
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
