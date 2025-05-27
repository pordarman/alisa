const set = {
    use: new Set([
        "kullan",
        "kullanım",
        "kodkullan",
        "use",
        "usecode",
    ]),
    change: new Set([
        "değiş",
        "değiştir",
        "koddeğiş",
        "change",
        "changecode",
    ]),
    remain: new Set([
        "süre",
        "sürekod",
        "zaman",
        "kalan",
        "kalanzaman",
        "time",
        "remaining",
        "remainingtime",
        "remain",
        "remaintime",
        "expire",
        "expiretime",
        "expires"
    ]),
    features: new Set([
        "özellik",
        "özellikler",
        "yenilik",
        "yenilikler",
        "features",
        "feature",
    ]),
    price: new Set([
        "fiyat",
        "ücret",
        "fiyatlandırma",
        "price",
        "pricing",
    ]),
    ekle: new Set([
        "ekle",
        "ekleme",
        "add",
        "addcode",
        "oluştur",
        "oluşturma",
    ]),
    uzat: new Set([
        "uzat",
        "uzatma",
        "extend",
        "extendcode",
    ]),
    sil: new Set([
        "sil",
        "silme",
        "delete",
        "deletecode",
    ]),
    sunucu: new Set([
        "sunucu",
        "server",
        "servercode",
        "servercodes"
    ]),
}

/**
 * "premium.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"use" | "change" | "remain" | "features" | "price" | "ekle" | "uzat" | "sil" | "sunucu" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}