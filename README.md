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

```json
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
