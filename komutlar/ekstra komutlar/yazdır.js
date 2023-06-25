const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yazdır",
    aliases: ["yaz", "yazdır"],
    cooldown: 10,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            if (!args[0]) return hata("Lütfen yazmamı istediğiniz mesajı yazınız\n\n**• Heyy eğer bir mesajı alıntılamamı istiyorsanız __komutu kullanırken mesajı alıntılaman__ yeterlii. Aşağıya bir tane görsel bıraktım oraya bi göz at bence :3**", "h", 12500, { image: "https://i.hizliresim.com/j44bees.png" })
            
            msg.delete().catch(err => { })
            let messageReferenceId = msg.reference?.messageId
                , yazdırılacakYazı = msg.content.slice(msg.content.search(/(?<= *yaz(d[ıi]r)? ).+/i))
                , channel = msg.channel
            if (messageReferenceId) {
                let messageReference = channel.messages.cache.get(messageReferenceId) || await channel.messages.fetch(messageReferenceId).catch(err => { })
                if (!messageReference) return channel.send({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
                return messageReference.reply({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
            }
            return channel.send({ content: yazdırılacakYazı, allowedMentions: { roles: false, users: false, repliedUser: true } }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}