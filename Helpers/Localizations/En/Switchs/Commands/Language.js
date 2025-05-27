const set = {
    tr: new Set([
        "tr",
        "türkçe",
        "turkish",
        "turkce"
    ]),
    en: new Set([
        "en",
        "ingilizce",
        "english"
    ]),
}

/**
 * "language.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"tr" | "en" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}