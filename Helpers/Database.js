"use strict";

const mongodb = require("mongodb");
const {
    mongodbUrl,
    prefix: defaultPrefix,
    isMainBot
} = require("../settings.json");
const client = new mongodb.MongoClient(mongodbUrl);
const LRUCache = require("lru-cache");
const os = require("os");

const guildCaches = new LRUCache.LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 10, // 10 dakika
    updateAgeOnGet: true
});
const otherCaches = new Map();

const updateCache = new Map();
const updateTimers = new Map();
const UPDATE_TIMEOUT = 5000;

let isClosing = false;

class MongoDB {

    get defaultGuildDatabase() {
        return {
            prefix: defaultPrefix, // Sunucunun varsayılan prefixi
            language: "tr", // Sunucunun dili

            register: { // Kayıt verileri

                authorizedInfos: {}, // Kayıt yapan yetkili verileri

                roleIds: { // Rol ID'leri

                    boy: [], // Erkek rolü ID'leri
                    girl: [], // Kız rolü ID'leri
                    member: [], // Üye rolü ID'leri
                    bot: [], // Bot rolü ID'leri
                    registerAuth: "", // Yetkili rol ID'si
                    unregister: "" // Kayıtsız üye ID'si
                },
                channelIds: { // Kanal ID'leri
                    register: "", // Kayıt kanalı ID'si
                    log: "", // Kayıt log kanalı ID'si
                    afterRegister: "", // Kayıt sonrası atılacak kanal ID'si
                },
                rankRoles: {}, // Rütbe rolleri
                type: "gender", // Kayıtın türü
                isRegisterOff: false, // Kaydın kapalı olup olmadığı
                isAuthroizedNotificationOn: true, // Yetkili bildiriminin açık olup olmadığı
                isAutoRegisterForBot: true, // Botların otomatik kayıt yapılıp yapılmadığı
                isAutoCorrectOn: true, // İsim düzeltmesi
                isAgeRequired: false, // Yaş girmenin zorunlu olup olmadığı
                isNameRequired: true, // İsim girmenin zorunlu olup olmadığı
                ageLimit: null, // Yaş sınırı
                lastRegisters: [], // Son yapılan kayıtlar
                customNames: { // Özel isimler

                    register: "<tag> <name>", // Kayıt yapılırken düzenelecek isim
                    registerBot: "<tag> <name>", // Bot kayıt yapılırken düzenelecek isim
                    guildAdd: "<tag> <name>", // Kullanıcı sunucuya giriş yapınca düzenlenecek isim
                    guildAddBot: "<tag> <name>", // Bot sunucuya giriş yapınca düzenlenecek isim
                },
                customLogin: { // Özel giriş mesajı
                    content: "",
                    image: "",
                    isEmbed: false,
                },
                customAfterRegister: { // Özel kayıt sonrası mesajı
                    content: "",
                    image: "",
                    isEmbed: false,
                },
                prevNamesOfMembers: {}, // Üyelerin önceki isimleri
                tag: "", // Kayıt için gerekli tag
                symbol: "" // Kayıt için gerekli sembol
            },

            moderation: { // Moderasyon verileri

                nowMutedMembers: {}, // Şu anda susturulmuş üyeler ve süresinin açılmasını bekleyen üyeler
                penaltyNumber: 1, // Ceza numarası

                roleIds: { // Rol ID'leri

                    banAuth: "", // Ban yetkili rol ID'si
                    kickAuth: "", // Kick yetkili rol ID'si
                    muteAuth: "", // Mute yetkili rol ID'si
                },

                channelIds: { // Kanal ID'leri

                    modLog: "" // Moderasyon log kanalı ID'si
                }
            },

            roleIds: { // Rol ID'leri

                vip: "", // VIP rol ID'si
                vipAuth: "", // VIP yetkili rol ID'si
            },

            channelIds: { // Kanal ID'leri

                voice: "", // Botun katılacağı ses kanalı ID'si
            },

            suspicious: { // Şüpheli verileri

                autoSuspicious: false, // Otomatik olarak şüpheliye atılıp atılmayacağı
                suspiciousTime: 1000 * 60 * 60 * 24 * 14, // Şüpheli süresi (14 gün)
                role: "" // Şüpheli kişilere verilecek rol ID'si
            },

            waitMessageCommands: { // Mesaj bekleyen komut verilerini burda tutuyoruz

                buttonRegister: {}, // Butonla kayıt edilen üyeler
                changeName: {}, // Butonla ismi düzenlenen üyeler
                autoResponse: {} // Otomatik cevap verme komutları
            },

            snipe: {}, // Snipe verileri

            jail: { // Jail verileri

                nowJailedMembers: {}, // Şu anda Jail'e atılmış ve süresinin açılmasını bekleyen üyeler
                roleId: "", // Jail rol ID'si
                authRoleId: "", // Jail yetkili rol ID'si
                logChannelId: "", // Jail log kanalı ID'si
                userLogs: {}, // Jail kullanıcı verileri
                last: [], // Jaile atılan son kişiler
                prevRoles: {}, // Jaile atılan kullanıcıların rol verileri
            },
            premium: { // Premium verileri

                partnerRoleId: "", // Partner rol ID'si
                authorizedRoleIds: [], // Yetkili rol ID'leri
            },

            userLogs: {}, // Kullanıcının verileri

            autoResponse: {}, // Otomatik cevap verileri

            countCommandSettings: {
                datas: {
                    total: true,
                    registered: true,
                    tagged: true,
                    voice: true,
                    boostCount: true,
                    vip: false,
                    jail: false,
                    registerAuth: false,
                    jailAuth: false,
                    vipAuth: false,
                    banAuth: false,
                    kickAuth: false,
                    muteAuth: false,
                    status: true
                },
                isEmoji: true
            },
            afk: {},

            stats: {}, // Sunucudaki üyelerin istatistik verileri (mesaj sayısı, sesli kanalda geçirilen süre)
            isStatOn: false, // İstatistiklerin açık olup olmadığı
        }
    }


