const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "banner",
    data: new SlashCommandBuilder()
        .setName("banner")
        .setDescription("Bir üyenin bannerini gösterir")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const kişi = int.options.getUser("üye", false)
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
                    .setColor(int.member.displayHexColor ?? "#9e02e2")
                return int.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            } else {
                await int.user.fetch(true)
                const kişininbanneri = int.user.bannerURL()
                if (!kişininbanneri) return hata("Sizin banneriniz bulunmuyor :(")
                let dugme = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setURL(kişininbanneri).setLabel("Tarayıcıda aç"))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: int.user.tag, iconURL: int.user.displayAvatarURL() })
                    .setDescription(`**[ [PNG](${kişininbanneri.replace(".gif", ".png")}) ] | [ [JPG](${kişininbanneri.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${kişininbanneri.includes(".gif") ? `[GIF](${kişininbanneri})` : `~~GIF~~`} ] | [ [WEBP](${kişininbanneri.replace(/\.png|\.gif/, ".webp")}) ]**`)
                    .setImage(kişininbanneri)
                    .setTimestamp()
                    .setColor(int.member.displayHexColor ?? "#9e02e2")
                return int.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            }
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}