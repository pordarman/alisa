const removeSet = require("../../Sets/Remove");
const resetSet = require("../../Sets/Resets");
const set = {
    set: new Set([
        "ekle",
        "oluştur",
        "ayarla"
    ]),
    remove: removeSet,
    change: new Set([
        "değiştir",
        "düzenle"
    ]),
    reset: resetSet,
    list: new Set([
        "liste",
        "göster",
        "gör"
    ]),
}

/**
 * "RegisterCountRole.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"set" | "remove" | "change" | "reset" | "list" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}