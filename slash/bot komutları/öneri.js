const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "öneri",
    data: new SlashCommandBuilder()
        .setName("öneri")
        .setDescription("Bot hakkında öneri yapabilirsiniz")
        .addStringOption(option => option.setName("mesaj").setDescription("öneriniz").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const öneri = int.options.getString("mesaj", true)
            int.reply({ content: `💬 **Öneriniz alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**`, ephemeral: true }).catch(err => { })
            const sayı = db.topla(int.user.id, 1, "öneri toplam", "diğerleri", false)
            let bilgiler = [
                `**👤 Yazan kişi:**  ${int.user.tag} - (${int.user.id})`,
                `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${guildId})`,
                `**🎞️ Yazdığı kanal:**  #${int.channel.name} - (${int.channelId})`
            ]
            const embed = new EmbedBuilder()
                .setTitle("💬 Bir yeni öneri var")
                .setDescription(`• <@${int.user.id}> adlı kişi toplamda **${sayı}** kere öneri yaptı!`)
                .addFields(
                    {
                        name: "BİLGİLERİ",
                        value: bilgiler.join("\n")
                    },
                    {
                        name: "ÖNERİ",
                        value: öneri
                    },
                    {
                        name: `${ayarlar.emoji.p} Gelsin diye kişi sayısı`,
                        value: "0",
                        inline: true
                    },
                    {
                        name: `${ayarlar.emoji.np} Gelmesin diye kişi sayısı`,
                        value: "0",
                        inline: true
                    }
                )
                .setColor("#41b6cc")
                .setFooter({ text: `${int.client.user.username} teşekkür eder..` })
            let mesaj = await int.client.sendChannel({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Gelsin bence").setEmoji(ayarlar.emoji.p).setCustomId("önerik").setStyle(3)).addComponents(new ButtonBuilder().setLabel("Ne gerek var").setEmoji(ayarlar.emoji.np).setCustomId("önerir").setStyle(4))] }, 'KANAL ID')
            let oneri = alisa.öneri
            oneri[mesaj.id] = { k: [], r: [] }
            db.yaz("öneri", oneri, "alisa", "diğerleri")
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}