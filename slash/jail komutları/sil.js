const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail sil",
    data: new SlashCommandBuilder()
        .setName("jail-sil")
        .setDescription("Bir üyenin jail bilgilerini siler")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true)),
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
            const member = int.options.getMember("üye", true)
            if (member.user.bot) return hata(`Botların jail bilgilerini silemezsin şapşik şey seni :)`)
            if (member.id == int.user.id) return hata(`Kendi jail bilgini silemezsin şapşik şey seni :)`)
            const den = sunucudb.jail.kisi[member.id]
            if (!den) return hata(`Etiketlediğiniz kişi daha önceden hiç jail'e atılmamış oley 🎉`)
            delete sunucudb.jail.kisi[member.id]
            int.reply({ content: `• <@${member.id}> kişisinin jail bilgileri <@${int.user.id}> tarafından silindi`, allowedMentions: { users: false, repliedUser: true } }).catch(err => { })
            let log = sunucudb.jail.log
            if (log) {
                let date = Date.now()
                    , zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                    , pp = member.displayAvatarURL()
                    , yapılanSeyler = [
                        `🧰 **JAIL BİLGİLERİNİ SİLEN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Tarihi:**  ${zaman}`,
                        `\n👤 **JAIL BİLGİLERİ SİLİNEN KİŞİ**`,
                        `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                        `**• Kaç kere jaile atıldı:**  ${den.filter(a => a.bool == true).length} kere`,
                    ]
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: pp })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(pp)
                        .setColor("#af0003")
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: int.client.user.displayAvatarURL() })
                        .setTimestamp()
                guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
            }
            db.yazdosya(sunucudb, sunucuid)
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}