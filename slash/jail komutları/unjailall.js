const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "unjailall",
    data: new SlashCommandBuilder()
        .setName("unjailall")
        .setDescription("Bütün üyeleri jail'den çıkarırsınız"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let yetkili = sunucudb.jail.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let rol = sunucudb.jail.rol
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${sunucudb.prefix || ayarlar.prefix}jail-rol @rol** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
            let roll = guild.roles.cache.get(rol)
            if (roll.position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            const kisiler = roll.members.filter(a => !a.user.bot)
            if (kisiler.size == 0) return hata(`Iıııı görüşüne göre kimse jail'de değil...`)
            const dugmevet = new ButtonBuilder()
                .setStyle(1)
                .setEmoji(ayarlar.emoji.p)
                .setLabel("Evet")
                .setCustomId("evet")
            const dugmehayir = new ButtonBuilder()
                .setStyle(4)
                .setEmoji(ayarlar.emoji.sil)
                .setLabel("Hayır")
                .setCustomId("hayır")
            const dugmeler = new ActionRowBuilder().addComponents(dugmevet).addComponents(dugmehayir)
            int.reply({ content: `❗ Bütün herkesi jailden çıkarmak istediğinizden emin misiniz? (${kisiler.size} kişi)`, components: [dugmeler], fetchReply: true }).then(a => {
                const filter = i => ["evet", "hayır"].includes(i.customId) && i.user.id === int.user.id
                const clin = a.createMessageComponentCollector({ filter: filter, time: 30 * 1000 })
                clin.on("collect", async oklar => {
                    if (oklar.customId == "evet") {
                        const clientPp = int.client.user.displayAvatarURL()
                        a.edit({ content: "İşlem sürüyor..." }).catch(err => { })
                        let hatalar = []
                        let embedlar = []
                            , sunucuJail = db.bul(sunucuid, "jail", "diğerleri")
                            , dongu = 0
                        if (sunucuJail) {
                            kisiler.forEach(async a => {
                                dongu += 1
                                let kl = sunucudb.kl[a.id] || []
                                kl.unshift({ type: "uj", author: int.user.id, timestamp: Date.now() })
                                sunucudb.kl[a.id] = kl
                                await Time.wait(350)
                                await a.edit({ roles: (sunucuJail[a.id] ? sunucuJail[a.id].filter(b => guild.roles.cache.has(b)) : a.roles.cache.filter(b => b.id != rol).map(b => b.id)) }).catch(err => hatalar.push(`<@${a.id}>`)).then(err => delete sunucuJail[a.id])
                                if (dongu == kisiler.size) return son()
                            })
                        } else {
                            kisiler.forEach(async a => {
                                dongu += 1
                                let kl = sunucudb.kl[a.id] || []
                                kl.unshift({ type: "uj", author: int.user.id, timestamp: Date.now() })
                                sunucudb.kl[a.id] = kl
                                await Time.wait(350)
                                await a.roles.remove(rol).catch(err => hatalar.push(`<@${a.id}>`))
                                if (dongu == kisiler.size) return son()
                            })
                        }
                        function son() {
                            if (hatalar.length) {
                                const embed = new EmbedBuilder()
                                    .setTitle("Hata")
                                    .setDescription(`**• Aşağıda belirttiğim kişilerden jail rolünü alamadım! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n${hatalar.join(", ")}`)
                                    .setColor("Red")
                                    .setTimestamp()
                                embedlar.push(embed)
                            }
                            const jaildencikarilankisiler = kisiler.filter(a => !hatalar.includes(`<@${a.id}>`))
                            if (jaildencikarilankisiler.size) {
                                const date = Date.now()
                                jaildencikarilankisiler.forEach(a => {
                                    let kisi = sunucudb.jail.kisi[a.id] || []
                                    kisi.unshift({ y: int.user.id, z: date, bool: false })
                                    sunucudb.jail.kisi[a.id] = kisi
                                    sunucudb.jail.son.unshift({ s: int.user.id, k: a.id, z: date, bool: false })
                                })
                                const cikarilan = jaildencikarilankisiler.map(a => `<@${a.id}>`).slice(0, 90).join(", ") + (jaildencikarilankisiler.size > 90 ? ` +${jaildencikarilankisiler.size - 90} kişi daha...` : "")
                                const zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                                const pp = int.user.displayAvatarURL()
                                const embed = new EmbedBuilder()
                                    .setAuthor({ name: "Herkes Jail'den çıkarıldı", iconURL: guild.iconURL() })
                                    .addFields(
                                        {
                                            name: '» Jail\'den çıkaran yetkili',
                                            value: "<@" + int.user.id + ">"
                                        },
                                        {
                                            name: "» Jail\'den çıkarılma tarihi",
                                            value: zaman
                                        },
                                        {
                                            name: "» Jail\'den çıkarılan kişiler (" + jaildencikarilankisiler.size + ")",
                                            value: cikarilan
                                        }
                                    )
                                    .setColor("Blue")
                                    .setThumbnail(pp)
                                    .setFooter({ text: `${int.client.user.username} Jail sistemi`, iconURL: clientPp })
                                    .setTimestamp()
                                embedlar.push(embed)
                                let log = sunucudb.jail.log
                                if (log) {
                                    const yapılanSeyler = [
                                        `🧰 **JAIL'DEN ÇIKARAN YETKİLİ**`,
                                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                                        `**• Jail'den çıkarılma zamanı:**  ${zaman}`,
                                        `\n👤 **JAIL'DEN ÇIKARILAN KİŞİLER (${jaildencikarilankisiler.size})**`,
                                        `**• Alınan rol:**  <@&${rol}>`,
                                    ]
                                    const embed = new EmbedBuilder()
                                        .setAuthor({ name: int.user.tag, iconURL: pp })
                                        .setDescription(yapılanSeyler.join("\n"))
                                        .addFields(
                                            {
                                                name: `Jail'den çıkarılan kişiler (${jaildencikarilankisiler.size})`,
                                                value: cikarilan
                                            }
                                        )
                                        .setThumbnail(pp)
                                        .setColor("#af0003")
                                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                                        .setTimestamp()
                                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                                }
                                let tempjaildosya = db.buldosya("tempjail", "diğerleri")
                                delete tempjaildosya[sunucuid]
                                db.yazdosya(tempjaildosya, "tempjail", "diğerleri")
                            }
                            a.edit({ embeds: embedlar, components: [], content: `İşlem bitti!` }).catch(err => { })
                            db.yazdosya(sunucudb, sunucuid)
                            db.yaz(sunucuid, sunucuJail, "jail", "diğerleri")
                            return;
                        }
                    } else return a.edit({ content: "İşlem iptal edildi", components: [] }).catch(err => { })
                })
                clin.on("end", async err => {
                    return a.edit({ content: a.content + " - *Bu mesaj artık aktif değildir*", components: [] }).catch(err => { })
                })
            }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}