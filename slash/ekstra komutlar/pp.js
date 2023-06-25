const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "pp",
    data: new SlashCommandBuilder()
        .setName("pp")
        .setDescription("Bir üyenin profil fotoğrafını gösterir")
        .addSubcommand(subcommand => subcommand.setName('sunucu').setDescription('Sunucunun profil fotoğrafını gösterir'))
        .addSubcommand(subcommand => subcommand.setName('rastgele').setDescription('Rastgele bir üyenin profil fotoğrafını gösterir'))
        .addSubcommand(subcommand => subcommand.setName('üye').setDescription('Etiketlediğiniz üyenin profil fotoğrafını gösterir').addUserOption(user => user.setName("üye").setDescription("üyeyi etiketle"))),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let dugme = new ActionRowBuilder()
                , options = int.options.getSubcommand(false)
            if (options == "sunucu") {
                const serverPicture = guild.iconURL()
                if (serverPicture == "https://i.hizliresim.com/fpvkxry.png") return hata("Bu sunucunun herhangi bir profil resmi bulunmuyor :(")
                dugme.addComponents(new ButtonBuilder().setStyle(5).setURL(serverPicture).setLabel("Tarayıcıda aç"))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: serverPicture })
                    .setDescription(`**[ [PNG](${serverPicture.replace(".gif", ".png")}) ] | [ [JPG](${serverPicture.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${serverPicture.includes(".gif") ? `[GIF](${serverPicture})` : `~~GIF~~`} ] | [ [WEBP](${serverPicture.replace(/\.png|\.gif/, ".webp")}) ]**`)
                    .setImage(serverPicture)
                    .setTimestamp()
                    .setColor("Random")
                return int.reply({ embeds: [embed], components: [dugme] }).catch(err => { })
            }
            let kişi
            if (options == "rastgele") kişi = (await int.client.getMembers(int)).random().user
            else kişi = int.options.getUser("üye", false) || int.user
            let embedler = []
            const kişininfotografı = kişi.displayAvatarURL()
            dugme.addComponents(new ButtonBuilder().setStyle(5).setURL(kişininfotografı).setLabel("Tarayıcıda aç"))
            const embed = new EmbedBuilder()
                .setAuthor({ name: kişi.tag, iconURL: kişininfotografı })
                .setDescription(`**[ [PNG](${kişininfotografı.replace(".gif", ".png")}) ] | [ [JPG](${kişininfotografı.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${kişininfotografı.includes(".gif") ? `[GIF](${kişininfotografı})` : `~~GIF~~`} ] | [ [WEBP](${kişininfotografı.replace(/\.png|\.gif/, ".webp")}) ]**`)
                .setImage(kişininfotografı)
                .setTimestamp()
                .setColor(int.member.displayHexColor ?? "#9e02e2")
            embedler.push(embed)
            const sunucuUye = await int.client.fetchMember(kişi.id, int)
            if (sunucuUye) {
                const sunucupp = sunucuUye.avatarURL()
                if (sunucupp) {
                    const embedsunucupp = new EmbedBuilder()
                        .setDescription(`**[ [PNG](${sunucupp.replace(".gif", ".png")}) ] | [ [JPG](${sunucupp.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${sunucupp.includes(".gif") ? `[GIF](${sunucupp})` : `~~GIF~~`} ] | [ [WEBP](${sunucupp.replace(/\.png|\.gif/, ".webp")}) ]**`)
                        .setImage(sunucupp)
                        .setTimestamp()
                        .setColor(sunucuUye.diplayHexColor ?? "#9e02e2")
                    dugme.addComponents(new ButtonBuilder().setLabel("Sunucu Avatarı").setStyle(5).setURL(sunucupp))
                    embedler.push(embedsunucupp)
                }
            }
            int.reply({ embeds: embedler, components: [dugme] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}