const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "partner",
    kod: "partner",
    pre: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let secenek = args[0]
            if (msgMember.permissions.has("Administrator")) {
                switch (secenek) {
                    case "ayarla": {
                        let rol = msg.mentions.roles.first() || guild.roles.cache.get(args[1])
                        if (!rol) return hata(`Lütfen bir rol etiketleyiniz veya ID'sini giriniz\n\n**Örnek**\n• ${prefix}partner ayarla @rol\n• ${prefix}partner ayarla ROLID`)
                        if (rol.managed) return hata(`Etiketlediğiniz rol bir bot rolü. Lütfen başka bir rol etiketleyiniz`)
                        if (rol.id == sunucudb.premium.partner) return hata(`Etiketlediğiniz rol zaten parter yetkilisi rolü olarak ayarlanmış durumda`)
                        sunucudb.premium.partner = rol.id
                        hata(`Partner yetkilisi rolü başarıyla <@&${rol.id}> olarak ayarlandı`, "b")
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    }
                    case "sıfırla": {
                        let rol = sunucudb.premium.partner
                        if (!rol) return hata(`Partner yetkilisi rolü zaten sıfırlanmış durumda`)
                        delete sunucudb.premium.partner
                        hata(`Partner yetkilisi rolü başarıyla sıfırlandı`, "b")
                        db.yazdosya(sunucudb, sunucuid)
                        return;
                    }
                    case "etiket": {
                        let rol = sunucudb.premium.partner
                        if (!rol) return hata(`Bu sunucuda herhangi bir partner yetkilisi rolü ayarlı değil\n\n• Ayarlamak için **${prefix}partner ayarla @rol** yazabilirsiniz`)
                        let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.has(rol))
                        if (kisiler.size == 0) return hata(`Şeyyy.. Partner yetkilisi rolüne kimse sahip değil şapşik şey seni :(`)
                        let sayfa = Math.ceil(kisiler.size / 50)
                            , map = kisiler.map(a => `<@${a.id}>`)
                        if (sayfa == 1) return msg.reply(`• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Partner yetkilileri (__${kisiler.size}__)**\n• ${map.join(" | ")}`).catch(err => { })
                        msg.reply(`• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Partner yetkilileri (__${kisiler.size}__)**\n• ${map.slice(0, 50).join(" | ")}`).catch(err => { })
                        for (let i = 1; i < sayfa; i++) {
                            msg.channel.send(`• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`).catch(err => { })
                        }
                    }
                    case "gör": {
                        let rol = sunucudb.premium.partner
                        if (!rol) return hata(`Bu sunucuda herhangi bir partner yetkilisi rolü ayarlı değil\n\n• Ayarlamak için **${prefix}partner ayarla @rol** yazabilirsiniz`)
                        let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.has(rol))
                        if (kisiler.size == 0) return hata(`Şeyyy.. Partner yetkilisi rolüne kimse sahip değil şapşik şey seni :(`)
                        let sayfa = Math.ceil(kisiler.size / 50)
                            , map = kisiler.map(a => `<@${a.id}>`)
                            , role = guild.roles.cache.get(rol)
                        if (sayfa == 1) return msg.reply({ embeds: [new EmbedBuilder().setDescription(`• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Partner yetkilileri (__${kisiler.size}__)**\n• ${map.join(" | ")}`).setColor(role.hexColor ?? "#9e02e2")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        msg.reply({ embeds: [new EmbedBuilder().setDescription(`• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Partner yetkilileri (__${kisiler.size}__)**\n• ${map.slice(0, 50).join(" | ")}`).setColor(role.hexColor ?? "#9e02e2")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        for (let i = 1; i < sayfa; i++) {
                            msg.channel.send({ embeds: [new EmbedBuilder().setDescription(`• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`).setColor(role.hexColor ?? "#9e02e2")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        }
                    }
                    case "rol": {
                        let rol = sunucudb.premium.partner
                        if (!rol) return hata(`Bu sunucuda herhangi bir partner yetkilisi rolü ayarlı değil\n\n• Ayarlamak için **${prefix}partner ayarla @rol** yazabilirsiniz`)
                        return msg.reply({ content: `<@&${rol}> - (Bu role sahip olanlara bildirim __gitmedi__)`, allowedMentions: { roles: false } }).catch(err => { })
                    }
                    default:
                        return hata(`Partner yetkilisi rolü ayarlama için **${prefix}partner ayarla**\n• Partner rolünü sıfırlamak için **${prefix}partner sıfırla**\n• Bütün partner yetkililerini etiketlemek için **${prefix}partner etiket**\n• Bütün partner yetkililerini bildirim gitmeden görmek için **${prefix}partner gör**\n• Partner yetkilisi rolünü görmek için **${prefix}partner rol** yazabilirsiniz`, "ne", 30000)
                }
            }
            let rol = sunucudb.premium.partner
            if (!rol) return msg.react(ayarlar.emoji.np).catch(err => { })
            let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.has(rol))
            if (kisiler.size == 0) return msg.reply({ content: `<@&${rol}>`, allowedMentions: { roles: false } }).catch(err => { })
            let sayfa = Math.ceil(kisiler.size / 50)
                , map = kisiler.map(a => `<@${a.id}>`)
            if (sayfa == 1) return msg.reply({ content: `• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• ${map.join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            msg.reply({ content: `• <@&${rol}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• ${map.slice(0, 50).join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            for (let i = 1; i < sayfa; i++) {
                msg.channel.send({ content: `• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}