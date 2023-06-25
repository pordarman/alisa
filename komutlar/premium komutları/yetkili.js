const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yetkili",
    aliases: "yetkili",
    pre: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (msgMember.permissions.has("Administrator")) {
                let secenek = args[0]
                switch (secenek) {
                    case "ayarla": {

                        // Kontroller
                        const roles = msg.client.fetchRoles(args.join(" "), msg)
                        if (!roles.size) return hata(`Lütfen rol(leri) etiketleyiniz veya ID'sini giriniz\n\n**Örnek**\n• ${prefix}yetkili ayarla @rol @rol @rol\n• ${prefix}yetkili ayarla ROLID1 ROLID2 ROLID3`)
                        if (roles.some(a => a.managed)) return hata(`Etiketlediğiniz rol(lerden) birisi bir bot rolü. Lütfen başka bir rol(leri) etiketleyiniz`)
                        if (roles.size > 25) return hata(`Hey hey heyyy sence de biraz fazla rol etiketlemedin mi?`)
                    
                        guildDatabase.premium.yetkili = roles.map(a => a.id)
                        hata(`Yetkili rol(leri) başarıyla [${roles.map(a => `<@&${a.id}>`).join(" | ")}] olarak ayarlandı`, "b")
                        db.yazdosya(guildDatabase, guildId)
                        return;
                    }
                    case "sıfırla": {

                        // Kontroller
                        let rol = guildDatabase.premium.yetkili
                        if (!rol) return hata(`Yetkili rolü zaten sıfırlanmış durumda`)
                       
                        delete guildDatabase.premium.yetkili
                        hata(`Yetkili rolü başarıyla sıfırlandı`, "b")
                        db.yazdosya(guildDatabase, guildId)
                        return;
                    }
                    case "etiket": {

                        // Kontroller
                        let rol = guildDatabase.premium.yetkili
                        if (!rol) return hata(`Bu sunucuda herhangi bir yetkili rolü ayarlı değil\n\n• Ayarlamak için **${prefix}yetkili ayarla @rol @rol @rol** yazabilirsiniz`)
                        let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && rol.some(b => a.roles.cache.has(b)))
                        if (kisiler.size == 0) return hata(`Şeyyy.. yetkili rolüne kimse sahip değil şapşik şey seni :(`)
                      
                        let sayfa = Math.ceil(kisiler.size / 50)
                            , map = kisiler.map(a => `<@${a.id}>`)
                        if (sayfa == 1) return msg.reply(`• ${rol.map(a => `<@&${a}>`).join(", ")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Yetkililer (__${kisiler.size}__)**\n• ${map.join(" | ")}`).catch(err => { })
                        msg.reply(`• ${rol.map(a => `<@&${a}>`).join(", ")} \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Yetkililer (__${kisiler.size}__)**\n• ${map.slice(0, 50).join(" | ")}`).catch(err => { })
                        for (let i = 1; i < sayfa; i++) {
                            msg.channel.send(`• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`).catch(err => { })
                        }
                    }
                    case "gör": {

                        // Kontroller
                        let rol = guildDatabase.premium.yetkili
                        if (!rol) return hata(`Bu sunucuda herhangi bir yetkili rolü ayarlı değil\n\n• Ayarlamak için **${prefix}yetkili ayarla @rol** yazabilirsiniz`)
                        let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && rol.some(b => a.roles.cache.has(b)))
                        if (kisiler.size == 0) return hata(`Şeyyy.. yetkili rolüne kimse sahip değil şapşik şey seni :(`)
                       
                        let sayfa = Math.ceil(kisiler.size / 50)
                            , map = kisiler.map(a => `<@${a.id}>`)
                        if (sayfa == 1) return msg.reply({ embeds: [new EmbedBuilder().setDescription(`• ${rol.map(a => `<@&${a}>`).join(", ")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Yetkililer (__${kisiler.size}__)**\n• ${map.join(" | ")}`).setColor("Random")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        msg.reply({ embeds: [new EmbedBuilder().setDescription(`• ${rol.map(a => `<@&${a}>`).join(", ")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Yetkililer (__${kisiler.size}__)**\n• ${map.slice(0, 50).join(" | ")}`).setColor("Random")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        for (let i = 1; i < sayfa; i++) {
                            msg.channel.send({ embeds: [new EmbedBuilder().setDescription(`• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`).setColor("Random")], allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                        }
                    }
                    case "rol": {

                        // Kontroller
                        let rol = guildDatabase.premium.yetkili
                        if (!rol) return hata(`Bu sunucuda herhangi bir yetkili rolü ayarlı değil\n\n• Ayarlamak için **${prefix}yetkili ayarla @rol** yazabilirsiniz`)
                     
                        return msg.reply({ content: `${rol.map(a => `<@&${a}>`).join(", ")} - (Bu rol(lere) sahip olanlara bildirim __gitmedi__)`, allowedMentions: { roles: false } }).catch(err => { })
                    }
                    default:
                        return hata(`Yetkili rollerini ayarlamak için **${prefix}yetkili ayarla**\n• Yetkili rollerini sıfırlamak için **${prefix}yetkili sıfırla**\n• Bütün yetkilileri etiketlemek için **${prefix}yetkili etiket**\n• Bütün yetkilileri bildirim gitmeden görmek için **${prefix}yetkili gör**\n• Yetkili rollerini görmek için **${prefix}yetkili rol** yazabilirsiniz`, "ne", 30000)
                }
            }
            let rol = guildDatabase.premium.yetkili
            if (!rol) return msg.react(ayarlar.emoji.np).catch(err => { })
            let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && rol.some(b => a.roles.cache.has(b)))
            if (kisiler.size == 0) return msg.reply({ content: `${rol.map(a => `<@&${a}>`).join(", ")}`, allowedMentions: { roles: false } }).catch(err => { })
            let sayfa = Math.ceil(kisiler.size / 50)
                , map = kisiler.map(a => `<@${a.id}>`)
            if (sayfa == 1) return msg.reply({ content: `• ${rol.map(a => `<@&${a}>`).join(", ")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• ${map.join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            msg.reply({ content: `• ${rol.map(a => `<@&${a}>`).join(", ")}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• ${map.slice(0, 50).join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            for (let i = 1; i < sayfa; i++) {
                msg.channel.send({ content: `• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}