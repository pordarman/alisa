const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 3,
    name: "jail sil",
    kod: "jail-sil",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {       
            let yetkili = sunucudb.jail.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            const member = msg.mentions.users.first() || await msg.client.fetchUser(args[0], msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki başka bir şeyin ID'sini yazdınız :( Lütfen geçerli bir kişi ID'si giriniz" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (member.bot) return hata(`Botların jail bilgilerini silemezsin şapşik şey seni :)`)
            if (member.id == msg.author.id) return hata(`Kendi jail bilgini silemezsin şapşik şey seni :)`)
            const den = sunucudb.jail.kisi[member.id]
            if (!den) return hata(`Etiketlediğiniz kişi daha önceden hiç jail'e atılmamış oley 🎉`)
            msg.react(ayarlar.emoji.p).catch(err => { })
            delete sunucudb.jail.kisi[member.id]
            msg.reply({ content: `• <@${member.id}> kişisinin jail bilgileri <@${msg.author.id}> tarafından silindi`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
            let log = sunucudb.jail.log
            if (log) {
                let date = Date.now()
                    , zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                    , pp = member.displayAvatarURL()
                    , yapılanSeyler = [
                        `🧰 **JAIL BİLGİLERİNİ SİLEN YETKİLİ**`,
                        `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                        `**• Tarihi:**  ${zaman}`,
                        `\n👤 **JAIL BİLGİLERİ SİLİNEN KİŞİ**`,
                        `**• Adı:**  <@${member.id}> - ${member.tag}`,
                        `**• Kaç kere jaile atıldı:**  ${den.filter(a => a.bool == true).length} kere`,
                    ]
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: member.tag, iconURL: pp })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(pp)
                        .setColor("#af0003")
                        .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                        .setTimestamp()
                guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
            }
            db.yazdosya(sunucudb, sunucuid)
            return;
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


