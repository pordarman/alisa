const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "kurallar",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const embed2 = new EmbedBuilder()
                .setAuthor({ name: `${int.client.user.username} kuralları!`, iconURL: int.client.user.displayAvatarURL() })
                .setDescription(`**Her botta olduğu gibi [${int.client.user.username}'yı](${ayarlar.davet}) kullanırken de bir takım kuralları kabul etmeniz gerekir**\n\n__**Botu spama düşürmek!**__\n├> Sürekli bir komut yazarak spama düşürmek\n└> Çok hızlı bir şekilde butonlara tıklayıp spama düşürmek\n\n• [${int.client.user.username}'yı](${ayarlar.davet}) kopyalamak, çoğaltmak, adına sahte hesaplar açmak yasaktır!\n\n• Herhangi bir sorunuz olduğunda **[Destek Sunucuma](${ayarlar.discord})** gelebilirsiniz!\n\n**• Botu kullanan herkes kuralları okumuş ve kabul etmiş sayılır!**`)
                .setTimestamp()
            int.reply({ embeds: [embed2], ephemeral: true }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}