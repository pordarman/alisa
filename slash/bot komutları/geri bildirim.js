const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "geri bildirim",
    data: new SlashCommandBuilder()
        .setName("geribildirim")
        .setDescription("Bot hakkında geri bildirim yapabilirsiniz")
        .addStringOption(option => option.setName("mesaj").setDescription("geri bildiriminiz").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const geriBildirim = int.options.getString("mesaj", true)
            int.reply({ content: `📣 **Geri bildiriminiz alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**`, ephemeral: true }).catch(err => { })
            const sayı = db.topla(int.user.id, 1, "gb toplam", "diğerleri", false)
            let bilgiler = [
                `**👤 Yazan kişi:**  ${int.user.tag} - (${int.user.id})`,
                `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${guildId})`,
                `**🎞️ Yazdığı kanal:**  #${int.channel.name} - (${int.channelId})`
            ]
            const embed = new EmbedBuilder()
                .setTitle("📣 Bir yeni geri bildirim var")
                .setDescription(`• <@${int.user.id}> adlı kişi toplamda **${sayı}** kere geri bildirim yaptı!`)
                .addFields(
                    {
                        name: "BİLGİLERİ",
                        value: bilgiler.join("\n")
                    },
                    {
                        name: "GERİ BİLDİRİM",
                        value: geriBildirim
                    }
                )
                .setColor("#fb1d1c")
                .setFooter({ text: `${int.client.user.username} teşekkür eder..` })
            int.client.sendChannel({ embeds: [embed] }, 'KANAL ID')
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}