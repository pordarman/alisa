const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "kayıtsızlar",
    aliases: ["kayıtsızlar", "kayıtsız-etiketle", "kayıtsızetiket", "kayıtsızlarıetiketle"],
    pre: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {      
            
            // Kontroller
            let yetkili = guildDatabase.kayıt.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let kayıtsız = guildDatabase.kayıt.kayıtsız
            if (!kayıtsız) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz` : ""}`)
            
            let rol
            if (guildDatabase.kayıt.secenek) rol = guildDatabase.kayıt.normal || []
            else rol = [...(guildDatabase.kayıt.erkek || []), ...(guildDatabase.kayıt.kız || [])]
            let kisiler = (await msg.client.getMembers(msg)).filter(a => !a.user.bot && a.roles.cache.has(kayıtsız) && !rol.some(b => a.roles.cache.has(b)))
            if (kisiler.size == 0) return msg.reply(`• Bu sunucuda kimse kayıtsız değil oley!`).catch(err => { })
            let sayfa = Math.ceil(kisiler.size / 50)
                , map = kisiler.map(a => `<@${a.id}>`)
            if (sayfa == 1) return msg.reply(`• <@&${kayıtsız}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Kayıtsızlar (__${kisiler.size}__)**\n• ${map.join(" | ")}`).catch(err => { })
            msg.reply(`• <@&${kayıtsız}>\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n• **Kayıtsızlar (__${kisiler.size}__)**\n• ${map.slice(0, 50).join(" | ")}`).catch(err => { })
            for (let i = 1; i < sayfa; i++) {
                msg.channel.send(`• ${map.slice((50 * i), (50 * i + 50)).join(" | ")}`).catch(err => { })
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
