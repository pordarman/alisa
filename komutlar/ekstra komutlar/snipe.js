const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 10,
    name: "snipe",
    kod: "snipe",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has("ManageMessages")) return hata("Mesajları Yönet", "yetki")
            let snipe = db.bul(msg.channelId, "snipe", "diğerleri")
            if (!snipe) return msg.react(ayarlar.emoji.p)
            let kisi = msg.mentions.users.first() || await msg.client.fetchUser(args.join(" "))
                , sahip
            if (kisi) {
                snipe = snipe[kisi.id]
                if (!snipe) return msg.react(ayarlar.emoji.p)
                sahip = kisi.id
            } else {
                sahip = snipe.son
                snipe = snipe[snipe.son]
            }
            let içerik = snipe.i || "> *Mesaj bilinmiyor???*"
            if (içerik.length > 1024) içerik = içerik.slice(0, 1020) + " ..."
            const embed = new EmbedBuilder()
                .setDescription(`• **Mesajın sahibi:**  <@${sahip}>\n\nMesajın yazılma zamanı **<t:${(snipe.z / 1000).toFixed(0)}:R>**\nMesajın silinme zamanı **<t:${(snipe.s / 1000).toFixed(0)}:R>**`)
                .addFields(
                    {
                        name: 'Mesajın içeriği',
                        value: içerik
                    }
                )
                .setColor('#980d9e')
                .setTimestamp()
                .setImage(snipe.resim)
            let uye = await msg.client.fetchUserForce(sahip)
            if (uye) embed.setAuthor({ name: uye.tag, iconURL: uye.displayAvatarURL() })
            else embed.setAuthor({ name: "Deleted User#0000", iconURL: "https://cdn.discordapp.com/embed/avatars/1.png" })
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}