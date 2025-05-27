"use strict";
/**
 * @typedef {Object} User
 * @property {Number} count
 * @property {Number} warnCount
 * @property {Number} banCount
 * @property {NodeJS.Timeout} interval
 */

const database = require("../Helpers/Database.js");
const Time = require("../Helpers/Time");
const allMessages = require("../Helpers/Localizations/Index.js");
const {
    mainBotId
} = require("../settings.json");
const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

module.exports = class SpamControl {


    /**
     * Varsayılan değerleri ayarlar (5 saniye içinde en fazla 5 komut)
     * @param {Number} spamLimit - En fazla kaç komut yapılabilir (Varsayılan: 5)
     * @param {Number} spamTime - Kaç salise içinde kaç komut yapılabilir (Varsayılan: 5000)
     * @param {Number} maxWarnCount - Kaç uyarıda kullanıcının bottan banlanacağını belirler (Varsayılan: 3)
     * @param {Array<Number>} banTimes - Max uyarı sayısını geçtikten sonra banlanma süreleri (banCount verisine göre) (Varsayılan: [5 dakika, 10 dakika, 1 saat, 1 gün, 1 hafta])
     * 
     */
    constructor(
        spamLimit = 5,
        spamTime = 5000,
        maxWarnCount = 5,
        banTimes = [Time.parseTime("5m"), Time.parseTime("10m"), Time.parseTime("1h"), Time.parseTime("1d"), Time.parseTime("1w")]
    ) {
        this.spamLimit = spamLimit;
        this.spamTime = spamTime;
        this.maxWarnCount = maxWarnCount;
        this.banTimes = banTimes;
        this.spam = {};
    }


    /**
     * Kullanıcının komut sayısını arttırır
     * @param {String} userId
     * @param {"afk" | "command"} type
     * @returns {Promise<{ type: "warn" | "ban", banTime?: Number, warnCount?: Number } | false>}
     * @async
     */
    async addCount(userId, type) {
        const now = Date.now();
        const user = this.spam[userId] ??= {
            warnCount: 0,
            banCount: 0,
            messages: [],
        };
        user.messages.push(now);

        user.messages = user.messages.filter(timestamp => now - timestamp <= this.spamTime);

        // Spam kontrolü yap
        return user.messages.length >= this.spamLimit ? await this.addWarnCount(userId, type) : false;
    }


    /**
     * Kullanıcıwnın uyarılma sayısını arttırır ve eğer belirlenen sayıya ulaşırsa banlar
     * @param {String} userId
     * @param {"afk" | "command"} type
     * @returns {Promise<{ type: "warn" | "ban", banTime?: Number, warnCount?: Number } | false>}
     * @async
     */
    async addWarnCount(userId, type) {
        const user = this.spam[userId];
        if (!user) return false;

        user.warnCount += 1;
        user.messages = [];

        return user.warnCount >= this.maxWarnCount ? await this.banUser(userId, type) : {
            type: "warn",
            warnCount: user.warnCount
        };
    }


    /**
     * Kullanıcıyı banlar
     * @param {String} userId
     * @param {"afk" | "command"} type
     * @returns {Promise<{ type: "ban", banTime?: Number } | false>}
     * @async
     */
    async banUser(userId, type) {
        const user = this.spam[userId];
        if (!user) return false;

        const alisa = await database.getFile("alisa");

        user.banCount += 1;
        user.warnCount = 0;
        user.messages = [];

        const timestamp = Date.now();

        // Eğer banCount banTimes arrayinin dışına çıkarsa sınırsız banlanır
        const banTime = this.banTimes[user.banCount - 1];
        if (!banTime) {
            alisa.blacklistUsers[userId] = {
                addedTimestamp: timestamp,
                reason: type == "afk" ? "AFK sistemini çok hızlı kullandı" : "Komutları çok hızlı kullandı",
                isSee: false,
                ownerId: mainBotId
            };
            await database.updateFile("alisa", {
                $set: {
                    [`blacklistUsers.${userId}`]: alisa.blacklistUsers[userId]
                }
            });
            return {
                type: "ban"
            }
        }

        // Geçici olarak banla
        const fileUserData = alisa.blacklistUsers[userId];
        if (!fileUserData) {
            alisa.blacklistUsers[userId] = {
                addedTimestamp: timestamp,
                reason: type == "afk" ? "AFK sistemini çok hızlı kullandı" : "Komutları çok hızlı kullandı",
                ownerId: mainBotId,
                isSee: false,
                temp: {
                    expiresTimestamp: timestamp + banTime,
                    startedTimestamp: timestamp,
                    banCount: 1
                }
            };
        } else {
            // Eğer fileUserData.temp.startedTimestamp ile şu anki zaman arasında 1 ay fark varsa banCount sıfırlanır
            if (timestamp - fileUserData.temp.startedTimestamp > ONE_MONTH) {
                fileUserData.temp.startedTimestamp = timestamp;
                fileUserData.temp.banCount = 1;
            } else {
                fileUserData.temp.banCount += 1;
            }
            fileUserData.temp.expiresTimestamp = timestamp + banTime;
        }
        await database.updateFile("alisa", {
            $set: {
                [`blacklistUsers.${userId}`]: alisa.blacklistUsers[userId]
            }
        });
        return {
            type: "ban",
            banTime
        }
    }



    /**
     * Kullanıcının spam kontrolü yapılır ve eğer spam yapıyorsa uyarılma veya banlanma mesajı döndürür
     * @param {String} userId 
     * @param {"afk" | "command"} type 
     * @param {"tr" | "en"} language 
     * @returns {Promise<String | undefined>}
     * @async
     */
    async addCountAndReturnMessage(userId, type = "command", language = "tr") {
        const spamUser = await this.addCount(userId, type);
        if (spamUser === false) return;

        const otherMessages = allMessages[language].others.events.messageOrInteractionCreate;

        let content;
        switch (spamUser.type) {
            case "ban":
                content = "banTime" in spamUser ? otherMessages.tempBannedFromBot("Spam", spamUser.banTime) : otherMessages.bannedFromBot("Spam");
                break;

            case "warn":
                content = otherMessages.warnedFromBot("Spam", spamUser.warnCount + 1 == this.maxWarnCount);
                break;
        }

        return content;
    }
}