const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "hata",
    data: new SlashCommandBuilder()
        .setName("hata")
        .setDescription("Bot hakkında geri bildirim yapabilirsiniz")
        .addStringOption(option => option.setName("mesaj").setDescription("geri bildiriminiz").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const hata = int.options.getString("mesaj", true)
            int.reply({ content: `📢 **Hata mesajınız alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**`, ephemeral: true }).catch(err => { })
            const sayı = db.topla(int.user.id, 1, "hata toplam", "diğerleri", false)
            let bilgiler = [
                `**👤 Yazan kişi:**  ${int.user.tag} - (${int.user.id})`,
                `**🖥️ Yazdığı sunucu:**  ${guild.name} - (${sunucuid})`,
                `**🎞️ Yazdığı kanal:**  #${int.channel.name} - (${int.channelId})`
            ]
            const embed = new EmbedBuilder()
                .setTitle("📢 Bir yeni hata var")
                .setDescription(`• <@${int.user.id}> adlı kişi toplamda **${sayı}** kere hatamızı söyledi!`)
                .addFields(
                    {
                        name: "BİLGİLERİ",
                        value: bilgiler.join("\n")
                    },
                    {
                        name: "HATA",
                        value: hata
                    }
                )
                .setColor("#3fb100")
                .setFooter({ text: `${int.client.user.username} teşekkür eder..` })
            int.client.sendChannel({ embeds: [embed] }, 'KANAL ID')
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}