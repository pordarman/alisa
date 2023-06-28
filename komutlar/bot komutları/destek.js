const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["destek"],
    cooldown: 5,
    name: "destek",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let clientPp = msg.client.user.displayAvatarURL()
                , supportGuild = await msg.client.getGuild("Destek Sunucusunun ID'si")
                , embed = new EmbedBuilder().setAuthor({ name: supportGuild?.name || guild.name, iconURL: supportGuild?.iconURL() || guild.iconURL() }).setDescription(`• Görünüşe göre biraz yardıma ihtiyacın var gibi görünüyor isterseniz size biraz yardım edebilirim ne dersin?\n\n• **[Destek sunucuma](${ayarlar.discord})** gelip yetkililerden yardım etmesini isteyebilirsiniz\n\n• Ha eğer destek sunucuma gelmeden yardım almak istiyorsanız kısaca **${prefix}kur** komutunu kullanıp bütün sorulara cevap vererek bütün kayıt sistemini hızlı bir şekilde kurabilirsiniz.\n\n• Ve mümkünse **${prefix}yardım** yazarak bütün komutlarımı gördükten sonra kullanmaya başlayınız çünkü birçok komutum işlemleriniz daha kolay ve daha pratik bir şekilde yapmanızı sağlıyor. **__Bu yüzden bütün komutlarıma bakmayı sakın unutmayınız.__**\n\n• Eğer daha fazla yardıma ihtiyacınız varsa **[destek sunucuma](${ayarlar.discord})** gelmeyi sakın unutma ^^\n\n• Ve en önemlisi *seni seviyorum...* :)`).setColor(msgMember.displayHexColor ?? "#9e02e2").setThumbnail(clientPp).setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}