const resetSet = require("../../Sets/Resets")
const set = {
    set: new Set([
        "ayarla",
        "set",
        "kaydet",
        "kayıt",
        "rolayarla",
    ]),
    reset: resetSet,
    view: new Set([
        "görüntüle",
        "gör",
        "view",
        "show",
        "see"
    ]),
    tag: new Set([
        "etiket",
        "etiketle",
        "bahset",
        "tag"
    ]),
    role: new Set([
        "rol",
        "role"
    ]),
}

/**
 * "set register type.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"set" | "reset" | "view" | "tag" | "role" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}