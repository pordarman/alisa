
## Kaynak dosyası

- [alisa](https://github.com/pordarman/alisa)

## Yaratıcılar

- [Ali (Fearless Crazy)](https://github.com/pordarman)
- [Emir (Storme)](https://github.com/PhantomStorm0)

## Sosyal medya hesapları

- Ali: [İnstagram](https://www.instagram.com/ali.celk/) - [Discord](https://discord.com/users/488839097537003521) - [Spotify](https://open.spotify.com/user/215jixxk4morzgq5mpzsmwwqa?si=41e0583b36f9449b)

- Emir: [Biography](https://phantomstorm.cf/) - [İnstagram](https://www.instagram.com/eavsar_emir.js/) - [Discord](https://discord.com/users/817417815396974683)

# Bilmen gerekenler
```javascript

/**
 * Şimdi botu çalıştırmadan önce bilmen gereken bazı şeyler var.
 * 
 * Ben bu botu tasarlerken her şeyi kendimce yazdım o yüzden bazı şeyleri anlamayabilirsin bunda bir sıkıntı yok.
 * Şimdi ben botu tasarlarken, sunucuların verilerini kaydederken hep kendime göre yazdım fakat şimdi bunu herkese açık olarak paylaşacağım için bunları da açıklamam gerekiyor.
 */


/**
 * DİKKAT!!!
 * 
 * Botu başlatmadan önce ./ayarlar.json dosyasına girip doldurmanız gereken alanları lütfen doldurunuz yoksa bot gerektiği gibi çalışmaz ve hata verir!
 * 
 * DİKKAT!!!
 */


/**
 * Şimdi birincisi: Sunucu verilerin kaydedilmesi
 * 
 * • Sunucunun verileri belirli bir formata göre kaydedilir ve yanlış bir şey yazarsanız sunucunun bütün verileri gider o yüzden dikkatli olmalısınız.
 * 
 * • Bir kişi botu sunucuya davet ettiği anda o sunucuya özel dosya açılır ve sunucunun (tagrol verileri hariç) bütün verileri o dosyada saklanır.
 * 
 * • Eğer kişi botu sunucudan atarsa o dosya daha sonradan yeniden kullanılmak üzere saklanır bunu da unutmadan söyleyeyim.
 */


/**
 * Şimdi gelelim sunucu verilerinin nasıl kaydedildiğine:
 * 
 * • Sunucunun verileri bir obje (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object?retiredLocale=tr) olarak kaydediliyor ve objeden veri çekiyor
 * 
 * • Bir kişi botu sunucuya davet ettiğinde oluşan dosyada şu verileri göreceksiniz:
 */

   {
       kayıtkisiler: { // Kişilerin kayıt verileri (ilk kayıt bilgileri, toplam kayıt ettiği kişi vs.)

        "123456789012345678": { // Bir kayıt yetkilisinin verileri
            

            /**
            * Kayıt sayıları verileri
            */

            kız: 0, // Toplam kayıt ettiği kız sayısı

            toplam: 28, // Toplam kayıt ettiği kişi sayısı

            erkek: 0, // Toplam kayıt ettiği erkek sayısı

            normal: 28, // Toplam kayıt ettiği üye sayısı


            /**
             * Diğer veriler
             */

            ilk: { // İlk kayıt ettiği kişinin verileri

             kk: "<@123456789012345678>", // Kayıt ettiği kişi

             r: "<@&123456789012345678>, <@&1234567890123456789>", // Verilen roller

             z: "<t:1619967153:F>" // Kayıt zamanı

            },

            son: { // İlk kayıt ettiği kişinin verileri

             kk: "<@123456789012345678>", // Kayıt ettiği kişi

             r: "<@&123456789012345678>, <@&1234567890123456789>", // Verilen roller

             z: "<t:1619967153:F>" // Kayıt zamanı

            },

            rank: "1" // Kayıt yetkilisinin index değerinden rankı (27 son rank)

         }

       },

       son: [ // Sunucuda kayıt edilen son kişiler

          {
             c: "<:erkek:937346371156054027>", // Üyenin cinsiyeti

             s: "123456789012345678", // Kayıt yetkilisinin ID'si

             k: "1234567890123456789", // Kayıt edilen kişinin ID'si

             z: "1619967153" // Kayıt zamanı
          }

       ],

       kayıt: { // Sunucunun kayıt verileri (log kanal ID'si, yetkili rol ID'si vs.)


       /**
        * Açıp kapatılma özelliğine sahip veriler (Yani değeri true veya false olan veriler)
        */

        bototo: true, // Botunların otomatik olarak kayıt edilip edilmeyeceğini gösterir

        otoduzeltme: true // Birisini kayıt ederken girilen isimlerin ilk harflerinin büyük olup olmayacağını gösterir

        ayar: false, // Kayıt ayarının açık mı kapalı mı olduğunu gösterir (eğer true ise kayıt yapamazsınız)

        secenek: false, // Kayıt seçeneğinin cinsiyet mi yoksa tek rol mü olduğunu gösterir (Eğer true ise tek rol, false ise cinsiyet)

        yaszorunlu: true, // Birisini kayıt ederken yaş girmenin zorunlu olup olmadığını gösterir

        yassınır: 15, // 15 yaşın altındaki üyelerin kayıt edilmesini engeller


        /**
         * İsimleri özelleştirme verileri
         */

        isimler: { // Otoisim ve kayıt edildikten sonraki düzenlenecek isimlerin verileri

         giris: "Kayıtsız" // Sunucuya girince düzenlenecek isim (Kısaca otoisim)

         kayıt: "<tag> | <isim> - [<yaş>]" // Kayıt edildikten sonra düzenlenecek isim

         kayıtbot: "Bot | <isim>" // Bir bot kayıt edildikten sonra düzenelenecek isim

        },


        /**
         * Kayıt verileri
         */

        tag: "♫ ", // Sunucuya özel tag (Tagın sonundaki boşluğu silmeyiniz)

        dis: "5827", // Sunucuya özel etiket tagı

        sembol: "• ", // Birisini kayıt ederken boşlukların arasına koyulacak sembol

        kanal: "123456789012345678", // Kayıtların yapılacağı kanalın ID'si

        günlük: "123456789012345678", // Kayıt günlük kanalının ID'si

        log: "123456789012345678", // Kayıt log kanalının ID'si

        kayıtsız: "123456789012345678", // Kayıtsız rolün ID'si

        yetkili: "123456789012345678", // Kayıt yetkilisi rolün ID'si

        bot: [ // Botlara verilecek rollerin ID'si (Her bir değer ayrı bir rolü temsil eder)
          "123456789012345678",
          "1234567890123456789",
          "12345678901234567890"
        ],
        
        erkek: [ // Erkek üyelere verilecek rollerin ID'si
          "123456789012345678"
        ],

        kız: [ // Kız üyelere verilecek rollerin ID'si
          "123456789012345678"
        ],

        normal: [ // Üyelere verilecek rollerin ID'si
          "123456789012345678",
          "1234567890123456789"
        ],


        /**
         * Mesajları özelleştirme verileri
         */

        gözel: { // Kayıt günlük mesajının özelleştirilmiş hali

          yazı: 'Kayıt olduğun için teşekkürler <üye> 💗', // Kayıt olunduktan sonra yazılacak mesaj

          embed: false  // Mesajın kutulu (embed) olup olmadığını gösterir

        },

        özel: { // Hoşgeldin mesajının özelleştirilmiş hali

          yazı: "**<sunucuAdı>** adlı sunucuya hoşgeldin sefalar getiridin <üye>...." // Hoşgeldin mesajında yazılacak mesaj

          embed: false, // Mesajın kutulu (embed) olup olmadığını gösterir

          im: 'https://i.hizliresim.com/olanm99.png' // Mesajda gösterilecek olan resmi veya gifi gösterir

        },


        /**
         * Yetkili rol verileri
         */

        bany: "123456789012345678", // Ban yetkili rol ID'si

        kicky: "123456789012345678", // Kick yetkili rol ID'si

        mutey: "123456789012345678" // Mute yetkili rol ID'si

        vyetkili: "123456789012345678" // Vip yetkili rol ID'si


        /**
         * Şüpheli verileri
         */

        otosrol: "123456789012345678" // Şüpheli üyelere verilecek rolün ID'si

        otogun: 15, // Kaç gün içinde açılan hesapları şüpheli olarak gösterileceğini gösterir

        otos: true, // Şüpheli hesapları otomatik olarak Şüpheli'ye atılıp atılmayacağını gösterir


        /**
         * Diğer veriler
         */

        modl: "123456789012345678", // Moderasyon log kanalının ID'si

        vrol: "123456789012345678", // Vip üyelere verilecek rolün ID'si
       },

       isimler: { // Bir kişinin sunucuda daha önceden nasıl kayıt edildiğini gösterir

        "123456789012345678": [ // Kayıt edilen bir üyenin verileri

          {
           c: "<:kiz:937346371290279966>", // Kişinin cinsiyeti

           n: "♫ Aleyna • 17", // Kişinin yeni ismi

           r: "<@&123456789012345678>, <@&1234567890123456789>", // Kişiye verilen roller

           s: "123456789012345678", // Kayıt eden yetkilinin ID'si

           z: "1666116594" // Kayıt zamanı
          }

        ]

       },

       yasaklitag: {}, // Bunu ekleyecektim fakat daha fırsatım olmadı, bunu silebilirsiniz

       premium: { // Premium komutlarının verileri

        yetkili: ["123456789012345678", "1234567890123456789"], // Yetkili rollerinin ID'leri (Bu rolleri adminler ekliyor)

        partner: "123456789012345678" // Partner rolünün ID'si

       },

       kl: { // Sunucudaki herkesin logları (Bu loglar sadece Alisa tarafından yapılan verileri kayıt eder. Mesela kendi elinizle birisinin ismini değiştirirseniz bunu kaydetmez!)

        "123456789012345678": [ // Kişinin logu

           {
            type: "k", // Kaydettiği verinin tipi

            /**
             * Bütün veri tipleri (Bu veri tipleri sadece bu yere özgüdür)
             * 
             * ka => Kayıtsıza atıldı
             * i => İsmi değiştirildi
             * d => Cinsiyeti değiştirildi
             * 
             * k => Kayıt edildi
             * 
             * j => Jail'e atıldı
             * uj => Jail'den çıkarıldı
             * tj => Tempjail'e (Süreli jail'e) atıldı
             * 
             * mute => Susturuldu
             * unmute => Susuturulması kaldırıldı
             * 
             * add => Sunucuya giriş yaptı
             * remove => Sunucudan çıktı
             * 
             * s => Şüpheliye atıldı
             * 
             * ban => Sunucudan yasaklandı
             * unban => Sunucu yasaklanması kaldırıldı
             * kick => Sunucudan atıldı
             */


            c: "Kız", // Bu veri sadece kayıt edildiğinde gösterilir

            /**
             * Kız => Kız olarak kayıt edildi
             * Erkek => Erkek olarak kayıt edildi
             * Üye => Üye olarak kayıt edildi
             */


            author: "123456789012345678", // Kayıt eden yetkilinin ID'si

            timestamp: 1666116594066 // Logu kaydettiği zaman

           }

        ]

       },

       sc: { // Ceza ile ilgili veriler

        sayı: 1 // Ceza numarası hesaplayıcı

       },

       jail: { // Jail ile ilgili veriler
         
        kisi: { // Jail'e atılan kişiler

          "123456789012345678": [ // Jail'e atılan kişinin verisi

            {
              y: "123456789012345678", // Jail yetkilisinin ID'si

              z: 1661715886875, // Jail'e atıldığı zaman

              s: "Sunucunun huzurunu bozuyor", // Jail'e atılma sebebi

              bool: true // Eğer kişi jail'e atıldıysa true, çıkarıldıysa false gösterir
            }

          ]

        }, 
        son: [ // Jail'e atılan son kişiler

          {
            s: "123456789012345678", // Jail'e atan yetkilinin ID'si

            k: "123456789012345678", // Jail'e atılan işinin ID'si

            z: 1661650309534, // Jail'e atıldığı zaman

            sure: "⏰", // Bu seçenek sadece Tempjail'e (Süreli jail'e) atıldığı zaman çıkar

            bool: true // Eğer kişi jail'e atıldıysa true, çıkarıldıysa false gösterir
          },

        ] 

       },

       say: { // Say komutunun özelleştirilmesi

        veri: { t: true, ü: true, tag: true, sü: true, b: true }, // Hangi verilerin gösterileceğini gösterir

        /**
          * Bütün veri tipleri (Bu veri tipleri sadece bu yere özgüdür)
          * 
          * t => Sunucudaki toplam kişi sayısı
          * b => Sunucudaki toplam boost sayısı
          * 
          * ü => Kayıtlı üye sayısı
          * tag => Taglı üye sayısı
          * sü => Sesteki üye sayısı
          * vü => Vip üye sayısı
          * jü => Jail üye sayısı
          * 
          * ky => Kayıt yetkilisi sayısı
          * jy => Jail yetkilisi sayısı
          * by => Ban yetkilisi sayısı
          * ay => Kick yetkilisi sayısı
          */


        emoji: true // Sayıların emojili mi yoksa yazı mı olduğunu gösterir (Eğer true ise emojili, false ise yazı)

       },

       afk: { // Afk sisteminin verileri

           "123456789012345678": { // Afk modunda olan kişi
   
             s: 'işim var', // Afk moduna girme sebebi
   
             z: '1661860721' // Afk moduna giriş zamanı
   
           } 
        
        }
   } 

/**
 * • Şimdi ilk bakıldığında pek bir şey anlaşılmıyor gözükebilir fakat anlatıktan sonra ne kadar rahat olduğunu siz de göreceksiniz.
 * 
 * • Yalnız bu kadar uzun olduğunu ben de şimdi fark ettim LKFDNGSFDŞKLGNFSDLŞGKSFD işiniz biraz zor gibi ama olsun öğrenmek için bolca zamanınız olacak
 * 
 * 
 * • Sunucunun bütün verileri eğer sunucu sahibi isterse tek komutla silebilir. (afk bilgileri hariç)
 */



/**
 * Şimdi ikincisi: Tagrol verilerin kaydedilmesi
 * 
 * • Aslında tagrol'de sunucu verisi obje olarak kaydediliyor ve oradan çekiyoruz.
 * 
 * • Ama tagrol sunucu verisinden biraz farklı kaydediliyor.
 */


/**
 * Şimdi gelelim tagrol verilerinin nasıl kaydedildiğine:
 * 
 *  • Tagrol verilerinin bir obje olarak kaydedildiğini söyledik şimdi sunucu verisinden farklı nasıl kaydediliyor onu söyleyelim.
 */

    {


      /**
       * Kişi verileri
       */

       kisi: { // Kişilerin tagı aldığı zamanlar

        "123456789012345678": 1662029378409,

        "1234567890123456789": 1662123254911,

       },


       /**
        * Mesajları özelleştirme verileri
        */


       mesaje: {
         yazı: "Tagımızı ( <tag> ) adlığın için teşekkürler <üye>!" // Aramıza hoşgeldin mesajının özelleştirilmiş hali
       },

       mesajk: {
         yazı: "Duydum ki tagımızı ( <tag> ) bırakmışsın <üye> :(..." // Aramızdan ayrıldı mesajının özelleştirilmiş hali
       },

       dmesaje: {
         yazı: "<sunucuAdı> adlı sunucunun tagını aldığın için teşekkürler <üye>!" // (DM'den atılacak mesaj) Aramıza hoşgeldin mesajı
       },

       dmesajk: {
         yazı: "<sunucuAdı> adlı sunucunun tagını bırakmışsın.. Kalbim kırıldı :(" // DM'den atılacak mesaj) Aramıza ayrıldı mesajı
       },


       /**
        * Tagrol verileri
        */
        
       tag: "♫" // Sunucuya özel tag

       dis: "5827", // Sunucuya özel etiket tag

       kanal: "123456789012345678", // Aramıza hoşgeldin mesajının atılacağı kanalın ID'si

       log: "123456789012345678", // Tagrol log kanalının ID'si

       rol: "123456789012345678", // Verilecek rolün ID'si

    }

/**
 * • Gördüğünüz gibi sunucunun verisinden daha az veri var ve hemen anlaşılabilir zaten bunlar o yüzden bunu hızlı geçiyorum.
 * 
 * • Bütün bu verileri de "Yönetici" yetkisine sahip kişiler silebiliyor.
 */



/**
 * Şimdi gelelim "./diğerleri" dosyasının altındaki özel dosyalara.
 * 
 * • Bu dosyaların isimlerini, yerini ya da içeriğini değiştirmemeye özen gösteriniz yoksa bot gerektiği gibi çalışmayacaktır.
 * 
 * • Hepsinin özel bir kullanım alanı var o yüzden hiçbirine dokunmayınız.
 */


/**
 * Şimdi gelelim hepsinin ne işe yaradığına:
 */


/**
 * ./alisa.json
 */

    {


      /**
       * Komut kullanım verileri
       */

      kullanımlar: { // Bir komutun ne kadar kullanıldığını gösterir

        afk: { // Afk komutunun verisi 

          top: 0, // Komutla kullanılan 

          slash: 0, // Slashla kullanılan

        },

        erkek: { // Erkek komutunun verisi

          top: 0, // Komutla kullanılan

          slash: 0, // Slashla kullanılan

          buton: 0, // Butonla kullanılan

        }

      },


      /**
       * Kişi ve sunucuların kullanım verileri
       */

      kisiler: { // Kişilerin ne kadar komut kullandığı gösterir

        "123456789012345678": 15,

        "1234567890123456789": 123,

        "12345678901234567890": 3421

      },

      skullanımlar: { // Sunucuların ne kadar komut kullandığını gösterir

        "123456789012345678": 1,
        
        "1234567890123456789": 45,
        
        "12345678901234567890": 876

      },


      /**
       * Kuralları kabul eden kişilerin verileri
       */

      kurallar: [ // Kuralları kabul edenler (Her bir veri bir kişiyi temsil ediyor)
        "123456789012345678",
        "1234567890123456789",
        "12345678901234567890"
      ],


      /**
       * Tarihler
       */

      kayıtsayı: { // Kayıtların zamanları

        "1000": 1627993506000, // Bot ile yapılan toplam 1,000 kayıtın zamanı

        "2000": 1635168395000, // Bot ile yapılan toplam 2,000 kayıtın zamanı

        "3000": 1638435263000, // Bot ile yapılan toplam 3,000 kayıtın zamanı

      },


      starih: { // Sunucu sayısının zamanları

       "100": 1643626400491, // Botun ilk kez 100 sunucuya ulaştığı zaman

       "200": 1653577998365, // Botun ilk kez 200 sunucuya ulaştığı zaman

       "300": 1655749807425, // Botun ilk kez 300 sunucuya ulaştığı zaman

      },


      sunucular: { // Sunucuların botu ne zaman ekleyip ne zaman attığı

        ekleme: { // Botu sunucuya davet edildiği zamanlar

          "865167339582783498": 1639062141916,

          "927916511937564752": 1641906252682,

          "912391802198327336": 1637606950133,

        },

        çıkarma: { // Botu sunucudan atıldığı zamanlar

         "374074135506190349": 1641646718526,

         "927916511937564752": 1642758341559,

         "924038140392509450": 1641764373664,

        }

      },


      /**
       * Karaliste verileri
       */

      kl: { // Kişilerin karaliste verileri

         "123456789012345678": { // Karalistedeki kişinin verisi

           z: "1644864215", // Karalisteye atıldığı zaman

           s: "Botum çok gereksizmiş üzüldüm :(", // Karalisteye atılış sebebi

           isSee: true // Botun bu kişiye karalistede olduğunu bildirmesi (Eğer veri true ise bildirmiştir, false ise bildirmemiştir) 

         },

         "1234567890123456789": { // Karalistedeki kişinin verisi

           z: "1658216553", // Karalisteye atıldığı zaman

           s: "Afk sistemini çok hızlı kullandı!", // Karalisteye atılış sebebi
             
            
          /**
           * Eğer karalistedeki kişide aşağıdaki veriler var ise kişinin *geçici* olarak karalistede olduğunu bildirir
           */

           sure: 1658216852735, // Geçici karaliste süresinin ne zaman biteceğini gösterir

           ekstra: 300000, // Kaç milisaniye karalisteye atıldığını gösterir

           kls: { // Bu ise karalisteye kaç kere atıldığını gösterir

             sure: 1658216552735, // Bu veri, kişinin ilk karalisteye atılış zamanından 1 ay sonrasını gösterir. Bunun amacı eğer kişi 1 ayda birden fazla karalisteye alınırsa bottan kalıcı olarak banlanır. Fakat 1 aydan sonra girerse daha önceki karalisteleri görmezden gelerek yine geçici olarak karalisteye alır

             tekrar: 1 // 1 ay içinde kaç kere karalisteye alındığını gösterir

           }

         },

      },

      klserver: [ // Sunucuların karaliste verileri (Her bir veri bir sunucuyu temsil eder)
        "123456789012345678",
        "1234567890123456789",
        "12345678901234567890"
      ],

      
      /**
       * Diğer veriler
       */

      öneri: { // .Öneri veya /öneri komutunu kullanarak kişilerin öneri yapmasından sonra bot belirli kanala bir mesaj atar. Ondan sonra o mesajın altına ise "Gelsin" ve "Gelmesin" butonlarını ekler ve o butonların verilerini burada kayıt eder.

         "123456789012345678": { // Öneri mesajının ID'si

          "k": [ // Gelsin diyen kişilerin ID'si (Her bir veri bir kişiyi temsil eder)
            "123456789012345678",
            "1234567890123456789"
          ],

          "r": [ // Gelmesin diyen kişilerin ID'si (Her bir veri bir kişiyi temsil eder)
            "123456789012345678",
            "1234567890123456789"
          ]

         },

      },

      yenilik: { // Yenilik komutunda gösterilen verileri gösterir

        k: [ // Yeni gelen kodları gösterir
          "Artık `<px>sor` yazarak botla biraz zaman geçirebilirsiniz",
        ],

        y: [ // Performans sorunları ve bota gelen yeni özellikleri gösterir
          "Botun bilinen performans sorunları giderilmiştir, bot eskisine göre artık daha hızlı çalışıyor",
        ],

        h: [ // Bottaki hataları gösterir
          "Bottaki bazı yazım hataları giderildi",
        ],

        ts: "18/10/2022 21:08:22" // En son ne zaman güncellendiğini gösterir

      },

      lastUptime: 1666527453550 // Botun en son ne zaman başlatıldığını gösterir

    }

/**
 * Artık burdan sonra korkmanıza gerek yok. En zorlarını geride bıraktık.
 * 
 * Şimdi ise diğerlerinin sadece isimlerini bilseniz yeter fazla detaya girmeyeceğim
 */

/**
 * Dosyaların adı ve ne işe yaradığı:
 * 
 * ./buton.json => Butonla kayıt ederken bot yeniden başlatılsa bile kişiyi kayıt etmesine olanak sağlar
 * ./kur.json => Kur komutunu kullanırken bot yeniden başlatılsa bile komutun kesilmesini önler
 * ./özel.json => Özel komutunu kullanırken bot yeniden başlatılsa bile komutun kesilmesini önler
 * ./gözel.json => Günlük özel komutunu kullanırken bot yeniden başlatılsa bile komutun kesilmesini önler
 * ./tagrol mesaj.jsob => Tagrol mesaj komutunu kullanırken bot yeniden başlatılsa bile komutun kesilmesini önler
 * ./mute.json => Mute komutunu kullanarak susturulduktan sonra ".... Adlı kişinin susturulmasını kaldırıldı" mesajının bot yeniden başlatılsa bile botun mesajı atmasına olanak sağlar
 * 
 * ./erkek toplam herkes.json => Her bir sunucunun kaç erkek kayıt ettiğini gösterir
 * ./kız toplam herkes.json => Her bir sunucunun kaç kız kayıt ettiğini gösterir
 * ./normal toplam herkes.json => Her bir sunucunun kaç üye kayıt ettiğini gösterir
 * ./kayıt toplam herkes.json => Her bir sunucunun toplamda kaç kişi kayıt ettiğini gösterir
 * 
 * ./gb toplam.json => .gb komutunu kullanarak bir kişinin kaç kere geri bildirim yaptığını gösterir
 * ./öneri toplam.json => .öneri komutunu kullanarak bir kişinin kaç kere öneri yaptığını gösterir
 * ./hata toplam.json => .hata komutunu kullanarak bir kişinin kaç kere hata mesajı yazdığını gösterir
 * 
 * ./jail.json => Bir kişiyi jail'e atarken onun önceki rollerinin kaydedilmesini sağlar. Ve eğer o kişi jail'den çıkarılırsa önceki rolleri geri verilir
 * ./tempjail.json => Temp özel komutunu kullanarak bir kişiyi süreli jail'e atarken bot yeniden başlatılsa bile süre bitince rolün geri alınmasını sağlar
 * 
 * ./premium database.json => Bir sunucunun premium'u bittiğinde premium verileri burada daha sonradan tekrar kullanılmak üzere saklanır
 * ./premium.json => Premium'a sahip kişileri ve kullandığı sunucuları gösterir
 * 
 * ./ses.json => Botu hangi sunucuların hangi ses kanalına gireceğini gösterir
 * 
 * ./snipe.json => Bir kişi kanalda mesajı silince hangi mesajın ne zaman silindiğini gösterir
 * 
 * 
 * ./tag rol.json => Bütün sunucuların tagrol bilgileri burada tutulur
 */


/**
 * Evet biraz uzun oldu bende farkındayım fakat bu botu kullanmak istiyorsanız hepsine de ihtiyacınız olacak.
 * 
 * Hepsini şimdi okumak zorunda değilsiniz botu şimdi başlatsanız herhangi bir sorun çıkmaz (Fakat başlatmadan önce ./ayarlar.json dosyasına girip gerekli bilgileri doldurunuz!!!)
 */

/**
 * Buraya kadar okuduğunuz için teşekkür ederim 💗
 * 
 * Bu bot artık sizin istediğinizi yapabilirsiniz bunda özgürsünüz fakat sizden bir ricam olacak.
 * 
 * Beni unutmayın olur mu :)
 * 
 * 
 * Sizleri seviyorum...
 */


```
