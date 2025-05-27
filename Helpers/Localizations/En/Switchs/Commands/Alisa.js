const set = {
    leaderboard: new Set([
        "leaderboard",
        "leaderboards",
        "leader",
        "leaders",
        "lb",
        "rank",
        "ranks"
    ]),
    commands: new Set([
        "commands",
        "command",
        "cmd",
        "cmds"
    ]),
    total: new Set([
        "total",
        "all"
    ]),
    guilds: new Set([
        "guilds",
        "guild",
        "server",
        "servers",
        "guildlb",
        "guildleaderboard",
        "serverlb",
        "serverleaderboard",
        "lbguild",
        "lbguilds",
        "leaderboardguild",
        "leaderboardsguild",
        "leaderboardsguilds",
        "leaderboardsserver",
        "leaderboardservers"
    ]),
    who: new Set([
        "who",
        "whos",
        "whois"
    ]),
};

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