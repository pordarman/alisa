const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 3,
    name: "jail",
    aliases: "jail",
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
            let rol = guildDatabase.jail.rol
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}jail-rol @rol** yazabilirsiniz` : ""}`)
            if (!guildMe.permissions.has('ManageRoles')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (guild.roles.cache.get(rol).position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let j = args.join(" ")
            const member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (member.user.bot) return hata(`Botları jaile atamazsın`)
            if (member.id == msg.author.id) return hata(`Kendini jaile atamazsın şapşik şey seni :)`)
            if (member.roles.cache.has(rol)) return hata(`Etiketlediğiniz kişide jail rolü zaten bulunuyor`)


            let sunucuJail = db.bul(guildId, "jail", "diğerleri") || {}
                , memberRoles = member.roles.cache.map(a => a.id)

            // Üyeyi jaile atma
            await member.edit({ roles: [rol] }).then(() => {
                sunucuJail[member.id] = memberRoles
                let sebep = j?.replace(new RegExp(`<@!?${member.id}>|${member.id}`, "g"), "")?.replace(/ +/g, " ")?.trim() || undefined
                    , date = Date.now()
                    , kl = guildDatabase.kl[member.id] || []
                kl.unshift({ type: "j", author: msg.author.id, timestamp: date, number: guildDatabase.sc.sayı })
                guildDatabase.kl[member.id] = kl
                msg.react(ayarlar.emoji.p).catch(err => { })
                let kisi = guildDatabase.jail.kisi[member.id] || []
                kisi.unshift({ y: msg.author.id, s: sebep, z: date, bool: true })
                guildDatabase.jail.kisi[member.id] = kisi
                guildDatabase.jail.son.unshift({ s: msg.author.id, k: member.id, z: date, se: sebep, bool: true })
                msg.reply({ content: `• <@${member.id}> adlı kişi __**${sebep || "Sebep belirtilmemiş"}**__ sebebinden jail'e atıldı! **Ceza numarası:** \`#${guildDatabase.sc.sayı}\``, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                let tempjaildosya = db.bul(guildId, "tempjail", "diğerleri") || {}
                if (tempjaildosya[member.id]) delete tempjaildosya[member.id]
                db.yaz(guildId, tempjaildosya, "tempjail", "diğerleri")
                db.yaz(guildId, sunucuJail, "jail", "diğerleri")
                guildDatabase.sc.sayı += 1
                let log = guildDatabase.jail.log
                if (log) {
                    const zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                    const clientPp = msg.client.user.displayAvatarURL()
                    const pp = member.displayAvatarURL()
                    const yapılanSeyler = [
                        `🧰 **JAIL'E ATAN YETKİLİ**`,
                        `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                        `**• Jail'e atma zamanı:**  ${zaman}`,
                        `\n👤 **JAIL'E ATILAN KİŞİ**`,
                        `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                        `**• Verilen rol:**  <@&${rol}>`,
                        `**• Sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                        `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                    ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: pp })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(pp)
                        .setColor("#af0003")
                        .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: clientPp })
                        .setTimestamp()
                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                }
                db.yazdosya(guildDatabase, guildId)
                return;
            }).catch(err => {
                return hata(`**• <@${member.id}> adlı kişiye jail rolünü veremedim! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n` + "```js\n" + err + "```")
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


