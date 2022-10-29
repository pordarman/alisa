const { emoji, prefix: prefixayarlar } = require("../ayarlar.json")

module.exports = (sunucudb, secenek) => {
    let prefix = sunucudb.prefix || prefixayarlar
        , tümKomutlarArray = [
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}afk\`:** Sunucuda AFK moduna giriş yaparsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}al\`:** Kayıtsız rolünü ayarlarsınız**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}alisa\`:** Botun komutlarını en çok kullanan kişiler vb. şeyleri görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}ayar\`:** Tüm kayıt ayarlarını açıp kapatırsınız. Kapatırsanız hiçbir şekilde kayıt yapamazsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}b\`:** Etiketlediğiniz botu kayıt edersiniz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}ban\`:** Etiketlediğiniz üyeyi sunucudan yasaklarsınız**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}banner\`:** Etiketlediğiniz üyenin veya kendinizin bannerini görürsünüz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}bany\`:** Ban yetkili rolünü ayarlarsınız**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}bilgi\`:** Etiketlediğiniz üyenin veya kendinizin hesap bilgilerini görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}bot-rol\`:** Botlara verilecek olan rolü ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}bototo\`:** Botları otomatik kayıt edilip edilmeyeceğini ayarlarsınız**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}davet\`:** Botun davet linklerini görürsünüz**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}destek\`:** Botla ilgili bir sorununuz olduğunda yardım alabilirsiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}değiş\`:** Yanlış kayıt ettiğiniz üyenin rollerini değiştirirsiniz __(Bu komut sadece Cinsiyet ile kayıt edenlere özeldir)__**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}e\`:** Etiketlediğiniz üyeyi erkek olarak kayıt edersiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}erkek-rol\`:** Erkeklere verilecek olan rolü belirlersiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}fake\`:** Sunucuya sanki yeni birisi katılmış gibi hoşgeldin mesaj atar**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}gb\`:** Bot hakkında geri bildirim yaparsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}gözel\`:** Kayıt edildikten sonra günlük kanalına atılan mesajı özelleştirirsiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}günlük\`:** Kayıt edildikten sonra hangi kanala mesaj atacağını ayarlarsınız. Günlük kanalının sohbet kanalı olması önerilir**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}hata\`:** Botta bir hata gördüğünüz zaman bunu bize iletebilirsiniz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}isimler\`:** Etiketlediğiniz üyenin daha önceden nasıl kayıt olduğunu gösterir**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}istatistik\`:** Botun bütün istatistiğini görürsünüz**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-bilgi\`:** Etiketlediğiniz üyenin daha önceden neden ve ne zaman jaile atıldığını gösterir**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-log\`:** Jail log kanalını ayarlarsınız**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-rol\`:** Jail rolünü ayarlarsınız**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-sil\`:** Etiketlediğiniz üyenin jail bilgisini silersiniz**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-son\`:** Jail'e atılan son üyeleri gösterir**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-sıfırla\`:** Bütün jail ayarlarını/bilgilerini silersiniz**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail-yetkili\`:** Jail yetkili rolünü ayarlarsınız**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}jail\`:** Etiketlediğiniz üyeyi jail'e atarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}k\`:** Etiketlediğiniz üyeyi kız olarak kayıt edersiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kanal\`:** Kayıtların yapılacağı kanalı ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kayıt-rol\`:** Üyelere verilecek olan rolü ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kayıt\`:** Etiketlediğiniz üyeyi üye olarak kayıt edersiniz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}kayıtbilgi\`:** Kayıt ile ilgili kaydettiğiniz tüm verileri görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kayıtlog\`:** Kayıt log kanalını ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kayıtsıfırla\`:** Tüm kayıt ayarlarınızı silersiniz __(Bu komut rankları, kayıt sıralamasını, kayıt sayılarını ve son kayıtları etkilemez)__**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kayıtsız\`:** Etiketlediğiniz üyeyi kayıtsıza atarsınız**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}kayıtsızlar\`:** Sunucudaki bütün kayıtsızları etiketleyerek kimlerin kayıtsız olduğunu görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}kbilgi\`:** Etiketlediğiniz üyenin veya kendinizin kayıt bilgilerini görürsünüz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}kick\`:** Etiketlediğiniz üyeyi sunucudan atarsınız**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}kicky\`:** Kick yetkili rolünü ayarlarsınız**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}kişilog\`:** Etiketlediğiniz üyenin log bilgilerini görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}ksıfırla\`:** Bot ile kayıt edilen bütün verileri silersiniz __(Bu komut kayıt bilgilerini, jail bilgilerini ve tagrol bilgilerini de etkiler!!)__**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kur\`:** Kayıt ayarlarını teker teker ayarlamak zorunda kalmadan hepsini bir anda yapmanızı sağlar**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}kız-rol\`:** Kızlara verilecek olan rolü belirlersiniz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}modlog\`:** Moderasyon log kanalını ayarlarsınız**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}mute\`:** Etiketlediğiniz üyeyi süreli bir şekilde ses ve yazı kanallarından susturursunuz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}mutey\`:** Mute yetkili rolünü ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}n\`:** Etiketlediğiniz üyenin ismini yeniden ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}otodüzeltme\`:** Birisini kayıt ederken girilen ismin otomatik olarak ilk harfini büyük yapıp yapmayacağını ayarlarsınız**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}oy\`:** Ş-şeyy isterseniz bana oy verebilirsiniz**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}öneri\`:** Botta olması gereken şeyleri söylersiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}özel-isim\`:** Üyelerin isimlerini istediğiniz gibi özelleştirirsiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}özel\`:** Hoşgeldin mesajını özelleştirirsiniz**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}partner\`:** Sunucuya özel bir partner rolü belirlereyerek partner için gelen üyelere partnerler yetkililerini göstermesini sağlarsınız**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}ping\`:** Botun gecikme değerini görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}pp\`:** Etiketlediğiniz üyenin veya kendinizin profil fotoğrafını görürsünüz**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}prefix\`:** Sunucuya özel prefix'i değiştirirsiniz**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}premium\`:** Botun premium sistemi ile ilgili bilgileri görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}rank\`:** Etiketlediğiniz üyenin veya kendinizin rankını görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}rolsüz\`:** Sunucuda kimin rolsüz olup olmadığını görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}say-ayarlar\`:** Say komutunda gösterilen verileri özelleştirirsiniz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}say\`:** Sunucuda kaç tane üye olduğunu görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}sbilgi\`:** Sunucunun genel bilgilerini görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}sembol\`:** Üyeleri kayıt ederken her boşluğun arasına eklenecek sembolü ayarlarsınız**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}ses\`:** Botu istediğiniz ses kanalına giriş yaptırırsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}seç\`:** Kayıt seçeneğini cinsiyet veya normal olarak ayarlarsınız**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}sil\`:** Girdiğiniz sayı kadar kanaldaki mesajları silersiniz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}sicil\`:** Etiketlediğiniz üyenin sicil bilgilerini görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}snipe\`:** Etiketlediğiniz üyenin veya kanalda son silinen mesajını görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}son\`:** Etiketlediğiniz üyenin veya tüm sunucunun kayıt ettiği son üyeleri görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}son\`:** Eğer konuşacak konu bittiyse bu komutu kullanarak biraz zaman geçirebilirsiniz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}sıra\`:** Sunucunun kayıt sıralamasını görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}şüpheli\`:** Güvensiz birisini manuel olarak şüpheliye atarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}şüpheli-gün\`:** Botun bir hesabı şüpheli olarak gösterebilmesi için gerekli gün sayısını ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}şüpheli-oto\`:** Güvensiz hesapları otomatik olarak şüpheliye atılıp atılmayacağını ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}şüpheli-rol\`:** Güvensiz hesaplara verilecek rolü ayarlarsınız**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}tag-a\`:** Sunucuya özel tag ayarlarsınız**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tag-bilgi\`:** Üyenin taglı olup olmadığına bakar, eğer taglıysa ne zaman tag aldığını da görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}tag\`:** Sunucuda tag ayarlıysa sunucunun tagını görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}taglı-üyeler\`:** Hangi üyelerin taglı olup olmadığını görürsünüz**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-ayar\`:** Tagrol ayarını açıp kapatırsınız**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-bilgi\`:** Tagrol ile kayıt ettiğiniz verileri görürsünüz**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-dis\`:** Sunucuna ikinci bir tag ayarlarsınız**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-kanal\`:** Birisi tag aldıktan sonra mesaj atılacağı kanalı belirlersiniz**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-log\`:** Birisi tag aldıktan sonra log kanalına atılacak kanalı belirlersiniz**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}tagrol-mesaj\`:** Tag mesajlarını özelleştirirsiniz**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-rol\`:** Birisi tag aldıktan sonra verilecek rolü belirlersiniz**` },
            { type: "tagrol", content: `${emoji.tagrol} \`${prefix}tagrol-sıfırla\`:** Tüm tagrol bilgilerinizi silersiniz**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}tempjail\`:** Etiketlediğiniz üyeyi süreli olarak jail'e atar**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}test\`:** Birisini kayıt etmeden önce botun hangi hataları verebileceğini önceden görürsünüz**` },
            { type: "bilgi", content: `${emoji.bilgi} \`${prefix}toplam\`:** Sunucunun kayıt ettiği üye sayısını görürsünüz**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}unban\`:** ID'sini veya ismini girdiğiniz üyenin sunucudaki yasağını kaldırırsınız**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}unjail\`:** Etiketlediğiniz üyeyi jail'den çıkarırsınız**` },
            { type: "jail", content: `${emoji.jail} \`${prefix}unjailall\`:** Bütün herkesi jailden çıkarırsınız**` },
            { type: "mod", content: `${emoji.mod} \`${prefix}unmute\`:** Etiketlediğiniz üyenin susturulmasını kaldırırsınız**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}vip\`:** Vip rolünü ayarlayıp istediğiniz üyeye vip rolünü verirsiniz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}yazdır\`:** Bota istediğiniz mesajı yazdırırsınız**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}yaşsınır\`:** Belirlediğiniz yaşın altındaki üyelerin kayıt edilmesini engellersiniz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}yaşzorunlu\`:** Birisini kayıt ederken yaş girmenin zorunlu olup olmadığını belirlersiniz**` },
            { type: "bot", content: `${emoji.bot} \`${prefix}yenilik\`:** Bota son güncellemeyle gelen yenilikleri görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}yetkilerim\`:** Etiketlediğiniz üyenin veya kendinizin sunucudaki izinlerini görürsünüz**` },
            { type: "kayıt", content: `${emoji.kayit} \`${prefix}yetkili-rol\`:** Üyeleri kayıt edebilecek olan yetkili rolünü ayarlarsınız**` },
            { type: "pre", content: `${emoji.pre} \`${prefix}yetkili\`:** Sunucuza özel bir yetkili rolleri belirleyerek kimlerin yetkili olup olmadığını görürsünüz**` },
            { type: "ekstra", content: `${emoji.ekstra} \`${prefix}zengin\`:** Eğer sunucuya boost bastıysanız kendi isminizi değiştirebilirsiniz**` },
        ]
        , baslik
    switch (secenek) {
        case "t":
            baslik = "Tagrol komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "tagrol")
            break;
        case "j":
            baslik = "Jail komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "jail")
            break;
        case "m":
            baslik = "Moderasyon komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "mod")
            break;
        case "p":
            baslik = "Premium komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "pre")
            break;
        case "e":
            baslik = "Ekstra komutlar"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "ekstra")
            break;
        case "k":
            baslik = "Kayıt komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "kayıt")
            break;
        case "b":
            baslik = "Bilgi komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "bilgi")
            break;
        case "bot":
            baslik = "Bot komutları"
            tümKomutlarArray = tümKomutlarArray.filter(a => a.type == "bot")
            break;
        default:
            baslik = "Tüm komutlar"
            break;
    }
    return [tümKomutlarArray, baslik]
}