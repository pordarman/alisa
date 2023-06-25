const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "ban",
    aliases: ["forceban", "ban"],
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let banYetkili = guildDatabase.kayıt.bany
            if (banYetkili) {
                if (!msgMember.roles.cache.has(banYetkili) && !msgMember.permissions.has('BanMembers')) return hata(`<@&${banYetkili}> rolüne **veya** Üyeleri Yasakla`, "yetki")
            } else if (!msgMember.permissions.has('BanMembers')) return hata("Üyeleri Yasakla", "yetki")
            if (!guildMe.permissions.has("BanMembers")) return hata("Üyeleri Yasakla", "yetkibot")
            let banlanacakuye = msg.mentions.members.first()
            , memberid
            , ar = args.join(" ")
            if (banlanacakuye) {
                memberid = banlanacakuye.id
                if (memberid == msg.author.id) return hata("Kendini sunucudan yasaklayamazsın :(")
                if (memberid == guild.ownerId) return hata("Sunucu sahibini sunucudan yasaklayamazsın :(")
                if (banlanacakuye.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                if (banlanacakuye.roles.highest.position >= msgMember.roles.highest.position && msg.author.id != guild.ownerId) return hata("Kendi rolünün sırasından yüksek birisini sunucudan yasaklayamazsın şapşik şey seni :(")
                
                let sebep = (ar || "").replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim()

                // Üyeyi sunucudan banlama
                return await guild.members.ban(memberid, { reason: `Yasaklayan: ${msg.author.tag} | Sebebi: ${sebep || "Sebep belirtilmemiş"}` }).then(user => {
                    let modLog = guildDatabase.kayıt.modl
                        , cezaVarMı
                    if (!banlanacakuye.bot) {
                        cezaVarMı = guildDatabase.sc.sayı
                        let kl = guildDatabase.kl[memberid] || []
                        kl.unshift({ type: "ban", author: msg.author.id, timestamp: Date.now(), number: guildDatabase.sc.sayı })
                        guildDatabase.kl[memberid] = kl
                        guildDatabase.sc.sayı += 1
                        db.yazdosya(guildDatabase, guildId)
                    }
                    msg.reply({ content: `${ayarlar.emoji.p} **${banlanacakuye.user.tag} - (${memberid})** başarıyla sunucudan yasaklandı!${cezaVarMı ? ` **Ceza numarası:** \`#${cezaVarMı}\`` : ""}` }).catch(err => { })
                    if (modLog) {
                        let date = (Date.now() / 1000).toFixed(0)
                            , kişininfotografı = banlanacakuye.user.displayAvatarURL()
                            , array = [
                                `**${ayarlar.emoji.tokmak} <@${memberid}> adlı üye __kalıcı__ olarak sunucudan yasaklandı**`,
                                `\n🧰 **BANLAYAN YETKİLİ**`,
                                `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                                `**• Ban tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                                `\n👤 **BANLANAN ÜYE**`,
                                `**• Adı:**  <@${memberid}> - ${banlanacakuye.user.tag}`,
                                `**• Banlanma sebebi:**  ${sebep || "Sebep belirtilmemiş"}`
                            ]
                        if (cezaVarMı) array.push(`**• Ceza numarası:**  \`#${cezaVarMı}\``)
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: banlanacakuye.user.tag, iconURL: kişininfotografı })
                            .setDescription(array.join("\n"))
                            .setThumbnail(kişininfotografı)
                            .setColor("#b90ebf")
                            .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                            .setTimestamp()
                        guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                    }
                }).catch(err => msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```" }).catch(err => { }))
            }
            banlanacakuye = await msg.client.fetchUser(ar)

            // Kontroller
            if (!banlanacakuye) return hata(Time.isNull(banlanacakuye) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            memberid = banlanacakuye.id
            if (memberid == msg.author.id) return hata("Kendini sunucudan yasaklayamazsın :(")
            if (memberid == guild.ownerId) return hata("Sunucu sahibini sunucudan yasaklayamazsın :(")
            const member = await msg.client.fetchMember(memberid, msg)
            if (member) {
                if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                if (member.roles.highest.position >= msgMember.roles.highest.position && msg.author.id != guild.ownerId) return hata("Kendi rolünün sırasından yüksek birisini sunucudan yasaklayamazsın şapşik şey seni :(")
            }
            let sebep = (ar || "").replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim()

            // Üyeyi sunucuda olmadan banlama
            await guild.members.ban(memberid, { reason: `Yasaklayan: ${msg.author.tag} | Sebebi: ${sebep || "Sebep belirtilmemiş"}` }).then(user => {
                let modLog = guildDatabase.kayıt.modl
                    , cezaVarMı
                if (!banlanacakuye.bot) {
                    cezaVarMı = guildDatabase.sc.sayı
                    let kl = guildDatabase.kl[memberid] || []
                    kl.unshift({ type: "ban", author: msg.author.id, timestamp: Date.now(), reason: sebep, number: guildDatabase.sc.sayı })
                    guildDatabase.kl[memberid] = kl
                    guildDatabase.sc.sayı += 1
                    db.yazdosya(guildDatabase, guildId)
                }
                msg.reply({ content: `${ayarlar.emoji.p} **${banlanacakuye.tag} - (${memberid})** başarıyla sunucudan yasaklandı!${!member ? " - *( Bu kişi sunucuda değildi )*" : ""}${cezaVarMı ? ` **Ceza numarası:** \`#${cezaVarMı}\`` : ""}` }).catch(err => { })
                if (modLog) {
                    let date = (Date.now() / 1000).toFixed(0)
                        , kişininfotografı = user.displayAvatarURL()
                        , array = [
                            `**${ayarlar.emoji.tokmak} <@${memberid}> adlı üye __kalıcı__ olarak sunucudan yasaklandı**`,
                            `\n🧰 **BANLAYAN YETKİLİ**`,
                            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                            `**• Ban tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                            `\n👤 **BANLANAN ÜYE**`,
                            `**• Adı:**  <@${memberid}> - ${user.tag}`,
                            `**• Banlanma sebebi:**  ${sebep || "Sebep belirtilmemiş"}`
                        ]
                    if (cezaVarMı) array.push(`**• Ceza numarası:**  \`#${cezaVarMı}\``)
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: user.tag, iconURL: kişininfotografı })
                        .setDescription(array.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#b90ebf")
                        .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                        .setTimestamp()
                    guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                }
            }).catch(err => msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```" }).catch(err => { }))
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}