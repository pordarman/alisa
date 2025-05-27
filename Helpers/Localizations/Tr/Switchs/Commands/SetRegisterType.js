const set = {
    gender: new Set([
        "cinsiyet",
        "cin",
        "c",
        "erkekkız",
        "erkekvekız",
        "erkekveyakız",
        "kızerkek",
        "kızveerkek",
        "kızveyaerkek",
        "gender",
        "ikirol"
    ]),
    member: new Set([
        "üye",
        "üyekayıt",
        "tekrol",
        "birrol"
    ])
}

/**
 * "set register type.js dosyası" Girilen anahtar kelimeye göre switch yapar
 * @param {String} switchKey 
 * @returns {"gender" | "member" | null}
 */
module.exports = function (switchKey) {
    for (const key in set) {
        if (set[key].has(switchKey)) return key;
    }
    return null;
}