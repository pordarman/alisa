const set = {
    use: new Set([
        "use",
        "usecode",
    ]),
    change: new Set([
        "change",
        "changecode",
    ]),
    remain: new Set([
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
        "features",
        "feature",
    ]),
    price: new Set([
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
        "sunucular",
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