const set = {
    "All commands": "allCommands",
    "Owner commands": "ownerCommands",
}

/**
 * "language.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"allCommands" | "ownerCommands" | null}
 */
module.exports = function (switchKey) {
    return set[switchKey] || null;
}