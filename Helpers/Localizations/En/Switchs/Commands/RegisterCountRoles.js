const removeSet = require("../../Sets/Remove");
const resetSet = require("../../Sets/Resets");
const set = {
    set: new Set([
        "set",
        "add"
    ]),
    remove: removeSet,
    change: new Set([
        "change",
        "edit"
    ]),
    reset: resetSet,
    list: new Set([
        "list",
        "show",
        "see"
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