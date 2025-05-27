const set = {
    gender: new Set([
        "gender",
        "g",
        "malefemale",
        "maleandfemale",
        "maleorfemale",
    ]),
    member: new Set([
        "member",
        "memberregister",
        "singlerole",
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