    /**
     * @async
     * Bütün ayarlamaları otomatik olarak yapar
     * @returns {Promise<Boolean>}
     */
    async init() {
        // Eğer daha önceden bağlantı varsa bağlantıyı kapat
        await client.close(true);
        this.isConnected = await this.connect();

        // Bağlantı başarısız oldu
        if (!this.isConnected) {
            console.error(`Şu anda MongoDB sunucusuna bağlanamıyoruz, lütfen daha sonra yeniden deneyiniz!`);
            process.exit(1);
        }

        const db = client.db("Main");

        this.guilds = db.collection(isMainBot ? "Guilds" : "Sunucu");
        this.others = db.collection(isMainBot ? "Others" : "Diğerleri");

        this.guilds.createIndex({ id: 1 }, { unique: true });
        this.others.createIndex({ id: 1 }, { unique: true });

        // Uygulamada bir hata olduğunda konsola yazdır
        client.on("error", (error) => {
            console.error(error);
        });

        // Uygulama kapatıldığında MongoDB bağlantısını kapat
        const shutdown = async () => {
            if (isClosing) return;
            isClosing = true;

            console.log("Uygulama kapanıyor, MongoDB bağlantısı kapatılıyor...");

            // MongoDB bağlantısını kapatmadan önce bütün timeout'ları çalıştır
            await Promise.all([...updateTimers.keys()].map(async (key) => {
                clearTimeout(updateTimers.get(key));
                await this.updateGuildOrFile(
                    key,
                    updateCache.get(key),
                    isNaN(key) ? "others" : "guilds",
                    true
                );
            }));

            await client.close(true);
            console.log("MongoDB bağlantısı kapatıldı!");
            process.exit(0);
        };

        // Eğer botun çalıştırıldığı ortam windows ise "SIGINT" değilse "SIGTERM" sinyali alır
        process.on(
            os.platform() == "win32" ? "SIGINT" : "SIGTERM",
            shutdown
        );

        return true;
    }


