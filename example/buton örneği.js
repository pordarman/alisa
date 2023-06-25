module.exports = {
    name: "Komutun ismi", 
    /**
     * Bu "name" verisi ./komutlar örneği.js dosyasındaki "kod" ile aynıdır.
     * 
     * Bu dosyayı çağırmak için customId'si "Komutun ismi" olan butona birisi tıklayınca bu komut çalışacaktır
     */
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            // Komutlarınız buraya yazılacak
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}