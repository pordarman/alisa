module.exports = {
  name: "Komutun benzersiz adı", // Komutların kullanım sayılarını hesaplamak için buraya benzersiz bir komut ismi giriniz
  cooldown: 5, // Komutun bekleme süresi (saniye cinsinden)
  kod: ["komut1", "komut2", "komut3"],
  /**
   * Buraya istediğiniz kadar veri ekleyebilirsiniz bunlar komutların nasıl çağıracağını gösterir
   * 
   * Örnek vermek gerekirse bu komutu çalıştırmak için ".komut1" yazsanız da çalışır ".komut2" yazsanız da çalışır
   * Buraya isterseniz 50 tane komut kullanım şekli ekleyin hepsi çalışır merak etmeyiniz
   */
  no: true, // Eğer ekleyeceğiniz komutu sadece sahiplerin kullanmasını istiyorsanız true, herkesin kullanmasını istiyorsanız false
  pre: true, // Eğer ekleyeceğiniz komutu sadece premium'a sahip sunucuların kullanmasını istiyorsanız true, herkesin kullanmasını istiyorsanız false
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
        // Komutlarınız buraya yazılacak
    } catch (e) {
        hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
        msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
        console.log(e)
    }
  }
}