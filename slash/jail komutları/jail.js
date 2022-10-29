const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail",
    data: new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Etiketlediğiniz üyeyi jaile atarsınız")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Sebebini giriniz").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let yetkili = sunucudb.jail.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let rol = sunucudb.jail.rol
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${sunucudb.prefix || "."}jail-rol @rol** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (guild.roles.cache.get(rol).position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            const member = int.options.getMember("üye", false)
            if (member.user.bot) return hata(`Botları jaile atamazsın`)
            if (member.id == int.user.id) return hata(`Kendini jaile atamazsın şapşik şey seni :)`)
            if (member.roles.cache.has(rol)) return hata(`Etiketlediğiniz kişide jail rolü zaten bulunuyor`)
            let sunucuJail = db.bul(sunucuid, "jail", "diğerleri"), memberRoles = member.roles.cache.map(a => a.id)
            await member.edit({ roles: [rol] }).then(() => {
                int.reply({ content: `• <@${member.id}> adlı kişi __**${sebep || "Sebep belirtilmemiş"}**__ sebebinden jail'e atıldı! **Ceza numarası:** \`#${sunucudb.sc.sayı}\``, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                sunucuJail[member.id] = memberRoles
                let sebep = int.options.getString("sebep", false)
                    , date = Date.now()
                    , kl = sunucudb.kl[member.id] || []
                kl.unshift({ type: "j", author: int.user.id, timestamp: date, number: sunucudb.sc.sayı })
                sunucudb.kl[member.id] = kl
                let kisi = sunucudb.jail.kisi[member.id] || []
                kisi.unshift({ y: int.user.id, s: sebep, z: date, bool: true })
                sunucudb.jail.kisi[member.id] = kisi
                sunucudb.jail.son.unshift({ s: int.user.id, k: member.id, z: date, se: sebep, bool: true })
                sunucudb.sc.sayı += 1
                let log = sunucudb.jail.log
                if (log) {
                    const zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                    const clientPp = int.client.user.displayAvatarURL()
                    const pp = member.displayAvatarURL()
                    const yapılanSeyler = [
                        `🧰 **JAIL'E ATAN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
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
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                        .setTimestamp()
                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                }
                let tempjaildosya = db.bul(sunucuid, "tempjail", "diğerleri") || {}
                if (tempjaildosya[member.id]) delete tempjaildosya[member.id]
                db.yaz(sunucuid, sunucuJail, "jail", "diğerleri")
                db.yaz(sunucuid, tempjaildosya, "tempjail", "diğerleri")
                db.yazdosya(sunucudb, sunucuid)
            }).catch(err => {
                return hata(`**• <@${member.id}> adlı kişiye jail rolünü veremedim! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n` + "```js\n" + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}