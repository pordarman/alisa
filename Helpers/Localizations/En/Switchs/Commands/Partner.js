const resetSet = require("../../Sets/Resets")
const set = {
    set: new Set([
        "set",
        "save",
        "register",
        "role",
        "setrole",
    ]),
    reset: resetSet,
    view: new Set([
        "view",
        "show",
        "see",
        "display",
    ]),
    tag: new Set([
        "tag",
        "mention",
    ]),
    role: new Set([
        "role",
        "rol",
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