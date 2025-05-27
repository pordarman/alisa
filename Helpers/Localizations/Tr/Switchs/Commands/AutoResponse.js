const removeSet = require("../../Sets/Remove")
const set = {
    add: new Set([
        "ayarla",
        "set",
        "kaydet",
        "kayıt",
        "ekle",
        "add",
    ]),
    remove: removeSet,
    list: new Set([
        "liste",
        "list",
    ]),
}

/**
 * "auto response.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"set" | "remove" | "list" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}