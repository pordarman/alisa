const set = {
    cancel: new Set([
        "cancel",
        "end",
        "close",
        "stop"
    ]),
    skip: new Set([
        "skip",
        "pass"
    ]),
    back: new Set([
        "back",
        "previous"
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