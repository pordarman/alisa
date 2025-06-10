# ⚠️ Telif ve Kullanım Hakkı

**Alisa isminin, profil resminin, tüm kod yapısının ve içeriğinin izinsiz kullanılması, çoğaltılması, dağıtılması veya kopyalanması yasaktır.** Alisa, özgün bir yapıya sahip olup tüm hakları geliştiricisine aittir. Bu botun ismini veya görsel materyallerini izinsiz kullanan kişi veya kuruluşlara karşı yasal işlem başlatma hakkı saklıdır. Lütfen adil kullanıma ve emeğe saygı gösteriniz.

---

# 🌟 Alisa Discord Bot

****Alisa**, *gelişmiş moderasyon sistemleri*, *butonlu kayıt yapısı*, *otomatik yönetim araçları* ve *eğlence komutlarıyla* donatılmış kapsamlı bir Discord botudur.** Sunucuların günlük yönetimini kolaylaştırmakla kalmaz, aynı zamanda topluluk etkileşimini artıran araçlar sunar. Özellikle büyük topluluklar için geliştirilen bu bot, *ayarların %100 özelleştirilebilir olması*, *detaylı analizler sunması*, *yetkilendirme sisteminin ince ayarlanabilir olması* gibi nedenlerle diğer botlardan sıyrılır. Hem *slash komut* hem de *prefix komut* desteklemesi sayesinde, her tür kullanıcıya uygun bir deneyim sağlar.

Alisa'nın altyapısı tamamen modüler olup, yeni özelliklerin kolaylıkla eklenebilmesine olanak tanır. Geliştiriciler için detaylı log sistemi, yönetim paneline uygun veri formatı ve MongoDB destekli veri yönetimiyle büyük projelere entegre edilmek için uygundur. Eğlenceli komutlardan ciddî cezalandırmalara kadar geniş bir yelpazeyi kapsayan bu yapı sayesinde, Alisa her sunucuda *sanki o sunucuya özel olarak tasarlanmış gibi* çalışır.

---

## 🔧 Kurulum

Projeyi bilgisayarınıza klonlayıp gerekli bağımlılıkları kurmak için aşağıdaki adımları takip edin:

```bash
git clone https://github.com/pordarman/alisa.git
cd alisa
npm install
```

Kurulum tamamlandıktan sonra, botu başlatmak için aşağıdaki komutu çalıştırmanız yeterlidir:

```bash
npm start
```

Yapılandırma için gerekli ayarlar `settings.json` dosyasındadır. Bu dosyada bot token’ı, MongoDB bağlantısı, bot ID’leri, sahip ID’leri ve prefix gibi ayarları yapılandırabilirsiniz. Lütfen bu dosyayı düzenlerken bilgilerin doğru ve eksiksiz olduğundan emin olun.

---

## ☁️ MongoDB Kurulumu ve Veritabanı Yapılandırması

Alisa botu verilerini MongoDB üzerinde saklar. Botu sorunsuz bir şekilde çalıştırabilmek için MongoDB veritabanınızı doğru bir şekilde yapılandırmanız çok önemlidir. Hadi bu adımları birlikte yapalım!

### 1. MongoDB Bağlantısı ve Veritabanı Oluşturma

Öncelikle, `settings.json` dosyanızda bulunan `mongodbUrl` kısmına MongoDB bağlantı URI'nizi doğru bir şekilde girdiğinizden emin olun. Bu URI, botunuzun veritabanına bağlanmasını sağlayacak anahtar bir bilgidir. Eğer MongoDB'ye aşina değilsen, [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) gibi bulut servislerini kullanarak hızlıca bir veritabanı oluşturabilirsin.

Bot ilk çalıştığında, eğer belirlenen veritabanı yoksa otomatik olarak oluşturulacaktır. Ancak, koleksiyonları ve başlangıç verilerini manuel olarak eklememiz gerekiyor.

### 2. Koleksiyonları Oluşturma

MongoDB veritabanınızda (botun `mongodbUrl` kısmında belirttiğiniz veritabanı adı altında), iki ana koleksiyon oluşturmanız gerekiyor:

* **`Guilds`**: Bu koleksiyon, sunucuya özel ayarları ve verileri tutacak. Her Discord sunucusunun kendi ayarları bu koleksiyonda saklanacak.
* **`Others`**: Bu koleksiyon ise genel bot ayarları, istatistikler ve diğer yardımcı veriler için kullanılacak.

