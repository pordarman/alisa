const set = {
    switch: {
        add: new Set([
            "add",
            "adddata",
            "adddatas",
        ]),
        remove: new Set([
            "remove",
            "removedata",
            "removedatas",
        ]),
        emoji: new Set([
            "emoji",
            "withemoji",
            "useemoji"
        ]),
        noemoji: new Set([
            "noemoji",
            "withoutemoji",
            "usenoemoji"
        ]),
    },
    codeFromText: {
        total: new Set([
            "total",
            "all",
            "membercount"
        ]),
        registered: new Set([
            "user",
            "users",
            "member",
            "members",
        ]),
        tagged: new Set([
            "tag",
            "tagged",
            "taggeduser",
            "taggedusers",
        ]),
        voice: new Set([
            "voice",
            "voiceuser",
            "voiceusers",
        ]),
        boostCount: new Set([
            "boost",
            "boostcount",
        ]),
        vip: new Set([
            "vip",
            "vipuser",
            "vipusers",
        ]),
        registerAuth: new Set([
            "register",
            "registerauth",
            "registerauthuser",
            "registerauthusers",
        ]),
        jail: new Set([
            "jail",
            "jailed",
            "jaileduser",
            "jailedusers",
        ]),
        jailAuth: new Set([
            "jailauth",
            "jailauthuser",
            "jailauthusers",
        ]),
        vipAuth: new Set([
            "vipauth",
            "vipauthuser",
            "vipauthusers",
        ]),
        banAuth: new Set([
            "banauth",
            "banauthuser",
            "banauthusers",
        ]),
        kickAuth: new Set([
            "kickauth",
            "kickauthuser",
            "kickauthusers",
        ]),
        muteAuth: new Set([
            "muteauth",
            "muteauthuser",
            "muteauthusers",
        ]),
        status: new Set([
            "status",
            "statuses"
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