    /**
     * @async
     * MongoDB sunucusuna bağlanılır
     * @returns {Promise<Boolean>}
     */
    async connect() {
        try {
            await client.connect();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }


    /**
     * @async
     * Yeni bir guild modeli oluşturur ve onu kaydeder
     * @param {String} guildId - Yeni bir guild modeli oluştururken kullanılacak veriler 
     * @returns {Promise<import("../Typedef").GuildDatabaseObject>}
     */

    async createGuildAndSave(guildId) {
        const guildDatas = { id: guildId, ...this.defaultGuildDatabase };
        await this.guilds.insertOne(guildDatas);

        return guildDatas;
    }


    /**
     * @async
     * Database'den bir sunucuyı çeker
     * @param {String} guildId - Çekilecek sunucunun verileri
     * @returns {Promise<import("../Typedef").GuildDatabaseObject>}
     */

    async getGuild(guildId) {
        const cacheGuild = guildCaches.get(guildId);
        if (cacheGuild) return cacheGuild;

        const guild = await this.guilds.findOne({ id: guildId }, {
            projection: {
                _id: 0,
                id: 0
            }
        }) ?? (await this.createGuildAndSave(guildId));
        
        guildCaches.set(guildId, guild);
        return guild;
    }


    /**
     * @async
     * Database'den bir dosyayı çeker
     * @param {String} fileName - Çekilecek dosyanın adı
     * @returns {Promise<Object | Boolean>}
     */
    async getFile(fileName) {
        const cacheFile = otherCaches.get(fileName);
        if (cacheFile) return cacheFile;

        const file = await this.others.findOne(
            {
                id: fileName
            },
            {
                projection: {
                    _id: 0,
                    id: 0
                }
            }
        );
        otherCaches.set(fileName, file);
        return file;
    }


    /**
     * İki mongodb objesini birleştirir
     * @param {String} fileName - Birleştirilecek ilk objenin ismi
     * @param {mongodb.UpdateFilter<mongodb.BSON.Document>} updateObject - Birleştirilecek ikinci obje
     * @returns {void} - Birleştirilmiş obje ilk objenin üzerine yazılır
     */
    combineTwoMongoDBObject(fileName, updateObject) {
        if (!updateCache.has(fileName)) {
            updateCache.set(fileName, { $set: {}, $push: {}, $unset: {}, $inc: {} });
        }

        const cache = updateCache.get(fileName);

        cache.$set ??= {};
        cache.$push ??= {};
        cache.$unset ??= {};
        cache.$inc ??= {};

        // $set işlemlerini birleştir
        if (updateObject.$set) {
            for (const key in updateObject.$set) {
                cache.$set[key] = updateObject.$set[key];

                // Eğer $set işlemi $unset key'lerinin içinde varsa $unset işlemini sil
                for (const cacheKey in cache.$unset) {
                    if (key.startsWith(cacheKey) || cacheKey.startsWith(key)) delete cache.$unset[cacheKey];
                }
            }
        }

        // $push işlemlerini birleştir
        if (updateObject.$push) {
            for (const key in updateObject.$push) {
                cache.$push[key] ??= { $each: [] };

                const pushOrUnshift = updateObject.$push[key].$position == 0 ? "unshift" : "push";
                const eachArray = "$each" in updateObject.$push[key] ? updateObject.$push[key].$each : [updateObject.$push[key]];

                cache.$push[key].$each[pushOrUnshift](...eachArray);
            }
        }

        // $unset işlemlerini birleştir
        if (updateObject.$unset) {
            for (const key in updateObject.$unset) {
                cache.$unset[key] = "";

                // Eğer $unset işlemi $set key'lerinin içinde varsa $set işlemini sil
                for (const cacheKey in cache.$set) {
                    if (key.startsWith(cacheKey) || cacheKey.startsWith(key)) delete cache.$set[cacheKey];
                }
            }
        }

        // $inc işlemlerini birleştir
        if (updateObject.$inc) {
            for (const key in updateObject.$inc) {
                cache.$inc[key] = (cache.$inc[key] ?? 0) + updateObject.$inc[key];
            }
        }
    }

    /**
     * @async
     * Database'deki bir sunucuyu veya dosyayı günceller (Her şeyi kendiniz belirleyebilirsiniz)
     * @param {String} fileId - Güncellenecek sunucunun verileri
     * @param {mongodb.UpdateFilter<mongodb.BSON.Document>} newDatas - Güncellenecek veriler
     * @param {"guilds"|"others"} guildOrFile - Güncellenecek verinin türü
     * @param {Boolean} isInstant - Güncellemenin hemen yapılmasını isteyip istemediğiniz
     * @returns {Promise<Boolean>}
     */
    async updateGuildOrFile(fileId, newDatas, guildOrFile = "guilds", isInstant = false) {
        if (Object.values(newDatas).every((value) => Object.keys(value).length == 0)) {
            return false;
        }

        // Önceki objeyle şimdikini birleştir
        this.combineTwoMongoDBObject(fileId, newDatas);

        // Eğer hemen güncelleme yapılmasını istiyorsa
        if (isInstant) {
            await this[guildOrFile].updateOne({ id: fileId }, updateCache.get(fileId));
            updateCache.delete(fileId);

            // Eğer bir güncelleme varsa onu sil
            if (updateTimers.has(fileId)) {
                clearTimeout(updateTimers.get(fileId));
                updateTimers.delete(fileId);
            }
            return true;
        }

        // Eğer şu anda devam eden bir setTimeout varsa hiçbir şey yapma
        if (updateTimers.has(fileId)) {
            return true;
        }

        // 5 saniye sonra güncelleme yap
        updateTimers.set(fileId, setTimeout(async () => {
            const cache = updateCache.get(fileId);

            // Bütün keylerde dolaş ve boş bir objesi olan keyleri sil
            for (const key in cache) {
                if (Object.keys(cache[key]).length == 0) {
                    delete cache[key];
                }
            }

            // Database'deki sunucuyu güncelle
            try {
                await this[guildOrFile].updateOne({ id: fileId }, cache);
            } catch (error) {
                console.error(error);
                console.error(cache);
            } finally {
                updateCache.delete(fileId);
                updateTimers.delete(fileId);
            }
        }, UPDATE_TIMEOUT));

        return true;
    }


    /**
     * @async
     * Database'deki bir sunucuyı günceller
     * @param {String} guildId - Güncellenecek sunucunın verileri
     * @param {mongodb.UpdateFilter<mongodb.BSON.Document>} newGuildDatas - Güncellenecek veriler
     * @param {Boolean} isInstant - Güncellemenin hemen yapılmasını isteyip istemediğiniz
     * @returns {Promise<Boolean>}
     */

    async updateGuild(guildId, newGuildDatas, isInstant = false) {
        return this.updateGuildOrFile(guildId, newGuildDatas, "guilds", isInstant);
    }

    /**
     * @async
     * Database'deki bir sunucuyı günceller (Her şeyi kendiniz belirleyebilirsiniz)
     * @param {mongodb.Filter<mongodb.BSON.Document>} filter - Güncellenecek sunucunın verileri
     * @param {mongodb.UpdateFilter<mongodb.BSON.Document>} newGuildDatas - Güncellenecek veriler
     * @param {mongodb.UpdateOptions} options - Güncelleme seçenekleri
     * @returns {Promise<Boolean>}
     */
    async updateGuildsWithFilter(filter, newGuildDatas, options) {
        await this.guilds.updateMany(filter, newGuildDatas, options);
        return true;
    }


    /**
     * @async
     * Database'deki bir dosyayı günceller
     * @param {String} fileName - Güncellenecek dosyanın adı
     * @param {mongodb.UpdateFilter<mongodb.BSON.Document>} newFileDatas - Güncellenecek veriler
     * @param {Boolean} isInstant - Güncellemenin hemen yapılmasını isteyip istemediğiniz
     * @returns {Promise<Boolean>}
     */
    async updateFile(fileName, newFileDatas, isInstant = false) {
        return this.updateGuildOrFile(fileName, newFileDatas, "others", isInstant);
    }


    /**
     * @async
     * Databasenin ping değerini döndürür
     * @returns {Promise<Number>}
     */
    async ping() {
        const startTime = Date.now();
        await client.db("Main").command({ ping: 1 });
        return Date.now() - startTime;
    }



    /**
     * @async
     * MongoDB'nin versiyonunu döndürür
     * @returns {Promise<String>}
     */
    async version() {
        return (await client.db("Main").admin().serverInfo()).version;
    }
}

module.exports = new MongoDB();