Bu koleksiyonları MongoDB arayüzünüzden (örneğin MongoDB Compass, Atlas UI veya `mongo` kabuğu) oluşturabilirsiniz. `Database.js` dosyandaki `init` fonksiyonuna göre, bot `Main` adında bir veritabanı kullanıyor ve koleksiyon isimleri `isMainBot` değişkenine göre `Guilds` veya `Sunucu`, ve `Others` veya `Diğerleri` olarak ayarlanıyor. Varsayılan olarak `isMainBot: true` olduğu için `Guilds` ve `Others` koleksiyonlarını oluşturmalısın.

### 3. `Others` Koleksiyonuna Başlangıç Verilerini Ekleme

`Others` koleksiyonunu oluşturduktan sonra, botun doğru çalışabilmesi için içine bazı başlangıç verileri eklememiz gerekiyor. Lütfen aşağıdaki 6 farklı belgeyi (`document`) `Others` koleksiyonunuza ekleyin. Bu belgeler, botun temel işlevleri için gerekli olan çeşitli verileri başlangıçta ayarlıyor:

* **`premium` belgesi**: Bu belge, sunucuların premium bilgilerini tutan verileri içerir.
    ```json
    { "id": "premium" }
    ```
* **`alisa` belgesi**: Botun genel istatistikleri, komut kullanımları, kara listeler ve sunucu sayımları gibi önemli verilerini içerir.
    ```json
    {
      "id": "alisa",
      "commandUses": {},
      "usersCommandUses": {},
      "guildsCommandUses": {},
      "blacklistUsers": {},
      "blacklistGuilds": {},
      "registersCount": { "nowTotal": 0 },
      "guildsCount": {},
      "lastUptimeTimestamp": 0,
      "guildAddLeave": { "add": {}, "leave": {} }
    }
    ```
* **`wrong commands` belgesi**: Yanlış girilen komutların verisini tutmak için kullanılabilir.
    ```json
    { "id": "wrong commands" }
    ```
* **`registers` belgesi**: Sunucuların kayıt ettikleri erkek, kız ve diğer üyelerin sayılarını tutar.
    ```json
    { "id": "registers" }
    ```
* **`members names` belgesi**: Üyelerin önceki isimlerini takip etmek gibi isimle ilgili veriler için kullanılır.
    ```json
    { "id": "members names" }
    ```

**Nasıl Yapılır? (Örnek: MongoDB Compass)**

1.  MongoDB Compass'ı açın ve veritabanınıza bağlanın.
2.  Sol taraftaki menüden botunuzun kullanacağı veritabanını seçin (varsayılan olarak `"Main"` olarak ayarlanmıştır, `Database.js` dosyasından kontrol edebilirsin).
3.  Sağ taraftaki "COLLECTIONS" başlığı altında `Guilds` ve `Others` koleksiyonlarını oluşturun (eğer yoksa).
4.  `Others` koleksiyonunu seçin.
5.  "ADD DATA" butonuna tıklayın ve "Insert Document" seçeneğini seçin.
6.  Açılan pencerede yukarıdaki JSON yapılarını tek tek kopyalayıp yapıştırın ve her biri için "Insert" butonuna basın.

Bu adımları tamamladığınızda, MongoDB veritabanınız Alisa botunu çalıştırmak için hazır hale gelmiş olacak. Harika bir iş çıkardın! 🎉

---

## 🚀 Özellikler

### 🔹 Gelişmiş Kayıt Sistemi

Butonlu ve otomatik sistemlerle donatılmış kayıt altyapısı sayesinde yeni üyeler saniyeler içinde kayıt edilebilir. Giriş mesajları, kayıt sonrası mesajlar, isim biçimi ve rol atamaları gibi tüm ayarlar özelleştirilebilir.

### 🔹 Jail ve Ceza Takip Sistemi

Yetkililer tarafından uygulanabilen süreli/süresiz jail işlemleriyle birlikte kullanıcı geçmişi de izlenebilir. Ceza geçmişi, son jail listesi, otomatik eski rol geri yükleme ve daha fazlası.

### 🔹 Eğlence ve Araç Komutları

Kullanıcılar arası ilişki puanlaması (.ship), AFK sistemi, profil bilgileri, avatar gösterimi, "snipe" gibi yardımcı ve eğlenceli komutlar sayesinde topluluk içi etkileşim artar.

### 🔹 İstatistik ve Analiz

