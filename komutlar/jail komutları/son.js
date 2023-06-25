const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 60,
    name: "jail son",
    aliases: "jail-son",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {            

            // Kontroller
            let yetkili = guildDatabase.jail.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let kayıtlar2 = guildDatabase.jail.son
            if (!kayıtlar2.length) return hata(`Bu sunucuda daha önce hiçbir jail işlemi gerçekleşmediğinden dolayı tablo gösterilemiyor`)

            
            const kişi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
            if (kişi) {
                let kayıtlar = kayıtlar2.filter(a => a.s == kişi.id)
                    , kayıtuzunlugu = kayıtlar.length
                if (!kayıtlar.length) return hata(`Etiketlediğiniz kişi daha önceden hiçbir jail işlemi gerçekleştirmediğinden dolayı tablo gösterilemiyor`)
                let pp = kişi.displayAvatarURL()
                    , sayfa = Math.ceil(kayıtuzunlugu / 8)
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: kişi.user.tag, iconURL: pp })
                        .setDescription(`** • <@${kişi.id}> adlı kişinin toplamda __${kayıtuzunlugu}__ tane jail bilgisi bulundu**\n\n${kayıtlar.slice(0, 8).map((a, i) => `• \`#${(kayıtuzunlugu - i)}\`${a.sure || ""}${a.bool ? "📥" : "📤"} <@${a.k}> | <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "" : `\n└> **Sebebi:**  ${a.se || "Sebep belirtilmemiş"}`}`).join("\n")}`)
                        .setThumbnail(pp)
                        .setFooter({ text: `Sayfa 1/${sayfa}` })
                        .setColor('Black')
                if (kayıtuzunlugu < 9) return msg.reply({ embeds: [embed] }).catch(() => { })
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
                const düğmesaghizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagokhizli)
                    .setCustomId("NOT_saghizli")
                const düğmesolhizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solokhizli)
                    .setCustomId("NOT_solhizli")
                    .setDisabled(true)
                const düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
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
                        embed.setDescription(`** • <@${kişi.id}> adlı kişinin toplamda __${kayıtuzunlugu}__ tane jail bilgisi bulundu**\n\n${kayıtlar.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).map((a, i) => `• \`#${(kayıtuzunlugu - ((sayfasayısı - 1) * 8 + i))}\`${a.sure || ""}${a.bool ? "📥" : "📤"} <@${a.k}> | <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "" : `\n└> **Sebebi:**  ${a.se || "Sebep belirtilmemiş"}`}`).join("\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                        await a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
                    })
                    clin.on("end", async () => {
                        düğmesağ.setDisabled(true).setStyle(2)
                        düğmesol.setDisabled(true).setStyle(2)
                        düğmesil.setDisabled(true).setStyle(2)
                        düğmesaghizli.setDisabled(true).setStyle(2)
                        düğmesolhizli.setDisabled(true).setStyle(2)
                        const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                        await a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                    })
                }).catch(() => { })
            } else {
                let kayıtuzunlugu = kayıtlar2.length
                    , sayfa = Math.ceil(kayıtuzunlugu / 8)
                    , discordlogo = guild.iconURL()
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: guild.name, iconURL: discordlogo })
                        .setDescription(`**• Bu sunucuda toplamda __${kayıtuzunlugu}__ tane jail bilgisi bulundu**\n\n${kayıtlar2.slice(0, 8).map((a, i) => "• `#" + (kayıtuzunlugu - i) + "` " + `${a.sure || ""}${a.bool ? "📥" : "📤"} <@${a.s}> ==> <@${a.k}> | <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "" : `\n└> **Sebebi:**  ${a.se || "Sebep belirtilmemiş"}`}`).join('\n')}`)
                        .setColor('Black')
                        .setFooter({ text: `Sayfa 1/${sayfa}` })
                if (kayıtuzunlugu < 9) return msg.reply({ embeds: [embed] }).catch(() => { })
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
                const düğmesaghizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagokhizli)
                    .setCustomId("NOT_saghizli")
                const düğmesolhizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solokhizli)
                    .setCustomId("NOT_solhizli")
                    .setDisabled(true)
                const düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                    const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === msg.author.id
                    const clin = a.createMessageComponentCollector({ filter: filter, time: 100 * 1000 })
                    let sayfasayısı = 1
                    clin.on("collect", async oklar => {
                        const id = oklar.customId
                        if (id == "NOT_sil") return await a.delete()
                        if (["NOT_sağok", "NOT_saghizli"].includes(id)) {
                            if (sayfasayısı == sayfa) return;
                            düğmesol.setDisabled(false)
                            düğmesolhizli.setDisabled(false)
                            if (id === "NOT_sağok") sayfasayısı++;
                            else sayfasayısı += 10
                            if (sayfasayısı > sayfa) sayfasayısı = sayfa
                            if (sayfasayısı == sayfa) {
                                düğmesağ.setDisabled(true)
                                düğmesaghizli.setDisabled(true)
                            }
                        } else {
                            if (sayfasayısı == 1) return;
                            düğmesağ.setDisabled(false)
                            düğmesaghizli.setDisabled(false)
                            if (id === "NOT_solok") sayfasayısı--;
                            else sayfasayısı -= 10
                            if (sayfasayısı < 1) sayfasayısı = 1
                            if (sayfasayısı == 1) {
                                düğmesol.setDisabled(true)
                                düğmesolhizli.setDisabled(true)
                            }
                        }
                        embed.setDescription(`**• Bu sunucuda toplamda __${kayıtuzunlugu}__ tane jail bilgisi bulundu**\n\n${kayıtlar2.slice((sayfasayısı * 8 - 8), (sayfasayısı * 8)).map((a, i) => "• `#" + (kayıtuzunlugu - ((sayfasayısı - 1) * 8 + i)) + "` " + `${a.sure || ""}${a.bool ? "📥" : "📤"} <@${a.s}> ==> <@${a.k}> | <t:${(a.z / 1000).toFixed(0)}:F>${!a.bool ? "" : `\n└> **Sebebi:**  ${a.se || "Sebep belirtilmemiş"}`}`).join('\n')}`)
                            .setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                        return await a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
                    })
                    clin.on("end", async () => {
                        düğmesağ.setDisabled(true).setStyle(2)
                        düğmesol.setDisabled(true).setStyle(2)
                        düğmesil.setDisabled(true).setStyle(2)
                        düğmesaghizli.setDisabled(true).setStyle(2)
                        düğmesolhizli.setDisabled(true).setStyle(2)
                        const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                        return await a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                    })
                }).catch(() => { })
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
