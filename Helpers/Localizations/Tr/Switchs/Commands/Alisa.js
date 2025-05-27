const set = {
    leaderboard: new Set([
        "sıra",
        "sıralama",
        "liderlik"
    ]),
    commands: new Set([
        "komutlar",
        "komut",
        "commands",
        "command"
    ]),
    total: new Set([
        "toplam",
        "total"
    ]),
    guilds: new Set([
        "sunucu",
        "sunucular",
        "guild",
        "guilds"
    ]),
    who: new Set([
        "kim",
        "who"
    ]),
}

/**
 * "alisa.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"leaderboard" | "commands" | "total" | "guilds" | "who" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}