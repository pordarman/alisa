const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "yaş",
    kod: ["yaş", "yaşekle", "yaşçıkart", "yaşçıkar", "yaşe", "yaşk"],
    pre: true,
    /**
     * @param {import("../../typedef").exportsRunCommands} param0
     */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, sonradan, guild, msgMember, guildMe }) {
        try {            
            let yetkili = sunucudb.kayıt.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            switch (args[0]) {
                case "yükselt":
                case "arttır":
                case "+":
                case "ekle": {
                    if (!guildMe.permissions.has("ManageNicknames")) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
                    msg.reply({ embeds: [new EmbedBuilder().setDescription(`• Sunucudaki üyelerin isimlerinde yaş aranıyor, lütfen biraz bekleyiniz... `).setColor("Orange")] }).then(async mesaj => {
                        function after(input, kisiler) {
                            if (input.length == 0) return mesaj.edit({ embeds: [new EmbedBuilder().setDescription(`• Bu sunucudaki üyelerinin isimlerinde yaş ile ilgili hiçbir şey bulamadım şapşik şey seni :( `).setColor("Orange")] }).catch(() => { })
                            let filter = input.filter(a => a.isChange)
                            if (input.length == 0) return mesaj.edit({ embeds: [new EmbedBuilder().setDescription(`• Bu sunucudaki üyelerinin **${input.length}** tanesinin isminde yaş bulundu fakat hiçbirinin ismini değiştirme yetkim yok :( `).setColor("Orange")] }).catch(() => { })
                            let size = kisiler.size
                                , date = Date.now()
                                , dongu = 0
                                , sure = Time.duration({ ms: size * 1200, skipZeros: true })
                                , pp = msg.client.user.displayAvatarURL()
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: `Yaş yükseltme`, iconURL: pp })
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `**📋 Değiştirilecek kişi sayısı:**  ${filter.length}\n**🙋 Kalan kişi sayısı:**  ${filter.length}\n**⏲️ Tahmini süre:**  ${sure}\n**📊 İşlem yüzdesi:**  %0`
                                    },
                                    {
                                        name: "Kalan kişiler (" + filter.length + ")",
                                        value: filter.map(a => `<@${a.member.id}>`).slice(0, 40).join(" | ") + (filter.length > 40 ? ` +${filter.length - 40} tane daha...` : "")
                                    }
                                )
                                .setColor("Blue")
                                .setThumbnail(pp)
                                .setTimestamp()
                            mesaj.edit({ embeds: [embed] }).catch(() => { })
                            filter.forEach(async (member2, i) => {
                                dongu += 1
                                await Time.wait(350)
                                await member2.member.setNickname(member2.member.nickname.replace(new RegExp(`(?<=\\s)${member2.yas}(?!\\w)`), (+member2.yas + 1))).catch(err => { })
                                if (filter.length == dongu) return mesaj.edit({ embeds: [embed.setDescription("**• İşlem bitti!**").setFields({ name: "Bilgileri", value: `**📋 Değiştirilen kişi sayısı:**  ${filter.length}\n**🙋 Kalan kişi sayısı:**  0\n**⏲️ Tahmini süre:**  0 saniye\n**📊 İşlem yüzdesi:**  %100` })] }).catch(() => { })
                                else if (Date.now() - 1500 > date) {
                                    date = Date.now()
                                    let fi = filter.slice(i)
                                    mesaj.edit({ embeds: [embed.setFields({ name: "Bilgileri", value: `**📋 Değiştirilecek kişi sayısı:**  ${fi.length}\n**🙋 Kalan kişi sayısı:**  ${fi.length - i}\n**📥 Verilecek rol:**  <@&${rol.id}>\n**⏲️ Tahmini süre:**  ${Time.duration((fi.length - i) * 1200)}\n**📊 İşlem yüzdesi:**  %${(i / fi.length * 100).toFixed(2)}`, name: "Kalan kişiler (" + fi.length + ")", value: fi.map(a => `<@${a.member.id}>`).slice(40).join(" | ") + (filter.length > 40 ? ` +${filter.length - 40} tane daha...` : "") })] }).catch(() => { })
                                }
                            })
                        }
                        async function before() {
                            let kisilerSayfa = []
                                , dongu = 0
                                , kisiler = await msg.client.getMembers(msg)
                            kisiler.forEach(member => {
                                dongu += 1
                                if (!member.user.bot && member.nickname) {
                                    let yas = member.nickname.match(msg.client.regex.getAge)
                                    if (yas) kisilerSayfa.push({ member: member, yas: yas[0], isChange: (guildMe.roles.highest.position > member.roles.highest.position) })
                                }
                                if (kisiler.size == dongu) return after(kisilerSayfa, kisiler)
                            })
                        }
                        return before()
                    }).catch(() => { })
                }
                    break;
                case "çıkart":
                case "düşür":
                case "düşürme":
                case "-":
                case "çıkar": {
                    if (!guildMe.permissions.has("ManageNicknames")) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
                    msg.reply({ embeds: [new EmbedBuilder().setDescription(`• Sunucudaki üyelerin isimlerinde yaş aranıyor, lütfen biraz bekleyiniz... `).setColor("Orange")] }).then(async mesaj => {
                        function after(input, kisiler) {
                            if (input.length == 0) return mesaj.edit({ embeds: [new EmbedBuilder().setDescription(`• Bu sunucudaki üyelerinin isimlerinde yaş ile ilgili hiçbir şey bulamadım şapşik şey seni :( `).setColor("Orange")] }).catch(() => { })
                            let filter = input.filter(a => a.isChange)
                            if (input.length == 0) return mesaj.edit({ embeds: [new EmbedBuilder().setDescription(`• Bu sunucudaki üyelerinin **${input.length}** tanesinin isminde yaş bulundu fakat hiçbirinin ismini değiştirme yetkim yok :( `).setColor("Orange")] }).catch(() => { })
                            let size = kisiler.size
                                , date = Date.now()
                                , dongu = 0
                                , sure = Time.duration({ ms: size * 1200, skipZeros: true })
                                , pp = msg.client.user.displayAvatarURL()
                            const embed = new EmbedBuilder()
                                .setAuthor({ name: `Yaş yükseltme`, iconURL: pp })
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `**📋 Değiştirilecek kişi sayısı:**  ${filter.length}\n**🙋 Kalan kişi sayısı:**  ${filter.length}\n**⏲️ Tahmini süre:**  ${sure}\n**📊 İşlem yüzdesi:**  %0`
                                    },
                                    {
                                        name: "Kalan kişiler (" + filter.length + ")",
                                        value: filter.map(a => `<@${a.member.id}>`).slice(0, 40).join(" | ") + (filter.length > 40 ? ` +${filter.length - 40} tane daha...` : "")
                                    }
                                )
                                .setColor("Blue")
                                .setThumbnail(pp)
                                .setTimestamp()
                            mesaj.edit({ embeds: [embed] }).catch(() => { })
                            filter.forEach(async (member2, i) => {
                                dongu += 1
                                await Time.wait(350)
                                await member2.member.setNickname(member2.member.nickname.replace(new RegExp(`(?<=\\s)${member2.yas}(?!\\w)`), (+member2.yas - 1))).catch(err => { })
                                if (filter.length == dongu) return mesaj.edit({ embeds: [embed.setDescription("**• İşlem bitti!**").setFields({ name: "Bilgileri", value: `**📋 Değiştirilen kişi sayısı:**  ${filter.length}\n**🙋 Kalan kişi sayısı:**  0\n**⏲️ Tahmini süre:**  0 saniye\n**📊 İşlem yüzdesi:**  %100` })] }).catch(() => { })
                                else if (Date.now() - 1500 > date) {
                                    date = Date.now()
                                    let fi = filter.slice(i)
                                    mesaj.edit({ embeds: [embed.setFields({ name: "Bilgileri", value: `**📋 Değiştirilecek kişi sayısı:**  ${fi.length}\n**🙋 Kalan kişi sayısı:**  ${fi.length - i}\n**📥 Verilecek rol:**  <@&${rol.id}>\n**⏲️ Tahmini süre:**  ${Time.duration((fi.length - i) * 1200)}\n**📊 İşlem yüzdesi:**  %${(i / fi.length * 100).toFixed(2)}`, name: "Kalan kişiler (" + fi.length + ")", value: fi.map(a => `<@${a.member.id}>`).slice(40).join(" | ") + (filter.length > 40 ? ` +${filter.length - 40} tane daha...` : "") })] }).catch(() => { })
                                }
                            })
                        }
                        async function before() {
                            let kisilerSayfa = []
                                , dongu = 0
                                , kisiler = await msg.client.getMembers(msg)
                            kisiler.forEach(member => {
                                dongu += 1
                                if (!member.user.bot && member.nickname) {
                                    let yas = member.nickname.match(msg.client.regex.getAge)
                                    if (yas) kisilerSayfa.push({ member: member, yas: yas[0], isChange: (guildMe.roles.highest.position > member.roles.highest.position) })
                                }
                                if (kisiler.size == dongu) return after(kisilerSayfa, kisiler)
                            })
                        }
                        return before()
                    }).catch(() => { })
                }
                    break;
                case "gör": {
                    msg.reply({ embeds: [new EmbedBuilder().setDescription(`• Sunucudaki üyelerin isimlerinde yaş aranıyor, lütfen biraz bekleyiniz... `).setColor("Orange")] }).then(async mesaj => {
                        let kisilerSayfa = []
                            , dongu = 0
                            , kisiler = await msg.client.getMembers(msg)
                        kisiler.forEach(member => {
                            dongu += 1
                            if (!member.user.bot && member.nickname) {
                                let yas = member.nickname.match(msg.client.regex.getAge)
                                if (yas) kisilerSayfa.push({ id: member.id, yas: yas[0], isChange: (guildMe.permissions.has("ManageNicknames") && (guildMe.roles.highest.position > member.roles.highest.position)) })
                            }
                            if (kisiler.size == dongu) {
                                let length = kisilerSayfa.length
                                if (!length) return mesaj.edit({ embeds: [new EmbedBuilder().setDescription(`• Bu sunucudaki üyelerinin isimlerinde yaş ile ilgili hiçbir şey bulamadım şapşik şey seni :( `).setColor("Orange")] }).catch(() => { })
                                let sayfa = Math.ceil(length / 15)
                                    , pp = guild.iconURL()
                                    , embed = new EmbedBuilder()
                                        .setAuthor({ name: msg.client.user.username, iconURL: pp })
                                        .setDescription(`• Sunucudaki üyelerin **__${kisilerSayfa.length}__** tanesinin isminde yaş bulundu\n\n• **İsmini değiştirebilir miyim - Kişi - Yaş**\n${kisilerSayfa.slice(0, 15).map(a => `• ${a.isChange ? ayarlar.emoji.p : ayarlar.emoji.np} - <@${a.id}> - __**${a.yas}**__`).join("\n")}`)
                                        .setThumbnail(pp)
                                        .setColor("Random")
                                        .setFooter({ text: `Sayfa 1/${sayfa}` })
                                if (sayfa == 1) return mesaj.edit({ embeds: [embed] }).catch(() => { })
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
                                mesaj.edit({ embeds: [embed.setFooter({ text: `Sayfa 1/${sayfa}` })], components: [düğme] }).then(a => {
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
                                            const düğmeeditleme2 = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                                            embed.setDescription(`• Sunucudaki üyelerin **__${kisilerSayfa.length}__** tanesinin isminde yaş bulundu\n\n• **İsmini değiştirebilir miyim - Kişi - Yaş**\n${kisilerSayfa.slice((sayfasayısı * 15 - 15), (sayfasayısı * 15)).map(a => `• ${a.isChange ? ayarlar.emoji.p : ayarlar.emoji.np} - <@${a.id}> - __**${a.yas}**__`).join("\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                                            mesaj.edit({ embeds: [embed], components: [düğmeeditleme2] }).catch(err => { })
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
                                            embed.setDescription(`• Sunucudaki üyelerin **__${kisilerSayfa.length}__** tanesinin isminde yaş bulundu\n\n• **İsmini değiştirebilir miyim - Kişi - Yaş**\n${kisilerSayfa.slice((sayfasayısı * 15 - 15), (sayfasayısı * 15)).map(a => `• ${a.isChange ? ayarlar.emoji.p : ayarlar.emoji.np} - <@${a.id}> - __**${a.yas}**__`).join("\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                                            mesaj.edit({ embeds: [embed], components: [düğmeeditleme] }).catch(err => { })
                                        }
                                    })
                                    clin.on("end", async () => {
                                        düğmesağ.setDisabled(true).setStyle(2)
                                        düğmesol.setDisabled(true).setStyle(2)
                                        düğmesil.setDisabled(true).setStyle(2)
                                        düğmesaghizli.setDisabled(true).setStyle(2)
                                        düğmesolhizli.setDisabled(true).setStyle(2)
                                        const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                                        mesaj.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
                                    })
                                }).catch(() => { })
                            }
                        })
                    }).catch(() => { })
                }
                    break;

                default:
                    return hata(`Sunucudaki bütün üyelerin yaşını yükseltmek için **${prefix}yaş yükselt**\n• Çıkarmak için ise **${prefix}yaş çıkart**\n• Kimlerin yaşını değiştirebileceğimi görmek için **${prefix}yaş gör** yazabilirsiniz`, "ne")
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}