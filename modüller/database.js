const fs = require('fs')
const guildDatabase = {
  kayıtkisiler: {},
  son: [],
  kayıt: { bototo: true, isimler: {}, otoduzeltme: true },
  isimler: {},
  premium: {},
  kl: {},
  sc: { sayı: 1, kisi: {} },
  jail: { kisi: {}, son: [] },
  say: { veri: { t: true, ü: true, tag: true, sü: true, b: true }, emoji: true },
  afk: {}
}

class DB {

  constructor() { }

  get version() {
    return "3.2.0"
  }

  yaz(veri, değer, dosyaAdı = "database", klasorAdı = "database") {
    const dosya = JSON.parse(fs.readFileSync(`${klasorAdı}/${dosyaAdı}.json`, 'utf8'))
    dosya[veri] = değer
    fs.writeFileSync(`${klasorAdı}/${dosyaAdı}.json`, JSON.stringify(dosya, null, 1))
    return dosya
  }

  yazdosya(değer, dosyaAdı = "database", klasorAdı = "database") {
    fs.writeFileSync(`${klasorAdı}/${dosyaAdı}.json`, JSON.stringify(değer, null, 1))
    return değer
  }

  bul(veri, dosyaAdı = "database", klasorAdı = "database") {
    let dosya
    try {
      dosya = JSON.parse(fs.readFileSync(`${klasorAdı}/${dosyaAdı}.json`, 'utf8'))[veri]
    } catch (e) { }
    return dosya
  }

  buldosya(dosyaAdı, klasorAdı = "database") {
    let dosya
    try {
      dosya = JSON.parse(fs.readFileSync(`${klasorAdı}/${dosyaAdı}.json`, 'utf8'))
    } catch (e) {
      if (klasorAdı == "diğerleri") {
        console.error(e)
        return undefined
      }
      dosya = this.yazdosya(guildDatabase, dosyaAdı, klasorAdı)
    }
    return dosya
  }

  sil(veri, dosyaAdı = "database", klasorAdı = "database") {
    const dosya = JSON.parse(fs.readFileSync(`${klasorAdı}/${dosyaAdı}.json`, 'utf8'))
    if (!dosya[veri]) return;
    delete dosya[veri]
    return fs.writeFileSync(`${klasorAdı}/${dosyaAdı}.json`, JSON.stringify(dosya, null, 1))
  }

  topla(veri, değer, dosyaAdı = "database", klasorAdı = "database", x = true) {
    const dosya = JSON.parse(fs.readFileSync(`${klasorAdı}/${dosyaAdı}.json`, 'utf8'))
    if (!dosya[veri]) {
      this.yaz(veri, değer, dosyaAdı, klasorAdı)
      return x ? Object.values(dosya).reduce((top, sayı) => top + sayı, 0) : değer
    }
    dosya[veri] += değer
    fs.writeFileSync(`${klasorAdı}/${dosyaAdı}.json`, JSON.stringify(dosya, null, 1))
    return x ? Object.values(dosya).reduce((top, sayı) => top + sayı, 0) : dosya[veri]
  }

  sıfırla(dosyaAdı = "database", klasorAdı = "database") {
    return fs.writeFileSync(`${klasorAdı}/${dosyaAdı}.json`, "{}")
  }

  ping() {
    let pingşeysi = Date.now()
    const obje = { id: "<@5465465443543543>", kk: "<@546546544354343534543>", r: "<@&5465465443543543>, <@&5465465443543543>, <@&5465465443543543>", z: (pingşeysi / 1000).toFixed(0) }
    this.yaz("ilk", [obje, obje, obje, obje, obje])
    this.yaz("ilk2", [obje, obje, obje, obje, obje])
    const ilk = this.bul("ilk")
    ilk.push(obje)
    const ilk2 = this.bul("ilk2")
    ilk2.push(obje)
    this.topla("kız", 1)
    this.sil("ilk")
    this.sil("ilk2")
    this.sil("kız")
    return (Date.now() - pingşeysi)
  }

}

module.exports = new DB()
