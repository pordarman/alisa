const { SlashCommandBuilder } = require("discord.js")
module.exports = {
    name: "Komutun benzersiz adı (Eğer komutunuz ./komutlar klasöründe de varsa o klasördeki komutunun \"name\" verisini yazınız)",
    /**
     * Örnek vermek gerekirse "./komutlar" klasörünüzde "otorol.js" diye bir komutunuz var ve o komutun "name" verisi "otorol" diyelim
     * (name: "komutun adı") // Bu komutlar klasöründeki dosya
     * 
     * Şimdi siz o komutun aynısını slash içinde yapmak isterseniz o komutun "name" verisini yapacağınız slash komutuna da eklemelisiniz
     * (name: "komutun adı") // Bu slash klasöründeki dosya
     * 
     * Gördüğünüz gibi komutların özelliği aynı o yüzden ikisine de aynı name verisini yazdırdık
     */
    data: new SlashCommandBuilder()
        .setName("Komutun adı")
        .setDescription("Komutun açıklaması"),
    /**
     * 
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            // Komutlarınız buraya yazılacak
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}