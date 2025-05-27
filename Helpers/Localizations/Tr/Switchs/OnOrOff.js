const set = {
    on: new Set([
        "aç",
        "ac",
        "açık",
        "acik",
        "aktif",
    ]),
    off: new Set([
        "kapat",
        "kapalı",
        "kapali",
        "deaktif",
    ]),
}

/**
 * "Açık mı kapalı mı olduğunu döndürür" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"on" | "off" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}