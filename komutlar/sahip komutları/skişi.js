const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["s-kişi"],
    name: "sahip kişi",
    owner: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let kisiId
                , user
                , userMention = msg.mentions.users.first()
            if (userMention) {
                kisiId = userMention.id
                user = userMention
            } else {
                kisiId = args[0]
                if (!kisiId) return msg.reply({ content: `Lütfen bir kişi ID'si giriniz` }).catch(err => { })
                user = await msg.client.fetchUserForce(kisiId)
                if (!user) return msg.reply({ content: `Lütfen kişinin ID'sini düzgün yazdığınızdan emin olunuz ` }).catch(err => { })
            }
            msg.reply({ content: `• <@${kisiId}> - (${user.tag}) adlı kişi botun komutlarını toplamda **${alisa.kisiler[kisiId] || "0"} kere** kullanmış` }).catch(err => { })
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}