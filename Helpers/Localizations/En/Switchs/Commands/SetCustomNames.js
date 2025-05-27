const set = {
    register: new Set([
        "register",
    ]),
    registerbot: new Set([
        "registerbot",
        "botregister",
    ]),
    login: new Set([
        "login",
    ]),
    loginbot: new Set([
        "loginbot",
        "botlogin",
    ]),
}

/**
 * "set custom names.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"register" | "registerbot" | "login" | "loginbot" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}