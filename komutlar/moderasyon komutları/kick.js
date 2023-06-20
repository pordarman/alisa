const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "kick",
    aliases: ["at", "kick"],
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let kickYetkili = sunucudb.kayıt.kicky
            if (kickYetkili) {
                if (!msgMember.roles.cache.has(kickYetkili) && !msgMember.permissions.has('KickMembers')) return hata(`<@&${kickYetkili}> rolüne **veya** Üyeleri At`, "yetki")
            } else if (!msgMember.permissions.has('KickMembers')) return hata("Üyeleri At", "yetki")
            if (!guildMe.permissions.has("KickMembers")) return hata("Üyeleri At", "yetkibot")
            let j = args.join(" ")
            const member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            const memberid = member.id
            if (memberid == msg.author.id) return hata("Kendini sunucudan atamazsın :(")
            if (memberid == guild.ownerId) return hata("Sunucu sahibini sunucudan atamazsın :(")
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            if (member.roles.highest.position >= msgMember.roles.highest.position && msg.author.id != guild.ownerId) return hata("Kendi rolünün sırasından yüksek birisini sunucudan yasaklayamazsın şapşik şey seni :(")
         
            let sebep = (j || "").replace(new RegExp(`<@!?${memberid}>|${memberid}`, "g"), "").replace(/ +/g, " ").trim()
            
            // Üyeyi sunucudan atma
            await member.kick(`Yasaklayan: ${msg.author.tag} | Sebebi: ${sebep || "Sebep belirtilmemiş"}`).then(() => {
                let modLog = sunucudb.kayıt.modl
                , cezaVarMı
                if (!member.user.bot) {
                    cezaVarMı = sunucudb.sc.sayı
                    let kl = sunucudb.kl[memberid] || []
                    kl.unshift({ type: "kick", author: msg.author.id, timestamp: Date.now(), reason: sebep, number: sunucudb.sc.sayı })
                    sunucudb.kl[memberid] = kl
                    sunucudb.sc.sayı += 1
                    db.yazdosya(sunucudb, sunucuid)
                }
                msg.reply({ content: `${ayarlar.emoji.p} **${member.user.tag} - (${memberid})** başarıyla sunucudan atıldı!${cezaVarMı ? ` **Ceza numarası:** \`#${cezaVarMı}\`` : ""}` }).catch(err => { })
                if (modLog) {
                    let date = (Date.now() / 1000).toFixed(0)
                        , kişininfotografı = member.user.displayAvatarURL()
                        , array = [
                            `**👟 <@${memberid}> adlı üye olarak sunucudan atıldı**`,
                            `\n🧰 **ATAN YETKİLİ**`,
                            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                            `**• Atılma tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                            `\n👤 **ATILAN ÜYE**`,
                            `**• Adı:**  <@${memberid}> - ${member.user.tag}`,
                            `**• Atılma sebebi:**  ${sebep || "Sebep belirtilmemiş"}`
                        ]
                    if (cezaVarMı) array.push(`**• Ceza numarası:**  \`#${cezaVarMı}\``)
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
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
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}