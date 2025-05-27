const set = {
    switch: {
        add: new Set([
            "ekle",
            "ekleme",
            "add",
            "adddata",
            "adddatas",
        ]),
        remove: new Set([
            "çıkar",
            "çıkart",
            "çıkarma",
            "kaldır",
            "remove",
            "removedata",
            "removedatas",
        ]),
        emoji: new Set([
            "emoji",
            "emojili"
        ]),
        noemoji: new Set([
            "emojisiz",
            "noemoji"
        ]),
    },
    codeFromText: {
        total: new Set([
            "toplam",
            "total",
            "all",
            "membercount"
        ]),
        registered: new Set([
            "üye",
            "üyeler",
            "member",
            "members",
            "user",
            "users",
        ]),
        tagged: new Set([
            "tag",
            "tagged",
            "taglıüye",
            "tagliuye",
        ]),
        voice: new Set([
            "ses",
            "sesli",
            "voice",
            "sesliüye",
            "sesliuye",
        ]),
        boostCount: new Set([
            "boost",
            "boostcount",
        ]),
        vip: new Set([
            "vip",
            "vipüye",
            "vipuye",
        ]),
        registerAuth: new Set([
            "kayıt",
            "kayıtyetkili",
            "kayıtyetkilisi",
            "registerauth",
        ]),
        jail: new Set([
            "jail",
            "jailuyeler",
            "jailüyeler",
            "jaildekiler",
        ]),
        jailAuth: new Set([
            "jailyetkili",
            "jailyetkilisi",
            "jailauth",
        ]),
        vipAuth: new Set([
            "vipyetkili",
            "vipyetkilisi",
        ]),
        banAuth: new Set([
            "ban",
            "banyetkili",
            "banyetkilisi"
        ]),
        kickAuth: new Set([
            "kick",
            "kickyetkili",
            "kickyetkilisi"
        ]),
        muteAuth: new Set([
            "mute",
            "muteyetkili",
            "muteyetkilisi"
        ]),
        status: new Set([
            "durum",
            "durumlar",
            "status"
        ])
    }
}

module.exports = {
    /**
     * "set count options.js dosyası" Girilen anahtar kelimeye göre switch yapar
     * @param {String} switchKey 
     * @returns {"total" | "registered" | "tagged" | "voice" | "boostCount" | "vip" | "registerAuth" | "jail" | "jailAuth" | "vipAuth" | "banAuth" | "kickAuth" | "muteAuth" | null}
     */
    codeFromText(text) {
        for (const key in set.codeFromText) {
            if (set.codeFromText[key].has(text)) return key;
        }
        return null;
    },

    /**
      * "set count options.js dosyası" Girilen anahtar kelimeye göre switch yapar
      * @param {String} switchKey 
      * @returns {"add" | "remove" | "emoji" | "noemoji" | null}
      */
    switch(switchKey) {
        for (const key in set.switch) {
            if (set.switch[key].has(switchKey)) return key;
        }
        return null;
    }
}