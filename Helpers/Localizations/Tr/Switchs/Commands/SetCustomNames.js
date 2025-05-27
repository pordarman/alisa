const set = {
    register: new Set([
        "kayıt",
        "register",
    ]),
    registerbot: new Set([
        "kayıtbot",
        "kayitbot",
        "botkayıt",
        "botregister",
    ]),
    login: new Set([
        "giriş",
        "giris",
        "login",
    ]),
    loginbot: new Set([
        "girişbot",
        "girisbot",
        "botgiriş",
        "botgiris",
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