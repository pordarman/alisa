const resetSet = require("../../Sets/Resets")
const set = {
    set: new Set([
        "ayarla",
        "set",
        "ekle",
        "add"
    ]),
    reset: resetSet,
    view: new Set([
        "gör",
        "bak",
        "see",
        "view"
    ]),
    tag: new Set([
        "etiket",
        "etiketle",
        "tag",
        "tagrole"
    ]),
    role: new Set([
        "rol",
        "role",
        "yetkili",
        "yetkilirol",
        "authorized",
        "authorizedrole"
    ]),
}

/**
 * "authorized.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"set" | "reset" | "see" | "tag" | "role" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}