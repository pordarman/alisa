const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "pp",
    aliases: ["av", "avatar", "pp"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let dugme = new ActionRowBuilder()
            if (["server", "sunucu", "s"].includes(args[0]?.toLocaleLowerCase())) {
                const serverPicture = guild.iconURL()
                if (serverPicture == "https://i.hizliresim.com/fpvkxry.png") return hata("Bu sunucunun herhangi bir profil resmi bulunmuyor :(")
                dugme.addComponents(new ButtonBuilder().setStyle(5).setURL(serverPicture).setLabel("Tarayıcıda aç"))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: serverPicture })
                    .setDescription(`**[ [PNG](${serverPicture.replace(".gif", ".png")}) ] | [ [JPG](${serverPicture.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${serverPicture.includes(".gif") ? `[GIF](${serverPicture})` : `~~GIF~~`} ] | [ [WEBP](${serverPicture.replace(/\.png|\.gif/, ".webp")}) ]**`)
                    .setImage(serverPicture)
                    .setTimestamp()
                    .setColor("Random")
                return msg.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            }
            let kişi
            if (["random", "rastgele", "r"].includes(args[0]?.toLocaleLowerCase())) kişi = (await msg.client.getMembers(msg)).random().user
            else kişi = msg.mentions.users.first() || await msg.client.fetchUser(args[0], msg) || msg.author
            let embedler = []
            const kişininfotografı = kişi.displayAvatarURL()
            dugme.addComponents(new ButtonBuilder().setStyle(5).setURL(kişininfotografı).setLabel("Tarayıcıda aç"))
            const embed = new EmbedBuilder()
                .setAuthor({ name: kişi.tag, iconURL: kişininfotografı })
                .setDescription(`**[ [PNG](${kişininfotografı.replace(".gif", ".png")}) ] | [ [JPG](${kişininfotografı.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${kişininfotografı.includes(".gif") ? `[GIF](${kişininfotografı})` : `~~GIF~~`} ] | [ [WEBP](${kişininfotografı.replace(/\.png|\.gif/, ".webp")}) ]**`)
                .setImage(kişininfotografı)
                .setTimestamp()
                .setColor(msgMember.displayHexColor ?? "#9e02e2")
            embedler.push(embed)
            const sunucuUye = await msg.client.fetchMember(kişi.id, msg)
            if (sunucuUye) {
                const sunucupp = sunucuUye.avatarURL()
                if (sunucupp) {
                    const embedsunucupp = new EmbedBuilder()
                        .setDescription(`**[ [PNG](${sunucupp.replace(".gif", ".png")}) ] | [ [JPG](${sunucupp.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${sunucupp.includes(".gif") ? `[GIF](${sunucupp})` : `~~GIF~~`} ] | [ [WEBP](${sunucupp.replace(/\.png|\.gif/, ".webp")}) ]**`)
                        .setImage(sunucupp)
                        .setTimestamp()
                        .setColor(msgMember.diplayHexColor ?? "#9e02e2")
                    dugme.addComponents(new ButtonBuilder().setLabel("Sunucu Avatarı").setStyle(5).setURL(sunucupp))
                    embedler.push(embedsunucupp)
                }
            }
            msg.reply({ embeds: embedler, components: [dugme] }).catch(err => { })
        } catch (e) {
             msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
             msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}