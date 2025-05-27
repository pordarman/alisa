const set = {
    role: new Set([
        "rol",
        "setrole",
        "role",
        "set",
    ]),
    authorized: new Set([
        "authorized",
        "authrole",
        "authorizedrole",
        "auth",
    ]),
    take: new Set([
        "take",
        "takerole",
        "remove",
        "removerole"
    ]),
}

/**
 * "vip.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"role" | "authorized" | "take" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}