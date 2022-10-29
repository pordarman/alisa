const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "destek",
    data: new SlashCommandBuilder()
        .setName("destek")
        .setDescription("Eğer yardıma ihtiyacınız varsa bu komutu kullanabilirsiniz"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let clientPp = int.client.user.displayAvatarURL()
                , prefix = sunucudb.prefix || ayarlar.prefix
                , supportGuild = await int.client.getGuild("Destek sunucusunun ID'si")
                , embed = new EmbedBuilder().setAuthor({ name: supportGuild?.name || guild.name, iconURL: supportGuild?.iconURL() || guild.iconURL() }).setDescription(`• Görünüşe göre biraz yardıma ihtiyacın var gibi görünüyor isterseniz size biraz yardım edebilirim ne dersin?\n\n• **[Destek sunucuma](${ayarlar.discord})** gelip yetkililerden yardım etmesini isteyebilirsin.\n\n• Ha eğer destek sunucuma gelmeden yardım almak istiyorsanız kısaca **${prefix}kur** komutunu kullanıp bütün sorulara cevap vererek bütün sistemi hızlı bir şekilde kurabilirsiniz.\n\n• Ve mümkünse **${prefix}yardım** yazarak bütün komutlarımı gördükten sonra kullanmaya başlayınız çünkü birçok komutum işlemleriniz daha kolay ve daha pratik bir şekilde yapmanızı sağlıyor. **__Bu yüzden bütün komutlarıma bakmayı sakın unutmayınız.__**\n\n• Eğer daha fazla yardıma ihtiyacınız varsa **[destek sunucuma](${ayarlar.discord})** gelmeyi sakın unutma ^^\n\n• Ve en önemlisi *seni seviyorum...* :)`).setColor(int.member.displayHexColor ?? "#9e02e2").setThumbnail(clientPp).setTimestamp()
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}