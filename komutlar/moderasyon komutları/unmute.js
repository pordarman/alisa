const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    aliases: "unmute",
    name: "unmute",
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let muteYetkili = guildDatabase.kayıt.mutey
            if (muteYetkili) {
                if (!msgMember.roles.cache.has(muteYetkili) && !msgMember.permissions.has('ModerateMembers')) return hata(`<@&${muteYetkili}> rolüne **veya** Üyelere zaman aşımı uygula`, "yetki")
            } else if (!msgMember.permissions.has('ModerateMembers')) return hata("Üyelere zaman aşımı uygula", "yetki")
            if (!msgMember.permissions.has("ModerateMembers")) return hata(`Üyelere zaman aşımı uygula`, "yetki")
            if (!guildMe.permissions.has("ModerateMembers")) return hata("Üyelere zaman aşımı uygula", "yetkibot")
            const member = msg.mentions.members.first() || await msg.client.fetchMember(args.join(" "), msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (!member.communicationDisabledUntilTimestamp) return hata(`Etiketlediğiniz kişi zaten şu anda susturulmuş değil`)
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            
            // Üyenin susturmasını kaldırma
            await member.timeout(null, `Mutesini kaldıran yetkili: ${msg.author.tag}`).then(() => {
                let modLog = guildDatabase.kayıt.modl
                if (modLog) {
                    let date = (Date.now() / 1000).toFixed(0)
                        , kişininfotografı = member.displayAvatarURL()
                        , array = [
                            `**🔊 <@${member.id}> adlı üyenin susturulması kaldırıldı**`,
                            `\n🧰 **SUSTURMAYI AÇAN YETKİLİ**`,
                            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                            `**• Susturmayı açtığı tarihi:**  <t:${date}:F> - <t:${date}:R>`,
                            `\n👤 **SUSTURULMASI AÇILAN ÜYE**`,
                            `**• Adı:**  <@${member.id}> - ${member.user.tag}`
                        ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                        .setDescription(array.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#b90ebf")
                        .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                        .setTimestamp()
                    guild.channels.cache.get(modLog)?.send({ embeds: [embed] }).catch(err => { })
                }
                let sunucumute = db.bul(guildId, "mute", "diğerleri") || {}
                delete sunucumute[member.id]
                let kl = guildDatabase.kl[member.id] || []
                kl.unshift({ type: "unmute", author: msg.author.id, timestamp: Date.now() })
                guildDatabase.kl[member.id] = kl
                msg.reply({ content: `• <@${member.id}> adlı kişinin susturulması başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                db.yazdosya(guildDatabase, guildId)
                db.yaz(guildId, sunucumute, "mute", "diğerleri")
                return;
            }).catch(err => {
                console.log(err)
                msg.reply({ content: 'Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js' + err + "```" }).catch(err => { })
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}