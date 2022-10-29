const { emoji } = require("../ayarlar.json")

module.exports = (sunucudb, secenek) => {
    let prefix = sunucudb.prefix || "."
        , tümKomutlarArray = [
            `${emoji.ekstra} \`${prefix}afk\`:** Sunucuda AFK moduna giriş yaparsınız**`,
            `${emoji.kayit} \`${prefix}al\`:** Kayıtsız rolünü ayarlarsınız**`,
            `${emoji.bot} \`${prefix}alisa\`:** Botun komutlarını en çok kullanan kişiler vb. şeyleri görürsünüz**`,
            `${emoji.kayit} \`${prefix}ayar\`:** Tüm kayıt ayarlarını açıp kapatırsınız. Kapatırsanız hiçbir şekilde kayıt yapamazsınız**`,
            `${emoji.kayit} \`${prefix}b\`:** Etiketlediğiniz botu kayıt edersiniz**`,
            `${emoji.mod} \`${prefix}ban\`:** Etiketlediğiniz üyeyi sunucudan yasaklarsınız**`,
            `${emoji.ekstra} \`${prefix}banner\`:** Etiketlediğiniz üyenin veya kendinizin bannerini görürsünüz**`,
            `${emoji.mod} \`${prefix}bany\`:** Ban yetkili rolünü ayarlarsınız**`,
            `${emoji.ekstra} \`${prefix}bilgi\`:** Etiketlediğiniz üyenin veya kendinizin hesap bilgilerini görürsünüz**`,
            `${emoji.kayit} \`${prefix}bot-rol\`:** Botlara verilecek olan rolü ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}bototo\`:** Botları otomatik kayıt edilip edilmeyeceğini ayarlarsınız**`,
            `${emoji.bot} \`${prefix}davet\`:** Botun davet linklerini görürsünüz**`,
            `${emoji.bot} \`${prefix}destek\`:** Botla ilgili bir sorununuz olduğunda yardım alabilirsiniz**`,
            `${emoji.kayit} \`${prefix}değiş\`:** Yanlış kayıt ettiğiniz üyenin rollerini değiştirirsiniz __(Bu komut sadece Cinsiyet ile kayıt edenlere özeldir)__**`,
            `${emoji.kayit} \`${prefix}e\`:** Etiketlediğiniz üyeyi erkek olarak kayıt edersiniz**`,
            `${emoji.kayit} \`${prefix}erkek-rol\`:** Erkeklere verilecek olan rolü belirlersiniz**`,
            `${emoji.kayit} \`${prefix}fake\`:** Sunucuya sanki yeni birisi katılmış gibi hoşgeldin mesaj atar**`,
            `${emoji.bot} \`${prefix}gb\`:** Bot hakkında geri bildirim yaparsınız**`,
            `${emoji.kayit} \`${prefix}gözel\`:** Kayıt edildikten sonra günlük kanalına atılan mesajı özelleştirirsiniz**`,
            `${emoji.kayit} \`${prefix}günlük\`:** Kayıt edildikten sonra hangi kanala mesaj atacağını ayarlarsınız. Günlük kanalının sohbet kanalı olması önerilir**`,
            `${emoji.bot} \`${prefix}hata\`:** Botta bir hata gördüğünüz zaman bunu bize iletebilirsiniz**`,
            `${emoji.bilgi} \`${prefix}isimler\`:** Etiketlediğiniz üyenin daha önceden nasıl kayıt olduğunu gösterir**`,
            `${emoji.bot} \`${prefix}istatistik\`:** Botun bütün istatistiğini görürsünüz**`,
            `${emoji.jail} \`${prefix}jail-bilgi\`:** Etiketlediğiniz üyenin daha önceden neden ve ne zaman jaile atıldığını gösterir**`,
            `${emoji.jail} \`${prefix}jail-log\`:** Jail log kanalını ayarlarsınız**`,
            `${emoji.jail} \`${prefix}jail-rol\`:** Jail rolünü ayarlarsınız**`,
            `${emoji.jail} \`${prefix}jail-sil\`:** Etiketlediğiniz üyenin jail bilgisini silersiniz**`,
            `${emoji.jail} \`${prefix}jail-son\`:** Jail'e atılan son üyeleri gösterir**`,
            `${emoji.jail} \`${prefix}jail-sıfırla\`:** Bütün jail ayarlarını/bilgilerini silersiniz**`,
            `${emoji.jail} \`${prefix}jail-yetkili\`:** Jail yetkili rolünü ayarlarsınız**`,
            `${emoji.jail} \`${prefix}jail\`:** Etiketlediğiniz üyeyi jail'e atarsınız**`,
            `${emoji.kayit} \`${prefix}k\`:** Etiketlediğiniz üyeyi kız olarak kayıt edersiniz**`,
            `${emoji.kayit} \`${prefix}kanal\`:** Kayıtların yapılacağı kanalı ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}kayıt-rol\`:** Üyelere verilecek olan rolü ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}kayıt\`:** Etiketlediğiniz üyeyi üye olarak kayıt edersiniz**`,
            `${emoji.bilgi} \`${prefix}kayıtbilgi\`:** Kayıt ile ilgili kaydettiğiniz tüm verileri görürsünüz**`,
            `${emoji.kayit} \`${prefix}kayıtlog\`:** Kayıt log kanalını ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}kayıtsıfırla\`:** Tüm kayıt ayarlarınızı silersiniz __(Bu komut rankları, kayıt sıralamasını, kayıt sayılarını ve son kayıtları etkilemez)__**`,
            `${emoji.kayit} \`${prefix}kayıtsız\`:** Etiketlediğiniz üyeyi kayıtsıza atarsınız**`,
            `${emoji.pre} \`${prefix}kayıtsızlar\`:** Sunucudaki bütün kayıtsızları etiketleyerek kimlerin kayıtsız olduğunu görürsünüz**`,
            `${emoji.bilgi} \`${prefix}kbilgi\`:** Etiketlediğiniz üyenin veya kendinizin kayıt bilgilerini görürsünüz**`,
            `${emoji.mod} \`${prefix}kick\`:** Etiketlediğiniz üyeyi sunucudan atarsınız**`,
            `${emoji.mod} \`${prefix}kicky\`:** Kick yetkili rolünü ayarlarsınız**`,
            `${emoji.pre} \`${prefix}kişilog\`:** Etiketlediğiniz üyenin log bilgilerini görürsünüz**`,
            `${emoji.kayit} \`${prefix}ksıfırla\`:** Bot ile kayıt edilen bütün verileri silersiniz __(Bu komut kayıt bilgilerini, jail bilgilerini ve tagrol bilgilerini de etkiler!!)__**`,
            `${emoji.kayit} \`${prefix}kur\`:** Kayıt ayarlarını teker teker ayarlamak zorunda kalmadan hepsini bir anda yapmanızı sağlar**`,
            `${emoji.kayit} \`${prefix}kız-rol\`:** Kızlara verilecek olan rolü belirlersiniz**`,
            `${emoji.mod} \`${prefix}modlog\`:** Moderasyon log kanalını ayarlarsınız**`,
            `${emoji.mod} \`${prefix}mute\`:** Etiketlediğiniz üyeyi süreli bir şekilde ses ve yazı kanallarından susturursunuz**`,
            `${emoji.mod} \`${prefix}mutey\`:** Mute yetkili rolünü ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}n\`:** Etiketlediğiniz üyenin ismini yeniden ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}otodüzeltme\`:** Birisini kayıt ederken girilen ismin otomatik olarak ilk harfini büyük yapıp yapmayacağını ayarlarsınız**`,
            `${emoji.bot} \`${prefix}oy\`:** Ş-şeyy isterseniz bana oy verebilirsiniz**`,
            `${emoji.bot} \`${prefix}öneri\`:** Botta olması gereken şeyleri söylersiniz**`,
            `${emoji.kayit} \`${prefix}özel-isim\`:** Üyelerin isimlerini istediğiniz gibi özelleştirirsiniz**`,
            `${emoji.kayit} \`${prefix}özel\`:** Hoşgeldin mesajını özelleştirirsiniz**`,
            `${emoji.pre} \`${prefix}partner\`:** Sunucuya özel bir partner rolü belirlereyerek partner için gelen üyelere partnerler yetkililerini göstermesini sağlarsınız**`,
            `${emoji.bot} \`${prefix}ping\`:** Botun gecikme değerini görürsünüz**`,
            `${emoji.ekstra} \`${prefix}pp\`:** Etiketlediğiniz üyenin veya kendinizin profil fotoğrafını görürsünüz**`,
            `${emoji.bot} \`${prefix}prefix\`:** Sunucuya özel prefix'i değiştirirsiniz**`,
            `${emoji.bot} \`${prefix}premium\`:** Botun premium sistemi ile ilgili bilgileri görürsünüz**`,
            `${emoji.bilgi} \`${prefix}rank\`:** Etiketlediğiniz üyenin veya kendinizin rankını görürsünüz**`,
            `${emoji.kayit} \`${prefix}rolsüz\`:** Sunucuda kimin rolsüz olup olmadığını görürsünüz**`,
            `${emoji.bilgi} \`${prefix}say-ayarlar\`:** Say komutunda gösterilen verileri özelleştirirsiniz**`,
            `${emoji.bilgi} \`${prefix}say\`:** Sunucuda kaç tane üye olduğunu görürsünüz**`,
            `${emoji.ekstra} \`${prefix}sbilgi\`:** Sunucunun genel bilgilerini görürsünüz**`,
            `${emoji.kayit} \`${prefix}sembol\`:** Üyeleri kayıt ederken her boşluğun arasına eklenecek sembolü ayarlarsınız**`,
            `${emoji.ekstra} \`${prefix}ses\`:** Botu istediğiniz ses kanalına giriş yaptırırsınız**`,
            `${emoji.kayit} \`${prefix}seç\`:** Kayıt seçeneğini cinsiyet veya normal olarak ayarlarsınız**`,
            `${emoji.mod} \`${prefix}sil\`:** Girdiğiniz sayı kadar kanaldaki mesajları silersiniz**`,
            `${emoji.bilgi} \`${prefix}sicil\`:** Etiketlediğiniz üyenin sicil bilgilerini görürsünüz**`,
            `${emoji.ekstra} \`${prefix}snipe\`:** Etiketlediğiniz üyenin veya kanalda son silinen mesajını görürsünüz**`,
            `${emoji.bilgi} \`${prefix}son\`:** Etiketlediğiniz üyenin veya tüm sunucunun kayıt ettiği son üyeleri görürsünüz**`,
            `${emoji.ekstra} \`${prefix}son\`:** Eğer konuşacak konu bittiyse bu komutu kullanarak biraz zaman geçirebilirsiniz**`,
            `${emoji.bilgi} \`${prefix}sıra\`:** Sunucunun kayıt sıralamasını görürsünüz**`,
            `${emoji.kayit} \`${prefix}şüpheli\`:** Güvensiz birisini manuel olarak şüpheliye atarsınız**`,
            `${emoji.kayit} \`${prefix}şüpheli-gün\`:** Botun bir hesabı şüpheli olarak gösterebilmesi için gerekli gün sayısını ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}şüpheli-oto\`:** Güvensiz hesapları otomatik olarak şüpheliye atılıp atılmayacağını ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}şüpheli-rol\`:** Güvensiz hesaplara verilecek rolü ayarlarsınız**`,
            `${emoji.kayit} \`${prefix}tag-a\`:** Sunucuya özel tag ayarlarsınız**`,
            `${emoji.tagrol} \`${prefix}tag-bilgi\`:** Üyenin taglı olup olmadığına bakar, eğer taglıysa ne zaman tag aldığını da görürsünüz**`,
            `${emoji.bilgi} \`${prefix}tag\`:** Sunucuda tag ayarlıysa sunucunun tagını görürsünüz**`,
            `${emoji.bilgi} \`${prefix}taglı-üyeler\`:** Hangi üyelerin taglı olup olmadığını görürsünüz**`,
            `${emoji.tagrol} \`${prefix}tagrol-ayar\`:** Tagrol ayarını açıp kapatırsınız**`,
            `${emoji.tagrol} \`${prefix}tagrol-bilgi\`:** Tagrol ile kayıt ettiğiniz verileri görürsünüz**`,
            `${emoji.tagrol} \`${prefix}tagrol-dis\`:** Sunucuna ikinci bir tag ayarlarsınız**`,
            `${emoji.tagrol} \`${prefix}tagrol-kanal\`:** Birisi tag aldıktan sonra mesaj atılacağı kanalı belirlersiniz**`,
            `${emoji.tagrol} \`${prefix}tagrol-log\`:** Birisi tag aldıktan sonra log kanalına atılacak kanalı belirlersiniz**`,
            `${emoji.pre} \`${prefix}tagrol-mesaj\`:** Tag mesajlarını özelleştirirsiniz**`,
            `${emoji.tagrol} \`${prefix}tagrol-rol\`:** Birisi tag aldıktan sonra verilecek rolü belirlersiniz**`,
            `${emoji.tagrol} \`${prefix}tagrol-sıfırla\`:** Tüm tagrol bilgilerinizi silersiniz`,
            `${emoji.jail} \`${prefix}tempjail\`:** Etiketlediğiniz üyeyi süreli olarak jail'e atar**`,
            `${emoji.kayit} \`${prefix}test\`:** Birisini kayıt etmeden önce botun hangi hataları verebileceğini önceden görürsünüz**`,
            `${emoji.bilgi} \`${prefix}toplam\`:** Sunucunun kayıt ettiği üye sayısını görürsünüz**`,
            `${emoji.mod} \`${prefix}unban\`:** ID'sini veya ismini girdiğiniz üyenin sunucudaki yasağını kaldırırsınız**`,
            `${emoji.jail} \`${prefix}unjail\`:** Etiketlediğiniz üyeyi jail'den çıkarırsınız**`,
            `${emoji.jail} \`${prefix}unjailall\`:** Bütün herkesi jailden çıkarırsınız**`,
            `${emoji.mod} \`${prefix}unmute\`:** Etiketlediğiniz üyenin susturulmasını kaldırırsınız**`,
            `${emoji.ekstra} \`${prefix}vip\`:** Vip rolünü ayarlayıp istediğiniz üyeye vip rolünü verirsiniz**`,
            `${emoji.ekstra} \`${prefix}yazdır\`:** Bota istediğiniz mesajı yazdırırsınız**`,
            `${emoji.pre} \`${prefix}yaşsınır\`:** Belirlediğiniz yaşın altındaki üyelerin kayıt edilmesini engellersiniz**`,
            `${emoji.kayit} \`${prefix}yaşzorunlu\`:** Birisini kayıt ederken yaş girmenin zorunlu olup olmadığını belirlersiniz**`,
            `${emoji.bot} \`${prefix}yenilik\`:** Bota son güncellemeyle gelen yenilikleri görürsünüz**`,
            `${emoji.ekstra} \`${prefix}yetkilerim\`:** Etiketlediğiniz üyenin veya kendinizin sunucudaki izinlerini görürsünüz**`,
            `${emoji.kayit} \`${prefix}yetkili-rol\`:** Üyeleri kayıt edebilecek olan yetkili rolünü ayarlarsınız**`,
            `${emoji.pre} \`${prefix}yetkili\`:** Sunucuza özel bir yetkili rolleri belirleyerek kimlerin yetkili olup olmadığını görürsünüz**`,
            `${emoji.ekstra} \`${prefix}zengin\`:** Eğer sunucuya boost bastıysanız kendi isminizi değiştirebilirsiniz**`,
        ]
        , baslik
    switch (secenek) {
        case "t":
            baslik = "Tagrol komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.tagrol))
            break;
        case "j":
            baslik = "Jail komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.jail))
            break;
        case "m":
            baslik = "Moderasyon komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.mod))
            break;
        case "p":
            baslik = "Premium komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.pre))
            break;
        case "e":
            baslik = "Ekstra komutlar"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.ekstra))
            break;
        case "k":
            baslik = "Kayıt komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.kayit))
            break;
        case "b":
            baslik = "Bilgi komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.bilgi))
            break;
        case "bot":
            baslik = "Bot komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.startsWith(emoji.bot))
            break;
        default:
            baslik = "Tüm komutlar"
            break;
    }
    return [tümKomutlarArray, baslik]
}