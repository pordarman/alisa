const resetSet = require("../../Sets/Resets")
const set = {
    set: new Set([
        "set",
        "add"
    ]),
    reset: resetSet,
    view: new Set([
        "see",
        "view"
    ]),
    tag: new Set([
        "tag",
        "tagrole"
    ]),
    role: new Set([
        "role",
        "roles",
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