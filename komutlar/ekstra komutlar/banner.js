const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 3,
    name: "banner",
    kod: ["afiş", "banner"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let kişi = msg.mentions.users.first() || await msg.client.fetchUser(args[0], msg)
            if (kişi) {
                await kişi.fetch(true)
                const kişininbanneri = kişi.bannerURL()
                if (!kişininbanneri) return hata("Etiketlediğiniz kişinin banneri bulunmuyor :(")
                let dugme = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setURL(kişininbanneri).setLabel("Tarayıcıda aç"))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: kişi.tag, iconURL: kişi.displayAvatarURL() })
                    .setDescription(`**[ [PNG](${kişininbanneri.replace(".gif", ".png")}) ] | [ [JPG](${kişininbanneri.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${kişininbanneri.includes(".gif") ? `[GIF](${kişininbanneri})` : `~~GIF~~`} ] | [ [WEBP](${kişininbanneri.replace(/\.png|\.gif/, ".webp")}) ]**`)
                    .setImage(kişininbanneri)
                    .setTimestamp()
                    .setColor(msgMember.displayHexColor ?? "#9e02e2")
                return msg.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            } else {
                await msg.author.fetch(true)
                const kişininbanneri = msg.author.bannerURL()
                if (!kişininbanneri) return hata("Sizin banneriniz bulunmuyor :(")
                let dugme = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setURL(kişininbanneri).setLabel("Tarayıcıda aç"))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
                    .setDescription(`**[ [PNG](${kişininbanneri.replace(".gif", ".png")}) ] | [ [JPG](${kişininbanneri.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${kişininbanneri.includes(".gif") ? `[GIF](${kişininbanneri})` : `~~GIF~~`} ] | [ [WEBP](${kişininbanneri.replace(/\.png|\.gif/, ".webp")}) ]**`)
                    .setImage(kişininbanneri)
                    .setTimestamp()
                    .setColor(msgMember.displayHexColor ?? "#9e02e2")
                return msg.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            }
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}