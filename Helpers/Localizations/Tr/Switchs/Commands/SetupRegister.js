const set = {
    cancel: new Set([
        "iptal",
        "bitir",
        "kapat",
        "vazgeç",
        "vazgec",
        "cancel"
    ]),
    skip: new Set([
        "geç",
        "gec",
        "atla",
        "skip"
    ]),
    back: new Set([
        "geri",
        "back",
        "onceki",
        "önceki"
    ]),
}

/**
 * "setup register.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"cancel" | "skip" | "back" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}