Toplu mesaj/ses verileri, en aktif kullanıcı listeleri ve ses kanalı kullanım analizleri. “topstat” gibi komutlarla yetkililere detaylı sunucu içgörüleri sunar.

### 🔹 Moderasyon ve Yönetim

Ban, kick, mute, rol alma/ekleme gibi işlemler hızlıca uygulanabilir. Yetkili yönetimi, oto mesaj sistemleri, gelişmiş prefix ayarları ve daha fazlası botun yönetim yeteneklerini öne çıkarır.

### 🔹 Geliştirici Desteği ve Premium

Bot sahipleri için özel geliştirici komutları ve test araçları mevcuttur. Premium kullanıcılar gecikmesiz komut kullanımı, öncelikli özellik erişimi ve destek sunucusunda özel rol gibi avantajlara sahip olur.


---
## 🧠 Veritabanı ve Yapılandırma

Alisa botu verilerini MongoDB üzerinde saklar. Veritabanına doğrudan require("mongodb") ile erişilir ve mongoose gibi ara katmanlar kullanılmaz. Bu doğrudan bağlantı yöntemi, esnek veri işleme ve yüksek performans sağlar.

Sunucuya özel tüm ayarlar settings.json üzerinden düzenlenir ve MongoDB'de aşağıdaki gibi yapılandırılmış bir belge olarak saklanır:

```js
{
  prefix: ".",
  language: "tr",
  register: {
    authorizedInfos: {},
    roleIds: {
      boy: [], girl: [], member: [], bot: [], registerAuth: "", unregister: ""
    },
    channelIds: {
      register: "", log: "", afterRegister: ""
    },
    rankRoles: {},
    type: "gender",
    isRegisterOff: false,
    isAuthroizedNotificationOn: true,
    isAutoRegisterForBot: true,
    isAutoCorrectOn: true,
    isAgeRequired: false,
    isNameRequired: true,
    ageLimit: null,
    lastRegisters: [],
    customNames: {
      register: "<tag> <name>",
      registerBot: "<tag> <name>",
      guildAdd: "<tag> <name>",
      guildAddBot: "<tag> <name>"
    },
    customLogin: { content: "", image: "", isEmbed: false },
    customAfterRegister: { content: "", image: "", isEmbed: false },
    prevNamesOfMembers: {},
    tag: "",
    symbol: ""
  },
  moderation: {
    nowMutedMembers: {},
    penaltyNumber: 1,
    roleIds: { banAuth: "", kickAuth: "", muteAuth: "" },
    channelIds: { modLog: "" }
  },
  roleIds: { vip: "", vipAuth: "" },
  channelIds: { voice: "" },
  suspicious: {
    autoSuspicious: false,
    suspiciousTime: 1000 * 60 * 60 * 24 * 14,
    role: ""
  },
  waitMessageCommands: {
    buttonRegister: {}, changeName: {}, autoResponse: {}
  },
  snipe: {},
  jail: {
    nowJailedMembers: {}, roleId: "", authRoleId: "", logChannelId: "",
    userLogs: {}, last: [], prevRoles: {}
  },
  premium: {
    partnerRoleId: "", authorizedRoleIds: []
  },
  userLogs: {},
  autoResponse: {},
  countCommandSettings: {
    datas: {
      total: true, registered: true, tagged: true, voice: true,
      boostCount: true, vip: false, jail: false, registerAuth: false,
      jailAuth: false, vipAuth: false, banAuth: false, kickAuth: false,
      muteAuth: false, status: true
    },
    isEmoji: true
  },
  afk: {},
  stats: {},
  isStatOn: false
}
```

Bu yapı sayesinde her sunucunun kayıt, moderasyon, ceza sistemi, premium özellikleri ve istatistik ayarları detaylı bir şekilde kontrol altına alınabilir. Her modül kendi iç yapısını settings.json içinden veya veritabanından okuyarak bağımsız çalışabilir.

## 🤝 Katkıda Bulun

Pull request gönderebilir ya da [issue](https://github.com/pordarman/alisa/issues) açarak katkıda bulunabilirsin.

## 📜 Lisans

MIT Lisansı

---

## ❤️ Son Bir Söz

Eğer bu satırları okuyorsan, bil ki seni gerçekten önemsiyoruz. Alisa’yı seveceğine eminiz çünkü onu senin gibi güzel insanlar için geliştirdik. Bu botu paylaşman, geliştirmen veya sadece kullanman bizim için çok değerli. İyi ki varsın 💙
