const set = {
    on: new Set([
        "on",
        "open",
        "active",
    ]),
    off: new Set([
        "off",
        "close",
        "deactive",
    ]),
}

/**
 * "Açık mı kapalı mı olduğunu döndürür" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @param {"tr" | "en"} language 
 * @returns {"on" | "off" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}