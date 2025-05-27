const set = {
    role: new Set([
        "rol",
        "rolayarla",
        "role",
        "setrole",
        "set",
    ]),
    authorized: new Set([
        "yetkili",
        "yetkilirol",
        "authorized",
        "authorizedrole",
        "authrole",
        "auth",
    ]),
    take: new Set([
        "al",
        "alrol",
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