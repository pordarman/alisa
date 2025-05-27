const resetSet = require("../Sets/Resets")
const set = {
    cancel: new Set([
        "iptal",
        "vazgeç",
        "kapat",
        "kapatma",
        "kapatmak",
        "vazgeçmek",
        "iptal et",
        "iptal etme",
        "cancel",
        "close",
        "off",
        "deactive",
    ]),
    reset: resetSet,
}

/**
 * "İptal mi ettiğini yoksa sıfırlamak istediğini mi döndürür" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"cancel" | "reset" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}