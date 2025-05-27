const set = {
    "Tüm komutlar": "allCommands",
    "Sahip komutları": "ownerCommands",
}

/**
 * "language.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @param {"tr" | "en"} language 
 * @returns {"allCommands" | "ownerCommands" | null}
 */
module.exports = function (switchKey) {
    return set[switchKey] || null;
}