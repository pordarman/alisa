"use strict";
const {
    EMOJIS,
    rankNumbers,
    shardCount,
    webhookLinks,
    isMainBot
} = require("../settings.json");
const {
    EmbedBuilder,
    Message,
    User,
    GuildMember,
    Client,
    Guild,
    Collection,
    Role,
    GuildChannel,
    Channel,
    WebhookClient,
    BaseInteraction,
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");
const Time = require("./Time");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const path = require("path");
const { default: chalk } = require("chalk");

const maps = {
    /**
     * @type {Map<"tr"|"en", Map<String, String | Object>>}
     * @description Prefix komutlarını saklar
     */
    prefixCommands: new Map(), // Prefix komutları
    /**
     * @type {Map<String, Object>}
     * @description Prefix komutlarının ID'lerini saklar
     */
    prefixCommandIds: new Map(), // Prefix komutlarının ID'leri (Başka bir dosyadan çağıracağımız için ID'leri de önbelleğe alıyoruz böylece ID'ye göre komutu çağırabiliriz)
    /**
     * @type {Map<"tr"|"en", Map<String, String | Object>>}
     * @description Slash komutlarını saklar
     */
    slashCommands: new Map(), // Slash komutları
    /**
     * @type {Map<"tr"|"en", Object>}
     * @description Slash komutlarının ID'lerini saklar
     */
    guildCommandsJSON: new Map(), // Slash JSON komutları (Slash komutlarını sunucuda aktif etmek için json şeklinde olması gerek)
    /**
     * @type {Map<String, String | Object>}
     * @description Buton komutlarını saklar
     */
    buttonCommands: new Map(), // Buton komutları
    /**
     * @type {Map<String, String | Object>}
     * @description ContextMenu komutlarını saklar
     */
    selectMenuCommands: new Map(), // Seçmeli menü komutları
    /**
     * @type {Map<"tr"|"en", Map<String, String | Object>>}
     * @description ContextMenu komutlarını saklar
     */
    interactionCommands: new Map(), // İnteraction komutları
    /**
     * @type {Map<"tr"|"en", Map<String, Array<Object>>>}
     * @description Kategori komutlarını saklar
     */
    categoryCommands: new Map(), // Kategori komutları

    /**
     * @type {Map<String, Object>}
     * @description Kullanıcıların butonla kayıt edilirken komutla kayıt edilmesini engeller
     */
    buttonRegisterMember: new Map(), // Kullanıcıları hem butonla hem de komut kullanarak kayıt etmesini engeller
    /**
     * @type {Map<String, Object>}
     * @description Kullanıcının ismini aynı anda 2 kişinin değiştirmesini engeller
     */
    buttonChangeNameMember: new Map(), // Kullanıcının ismini aynı anda 2 kişinin değiştirmesini engeller

    /**
     * @type {Map<String, { isSee: Boolean, expires: Number }>}
     * @description Kullanıcının aynı komutu tekrar kullanmasını engeller
     */
    prefixCooldown: new Map(), // Bekleme süreleri ile ilgili veriler
    /**
     * @type {Map<String, { isSee: Boolean, expires: Number }>}
     * @description Aynı kanalda komutların çok hızlı kullanılmasını engeller
     */
    channelCooldown: new Map(), // Kanalın bekleme süresi

    registerOptions: new Set(), // Kaç sunucunun kayıt tipinin "Üyeli kayıt" olduğunu gösterir

    mutedMembers: new Map(), // Kullanıcıların mute bilgilerini saklar
    jailedMembers: new Map(), // Kullanıcıların jail mute bilgilerini saklar

    guildPremiums: new Map() // Sunucu premium bilgilerini saklar
};

const rest = new REST();

// Rank sayılarına göre rankları önbelleğe kaydet
const languageObject = new Map();
for (const language in EMOJIS.allRanks) {
    const allRanks = EMOJIS.allRanks[language];

    const rankMaps = new Map()
    for (let i = 0; i < allRanks.length; i++) {
        rankMaps.set(rankNumbers[i], EMOJIS.allRanks[i]);
    }

    languageObject.set(language, rankMaps);
}

const allWebhooks = {};
for (const url in webhookLinks) {
    let webhook;

    try {
        if (!isMainBot) throw "";
        webhook = new WebhookClient({
            url: webhookLinks[url]
        });
    } catch (_) {
        webhook = {
            send() { }
        }
    }
    allWebhooks[url] = webhook;
}

/**
 * @typedef {Object} interactionToMessageExtra
 * @property {Message} message
 * @property {import("../Typedef").ExportsRunCommands} main
 * @property {{ role: Role, channel: GuildChannel, member: GuildMember, user: User }} mentions
 */



/**
 * @typedef {Object} WebHooksObject
 * @property {WebhookClient} error
 * @property {WebhookClient} shard
 * @property {WebhookClient} ready
 * @property {WebhookClient} guildCreate
 * @property {WebhookClient} guildDelete
 * @property {WebhookClient} reportBug
 * @property {WebhookClient} suggestion
 */

// Bazı işlevsel fonksiyonları burada tutuyoruz ki hem düzenlemesi hem de bulunması kolay olsun
class Util {

    get maps() {
        return maps;
    }

    get console() {
        return {
            /**
             * Log mesajı gönderir (Örnek: [2023-10-01 12:00:00] Log mesajı)
             * @param {String} message 
             * @returns 
             */
            log: (message) => console.log(chalk.hex("#00FFFF")(`[${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}] ${message}`)),

            /**
             * Yeşil bir başarılı mesajı gönderir (Örnek: [INFO] Başarılı log mesajı)
             * @param {String} message 
             * @returns 
             */
            success: (message) => console.log(chalk.green(`[INFO] ${message}`)),

            /**
             * Pembe ile kırmızı arasında bir shard bilgi mesajı gönderir (Örnek: [Shard] #0 ID'li shard başlatıldı)
             * @param {String} message
             * @returns
             */
            shard: (message) => console.log(chalk.hex("#ca097a")(`[SHARD] ${message}`)),

            /**
             * Kırmızı bir hata mesajı gönderir (Örnek: [ERROR] Hata log mesajı)
             * @param {String} message 
             * @returns 
             */
            error: (message) => console.error(chalk.red(`[ERROR] ${message}`)),

            /**
             * Turuncu bir uyarı mesajı gönderir (Örnek: [WARN] Uyarı log mesajı)
             * @param {String} message 
             * @returns 
             */
            warn: (message) => console.warn(chalk.hex("#FFA500")(`[WARN] ${message}`)),
        }
    }


    /**
     * Rest objesinin tokenini ayarlar
     * @param {String} token 
     */
    setRestToken(token) {
        rest.setToken(token);
    }


    /**
     * Botun komutlarını sunucuya yükler
     * @param {String} clientId 
     * @param {String} guildId 
     * @param {Array} commands 
     */
    setGuildCommands(clientId, guildId, commands) {
        rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            {
                body: commands
            }
        ).catch((error) => {
            if (error.code == RESTJSONErrorCodes.MissingAccess) return;
            console.error(error);
        });
    }


    /**
     * Parametredeki intraction parametresini message parametresine çevirir ve ekstra parametreleri ekler
     * @param {import("../Typedef").ExportsRunSlash | import("../Typedef").ExportsRunButtons | import("../Typedef").ExportsRunContextMenu | import("../Typedef").ExportsRunStringSelectMenu} params - Dönüştürülecek parametre
     * @param {interactionToMessageExtra} options - Parametreye eklenecek ekstra parametreler
     * @returns {void} 
     */
    interactionToMessage(params, { message, main, mentions } = {}) {
        // Eğer message, main, mentions objesi yoksa oluştur
        if (!message) message = {};
        if (!main) main = {};
        if (!mentions) mentions = {};

        // int objesini msg objesine çevir ve sil
        params.msg = params.int;
        delete params.int;

        // msg.author'u msg.user yap ve sil
        params.msg.author = params.msg.user;
        delete params.msg.user;

        // msg objesine mentions.users, mentions.members, mentions.roles ve mentions.channels ekle
        params.msg.mentions = {};
        const mentionsEntries = [["users", "user"], ["members", "member"], ["roles", "role"], ["channels", "channel"]];
        for (const [key, value] of mentionsEntries) {
            params.msg.mentions[key] = {
                first() {
                    return mentions[value];
                }
            }
        }

        // Eğer main objesinde "args: []" ifadesi yoksa ekle ve parametreleri main objesine ekle
        if (!("args" in main)) main.args = [];
        for (const key in main) {
            params[key] = main[key];
        }

        // Eğer "args" parametresinin içinde undefined, null veya boş bir string varsa sil
        params.args = params.args.filter(arg => arg);

        // Eğer message objesinde "content: ''" ifadesi yoksa ekle ve parametreleri message objesine ekle
        if (!("content" in message)) message.content = "";
        for (const key in message) {
            params.msg[key] = message[key];
        }

        // Varsayılan ve değiştirilemeyen parametreleri ekle
        params.prefix = params.guildDatabase.prefix;
        params.msgMember = params.msg.member;
        params.guildMe = params.msg.guild.members.me;
        params.guildMePermissions = params.guildMe.permissions;
    }


    /**
     * Varsayılan verileri döndürür
     */
    get DEFAULTS() {
        return {
            registerAuthData: {
                countables: {
                    girl: 0,
                    boy: 0,
                    member: 0,
                    bot: 0,
                    total: 0
                }
            },
            guildRegisterData: {
                boy: 0,
                girl: 0,
                member: 0,
                bot: 0,
                total: 0
            },
            memberStat: {
                voice: {},
                currVoice: {},
                messages: {},
                totals: {
                    voice: 0,
                    message: 0
                }
            },
            memberVoiceStat: {
                total: 0,
                datas: []
            },
        }
    }

    /**
     * Bütün webhookların toplandığı yer
     * @returns {WebHooksObject}
     */
    get webhooks() {
        return allWebhooks
    }


    /**
     * Özel isimleri ve özel giriş mesajlarını düzenler
     */
    get customMessages() {
        const that = this;
        return {

            registerName({
                message,
                name,
                guildDatabase,
                age,
                isBot,
                isNameInput = true,
                defaultObject = {}
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = element.slice(1, -1).toLocaleLowerCase(guildDatabase.language);
                    switch (keyName) {
                        case "tag":
                            return guildDatabase.register.tag || defaultObject.tag || "";

                        case "isim":
                        case "name":
                            return isBot || !isNameInput ? name : that.registerCase(name, guildDatabase, defaultObject);

                        case "yaş":
                        case "yas":
                        case "age":
                            return isBot ? element : age ?? "";

                        default:
                            return element;
                    }
                }).trim();
            },

            unregisterName({
                message,
                guildDatabase,
                name,
                defaultObject = {}
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = element.slice(1, -1).toLocaleLowerCase(guildDatabase.language);
                    switch (keyName) {
                        case "tag":
                            return guildDatabase.register.tag || defaultObject.tag || "";

                        case "isim":
                        case "name":
                            return name;

                        default:
                            return element;
                    }
                }).trim()
            },

            afterRegisterMessage({
                message,
                language,
                memberId,
                recreateMemberName,
                givenRolesString,
                memberCount,
                authorId,
                recreateAuthorName,
                guildTag,
                toHumanizeRegisterCount
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = that.removeTurkishChars(
                        element.slice(1, -1).toLocaleLowerCase(language)
                    ).replace(/[^a-z0-9]/g, ""); // Bütün harf olmayan verileri kaldır
                    switch (keyName) {
                        case "uye":
                        case "member":
                            return `<@${memberId}>`;

                        case "uyeisim":
                        case "membername":
                            return recreateMemberName;

                        case "uyeid":
                        case "memberid":
                            return memberId;

                        case "rol":
                        case "role":
                            return givenRolesString;

                        case "total":
                        case "toplam":
                            return that.toHumanize(memberCount, language);

                        case "emojitotal":
                        case "emojitoplam":
                            return that.stringToEmojis(memberCount);

                        case "yetkili":
                        case "auth":
                        case "registerauth":
                            return `<@${authorId}>`;

                        case "yetkiliisim":
                        case "authname":
                            return recreateAuthorName;

                        case "yetkiliid":
                        case "authid":
                            return authorId;

                        case "tag":
                        case "tags":
                            return guildTag || {
                                tr: "**TAG YOK**",
                                en: "**NO TAG**"
                            }[language];

                        case "kayittoplam":
                        case "registercount":
                            return toHumanizeRegisterCount;

                        default:
                            return element;
                    }
                });
            },

            guildAddMessage({
                message,
                language,
                guildName,
                userId,
                recreateName,
                toHumanize,
                authRoleString,
                createdTimestampSecond,
                createdTimestamp,
                security
            }) {
                return message.replace(/<[^>]+>/g, (element) => {
                    const keyName = that.removeTurkishChars(
                        element.slice(1, -1).toLocaleLowerCase(language)
                    ).replace(/[^a-z0-9]/g, "") // Bütün harf olmayan verileri kaldır
                    switch (keyName) {
                        case "sunucuadi":
                        case "guildname":
                            return guildName;

                        case "uye":
                        case "member":
                            return `<@${userId}>`;

                        case "uyeisim":
                        case "membername":
                            return recreateName;

                        case "uyeid":
                        case "memberid":
                        case "userid":
                            return userId;

                        case "toplam":
                        case "total":
                            return toHumanize;

                        case "emojitoplam":
                        case "emojitotal":
                            return that.stringToEmojis(toHumanize);

                        case "rol":
                        case "role":
                            return authRoleString;

                        case "tarih":
                        case "date":
                            return `<t:${createdTimestampSecond}:F>`;

                        case "tarih2":
                        case "date2":
                            return `<t:${createdTimestampSecond}:R>`;

                        case "tarih3":
                        case "date3":
                            return Time.toDateString(createdTimestamp, language);

                        case "security":
                        case "guvenlik":
                            return security;

                        default:
                            return element;
                    }

                }).trim()
            }

        }
    }

    /**
     * Bütün RegExp ifadelerini gösterir
     */
    get regex() {
        return {
            fetchAge: /(?<=(\s|(?<!.)))[1-9](\d)?(?!\S)/,
            fetchURL: /(https?:\/\/(www\.)?|www\.)[\w\-_]+\.[\w\-_]+(\/?[\w\-_@.%]+)*(\?[\w\-_=&@.%]+)?\/?/i
        }
    }


    /**
     * Bütün maximum değerleri döndürür (mesela en fazla kaç rol etiketleyebilirsin, mesaj en fazla kaç karakterli olacak vs.)
     */
    get MAX() {
        return {
            usernameLength: 32,
            mentionRoleForRegister: 10,
            mentionRoleForAuthorized: 250,
            showRoleInInfo: 30,
            customMessageLength: {
                embed: 4000,
                message: 1750
            },
            symbolLength: 5,
            tagLength: 10,
            errorForSetup: 10,
            messageDeleteCount: 1000,
            discordDeleteCount: 100,
            contentForSnipe: 1000,
            membersForSid: 40,
        }
    }

    /**
     * Girilen cinsiyeti emojiye dönüştürür
     * @param {"boy" | "girl" | "member" | "bot"} text 
     * @returns {String}
     */
    textToEmoji(text) {
        return {
            boy: EMOJIS.boy,
            girl: EMOJIS.girl,
            member: EMOJIS.member,
            bot: EMOJIS.bot,
        }[text] ?? "❓";
    }


    /**
     * Girilen durumu emojiye dönüştürür
     * @param {"online" | "idle" | "dnd" | "offline" | "invisible"} text 
     * @returns {String}
     */
    statusToEmoji(text) {
        return {
            online: EMOJIS.online,
            idle: EMOJIS.idle,
            dnd: EMOJIS.dnd,
            offline: EMOJIS.offline,
        }[text] ?? "❓";
    }


    /**
     * Girilen string değeri boş bir string değeri ise varsayılan string değerini döndürür
     * @param {String} [string] 
     * @param {"tr" | "en"} language
     * @returns {String} 
     */
    stringOr(string, language = "tr") {
        return string || require("./Localizations/Index.js")[language].others.nothingThere;
    }


    /**
     * Girilen string değerindeki bütün türkçe karakterlerini kaldırır
     * @param {String} string 
     * @returns {String}
     */
    removeTurkishChars(string) {
        const turkishToEnglishObject = {
            ç: "c",
            ş: "s",
            ü: "u",
            ı: "i",
            ö: "o",
            ğ: "g"
        }
        return string.replace(/[çşüöğı]/g, (match) => turkishToEnglishObject[match]);
    }


    /**
     * Dizideki veya stringdeki karakterlerden birini rastgele seçer
     * @param {Array | String} value - Dizideki veya stringdeki karakterlerden birini rastgele seçer
     * @returns {any}
     */
    random(value) {
        return value[Math.floor(Math.random() * value.length)];
    }

    /**
     * Girilen milisaniye cinsinden zamanı saniyeye çevirir
     * @param {Number} ms 
     * @returns {Number}
     */
    msToSecond(ms) {
        return Math.round(ms / 1000);
    }


    /**
     * Komut ismiyle eşleşen komutu döndürür
     * @param {Map<String,String | Object>} commandList 
     * @param {String} commandName
     * @returns {Object | undefined} 
     */
    getCommand(commandList, commandName) {
        const command = commandList.get(commandName);
        if (!command) return;

        return typeof command == "string" ? commandList.get(command) : command;
    }


    /**
     * Girilen değerin Message sınıfından olup olmadığını kontrol eder
     * @param {any} message
     * @returns {Boolean}
     */
    isMessage(message) {
        return message instanceof Message;
    }


    /**
     * Sunucudaki silinen rol ve kanalları kontrol eder eğer silinen kanal varsa döndürür
     * @param {Guild} guild 
     * @param {import("../Typedef").GuildDatabaseObject} guildDatabase 
     * @returns {{deletedRoleAndChannels: Array<String>, changedGuildData: Object}}
     */
    checkGuildData(guild, guildDatabase) {
        try {
            // Sunucunun verilerini kontrol et ve eğer bazı roller veya kanallar silinmişse databaseden verileri sil ve sunucu sahibine bilgilendirme mesajı gönder
            let {
                register: {
                    roleIds: {
                        boy: boyRoleIds,
                        girl: girlRoleIds,
                        member: memberRoleIds,
                        bot: botRoleIds,
                        registerAuth: registerAuthRoleId,
                        unregister: unregisterRoleId,
                    },
                    channelIds: {
                        register: registerChannelId,
                        afterRegister: afterRegisterChannelId,
                        log: logChannelId,
                    },
                    rankRoles
                },
                moderation: {
                    roleIds: {
                        banAuth: banAuthRoleId,
                        kickAuth: kickAuthRoleId,
                        muteAuth: muteAuthRoleId,
                    },
                    channelIds: {
                        modLog: modLogChannelId,
                    }
                },
                jail: {
                    roleId: jailRoleId,
                    authRoleId: jailAuthRoleId,
                    logChannelId: jailLogChannelId,
                },
                roleIds: {
                    vip: vipRoleId,
                    vipAuth: vipAuthRoleId
                },
                channelIds: {
                    voice: voiceChannelId,
                },
                suspicious: {
                    roleId: suspiciousRoleId
                },
                premium: {
                    authorizedRoleIds,
                    partnerRoleId
                },
                language
            } = guildDatabase;

            // Dizide gösterilecek mesajların hangi dilde olduğunu çek
            const allInfoMessages = require("./Localizations/Index.js")[language].others.rolesAndChannels;

            // Silinen verileri bir diziye aktar
            const deletedRoleAndChannels = [];
            const changedGuildData = {
                $set: {},
                $unset: {}
            };

            // Sunucunun ses kanalı silinmiş mi kontrol et
            if (voiceChannelId && !guild.channels.cache.has(voiceChannelId)) {
                guildDatabase.channelIds.voice = changedGuildData.$set["channelIds.voice"] = "";

                deletedRoleAndChannels.push(allInfoMessages.voice);
            }

            const rolesCache = guild.roles.cache;

            // Kayıtsız rolü silinmiş mi kontrol et
            if (unregisterRoleId && !rolesCache.has(unregisterRoleId)) {
                guildDatabase.register.roleIds.unregister = changedGuildData.$set["register.roleIds.unregister"] = "";

                deletedRoleAndChannels.push(allInfoMessages.unregister);
            }

            // Yetkili rolü silinmiş mi kontrol et
            if (registerAuthRoleId && !rolesCache.has(registerAuthRoleId)) {
                guildDatabase.register.roleIds.registerAuth = "";
                changedGuildData.$set["register.roleIds.registerAuth"] = "";

                deletedRoleAndChannels.push(allInfoMessages.registerAuth);
            }

            // Erkek rolleri silinmiş mi kontrol et
            const newBoyRoles = boyRoleIds.filter(roleId => rolesCache.has(roleId));
            if (boyRoleIds.length != newBoyRoles.length) {
                guildDatabase.register.roleIds.boy = changedGuildData.$set["register.roleIds.boy"] = newBoyRoles;

                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newBoyRoles.length == 0 ?
                        allInfoMessages.boy.all :
                        // Eğer bazıları silinmişse
                        allInfoMessages.boy.some
                );
            }


            // Kız rolleri silinmiş mi kontrol et
            const newGirlRoles = girlRoleIds.filter(roleId => rolesCache.has(roleId));
            if (girlRoleIds.length != newGirlRoles.length) {
                guildDatabase.register.roleIds.girl = changedGuildData.$set["register.roleIds.girl"] = newGirlRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newGirlRoles.length == 0 ?
                        allInfoMessages.girl.all :
                        // Eğer bazıları silinmişse
                        allInfoMessages.girl.some
                );
            }

            // Üye rolleri silinmiş mi kontrol et
            const newMemberRoles = memberRoleIds.filter(roleId => rolesCache.has(roleId));
            if (memberRoleIds.length != newMemberRoles.length) {
                guildDatabase.register.roleIds.member = changedGuildData.$set["register.roleIds.member"] = newMemberRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newMemberRoles.length == 0 ?
                        allInfoMessages.member.all :
                        // Eğer bazıları silinmişse
                        allInfoMessages.member.some
                );
            }

            // Bot rolleri silinmiş mi kontrol et
            const newBotRoles = botRoleIds.filter(roleId => rolesCache.has(roleId));
            if (botRoleIds.length != newBotRoles.length) {
                guildDatabase.register.roleIds.bot = changedGuildData.$set["register.roleIds.bot"] = newBotRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newBotRoles.length == 0 ?
                        allInfoMessages.bot.all :
                        // Eğer bazıları silinmişse
                        allInfoMessages.bot.some
                );
            }

            // Şüpheli rolü silinmiş mi kontrol et
            if (suspiciousRoleId && !rolesCache.has(suspiciousRoleId)) {
                guildDatabase.suspicious.roleId = changedGuildData.$set["suspicious.roleId"] = "";
                deletedRoleAndChannels.push(allInfoMessages.suspicious);
            }


            // Kayıt kanalı silinmiş mi kontrol et
            if (registerChannelId && !guild.channels.cache.has(registerChannelId)) {
                guildDatabase.register.channelIds.register = changedGuildData.$set["register.channelIds.register"] = "";
                deletedRoleAndChannels.push(allInfoMessages.registerChannel);
            }

            // Kayıt sonrası kanal silinmiş mi kontrol et
            if (afterRegisterChannelId && !guild.channels.cache.has(afterRegisterChannelId)) {
                guildDatabase.register.channelIds.afterRegister = changedGuildData.$set["register.channelIds.afterRegister"] = "";
                deletedRoleAndChannels.push(allInfoMessages.afterRegisterChannel);
            }

            // Kayıt log kanalı silinmiş mi kontrol et
            if (logChannelId && !guild.channels.cache.has(logChannelId)) {
                guildDatabase.register.channelIds.log = changedGuildData.$set["register.channelIds.log"] = "";
                deletedRoleAndChannels.push(allInfoMessages.registerLogChannel);
            }

            // Moderasyon log kanalı silinmiş mi kontrol et
            if (modLogChannelId && !guild.channels.cache.has(modLogChannelId)) {
                guildDatabase.moderation.channelIds.modLog = changedGuildData.$set["moderation.channelIds.modLog"] = "";
                deletedRoleAndChannels.push(allInfoMessages.moderationLogChannel);
            }

            // Jail rolü silinmiş mi kontrol et
            if (jailRoleId && !rolesCache.has(jailRoleId)) {
                guildDatabase.jail.roleId = changedGuildData.$set["jail.roleId"] = "";
                deletedRoleAndChannels.push(allInfoMessages.jailRole);
            }

            // Jail yetkili rolü silinmiş mi kontrol et
            if (jailAuthRoleId && !rolesCache.has(jailAuthRoleId)) {
                guildDatabase.jail.authRoleId = changedGuildData.$set["jail.authRoleId"] = "";
                deletedRoleAndChannels.push(allInfoMessages.jailAuthRole);
            }

            // Jail log kanalı silinmiş mi kontrol et
            if (jailLogChannelId && !guild.channels.cache.has(jailLogChannelId)) {
                guildDatabase.jail.logChannelId = changedGuildData.$set["jail.logChannelId"] = "";
                deletedRoleAndChannels.push(allInfoMessages.jailLogChannel);
            }

            // Vip rolü silinmiş mi kontrol et
            if (vipRoleId && !rolesCache.has(vipRoleId)) {
                guildDatabase.roleIds.vip = changedGuildData.$set["roleIds.vip"] = "";
                deletedRoleAndChannels.push(allInfoMessages.vipRole);
            }

            // Vip yetkili rolü silinmiş mi kontrol et
            if (vipAuthRoleId && !rolesCache.has(vipAuthRoleId)) {
                guildDatabase.roleIds.vipAuth = changedGuildData.$set["roleIds.vipAuth"] = "";
                deletedRoleAndChannels.push(allInfoMessages.vipAuthRole);
            }


            // Ban yetkili rolü silinmiş mi kontrol et
            if (banAuthRoleId && !rolesCache.has(banAuthRoleId)) {
                guildDatabase.moderation.roleIds.banAuth = changedGuildData.$set["moderation.roleIds.banAuth"] = "";
                deletedRoleAndChannels.push(allInfoMessages.banAuthRole);
            }

            // Kick yetkili rolü silinmiş mi kontrol et
            if (kickAuthRoleId && !rolesCache.has(kickAuthRoleId)) {
                guildDatabase.moderation.roleIds.kickAuth = changedGuildData.$set["moderation.roleIds.kickAuth"] = "";
                deletedRoleAndChannels.push(allInfoMessages.kickAuthRole);
            }

            // Mute yetkili rolü silinmiş mi kontrol et
            if (muteAuthRoleId && !rolesCache.has(muteAuthRoleId)) {
                guildDatabase.moderation.roleIds.muteAuth = changedGuildData.$set["moderation.roleIds.muteAuth"] = "";
                deletedRoleAndChannels.push(allInfoMessages.muteAuthRole);
            }

            // Yetkili rolleri silinmiş mi kontrol et
            const newAuthRoles = authorizedRoleIds.filter(roleId => rolesCache.has(roleId));
            if (authorizedRoleIds.length != newAuthRoles.length) {
                guildDatabase.premium.authorizedRoleIds = changedGuildData.$set["premium.authorizedRoleIds"] = newAuthRoles;
                deletedRoleAndChannels.push(
                    // Eğer bütün roller silinmişse
                    newAuthRoles.length == 0 ?
                        allInfoMessages.registerAuth.all :
                        // Eğer bazıları silinmişse
                        allInfoMessages.registerAuth.some
                );
            }

            // Partner yetkili rolü silinmiş mi kontrol et
            if (partnerRoleId && !rolesCache.has(partnerRoleId)) {
                guildDatabase.premium.partnerRoleId = changedGuildData.$set["premium.partnerRoleId"] = "";
                deletedRoleAndChannels.push(allInfoMessages.partner);
            };

            // Kayıt rankı rolleri silinmiş mi kontrol et
            for (const rankCount in rankRoles) {
                if (!rolesCache.has(rankRoles[rankCount])) {
                    delete rankRoles[rankCount];
                    changedGuildData.$set[`register.rankRoles.${rankCount}`];
                    deletedRoleAndChannels.push(allInfoMessages.thRankRole(rankCount));
                }
            }

            // Silinen kontrol et
            return {
                deletedRoleAndChannels,
                changedGuildData
            };
        } catch (error) {
            console.error(error);

            return {
                deletedRoleAndChannels: [],
                changedGuildData: {}
            }
        }
    }


    /**
       * Bazı embedler için biz hazır önayar yaparız
       * Mesela hata embed'i yapmak için her seferinde başlığı "Hata" yapmak yerine hazır yaparız ki hem tekrardan düzenlemesinde kolaylık olur
       * hem de hata oranı azalır
       * @param {Message | BaseInteraction} msgOrInteraction
       * @param {{ errorTitle: String, memberPermissionError: (content) => String, botPermissionError: (content) => String, warn: String, success: String }} errorEmbedMessages
       * @returns {(messageContent: String, type: "error" | "memberPermissionError" | "botPermissionError" | "warn" | "success", cooldown: Number, { fields: ({ name: String, value: String, inline?: Boolean })[], image?: String }) => Promise<Message>}
       */
    errorEmbed(msgOrInteraction, errorEmbedMessages) {
        const that = this;

        return function (messageContent, type = "error", cooldown = 15000, { fields, image = null } = {}) {
            const embed = new EmbedBuilder()
                .setTimestamp();

            if (fields) embed.addFields(...fields)
            if (image) embed.setImage(image)

            const {
                errorTitle,
                memberPermissionError,
                botPermissionError,
                warn,
                success
            } = errorEmbedMessages;

            switch (type) {
                case "memberPermissionError": {
                    embed
                        .setTitle(errorTitle)
                        .setDescription(
                            memberPermissionError(messageContent)
                        )
                        .setColor("Red")
                }
                    break;

                case "botPermissionError": {
                    embed
                        .setTitle(errorTitle)
                        .setDescription(
                            botPermissionError(messageContent)
                        )
                        .setColor("Red")
                }
                    break;

                case "error": {
                    embed
                        .setTitle(errorTitle)
                        .setDescription(messageContent.startsWith("•") ? messageContent : `• ${messageContent}`)
                        .setColor("Red");
                }
                    break;

                case "warn": {
                    embed
                        .setTitle(warn)
                        .setDescription(messageContent)
                        .setColor("Orange");
                }
                    break;

                case "success": {
                    const splitString = messageContent.split("\n");

                    messageContent = splitString.length > 1 ?
                        `${splitString[0]} ${EMOJIS.yes}\n${splitString.slice(1).join("\n")}` :
                        `${messageContent} ${EMOJIS.yes}`;

                    embed
                        .setTitle(success)
                        .setDescription(messageContent)
                        .setColor("Green");

                    return msgOrInteraction.reply({
                        embeds: [
                            embed
                        ]
                    });
                }

                default:
                    throw new TypeError(`Bilinmeyen bir tip girişi! - ${type}`);
            }

            // Eğer mesaj tipi message ise mesajı gönder ve belirli bir süre sonra sil
            if (msgOrInteraction instanceof Message) {
                return that.waitAndDeleteMessage(
                    msgOrInteraction.reply({
                        embeds: [
                            embed
                        ]
                    }),
                    cooldown
                );
            } else {
                return msgOrInteraction.reply({
                    embeds: [
                        embed
                    ],
                    flags: MessageFlags.Ephemeral
                }).catch(() => { });
            }
        }

    };


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya aitse bu fonksiyonu kullan
     * @param {Client} client
     * @param {String} userId 
     * @returns {Promise<User | null>}
     */
    async fetchUserForce(client, userId) {
        // Bütün shardlarda kullanıcıyı kontrol et
        const findUserWithShard = await client.shard.broadcastEval(
            (clientParam, userIdParam) => clientParam.users.cache.get(userIdParam),
            {
                context: userId
            }
        );
        const user = findUserWithShard.find((user) => !!user);

        // Eğer kullanıcı diğer shardlarda bulunduysa kullanıcı döndür
        if (user) return new User(client, user);

        // Eğer kullanıcı bulunamadıysa fetch metodunu kullanarak kullanıyı döndür
        return await client.users.fetch(userId).catch(() => null);
    }


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya ait değilse bu fonksiyonu kullan
     * @param {Client} client
     * @param {String} content 
     * @returns {Promise<User | undefined | null>}
     */
    async fetchUser(client, content) {
        // Eğer girilen değer bir string değilse undefined döndür
        if (typeof content != "string") return undefined;

        const userId = content.match(/\d{17,20}/);

        // Eğer ID bulunamadıysa undefined döndür
        if (!userId) return undefined;

        return await this.fetchUserForce(client, userId[0]) || null;
    }


    /**
     * Girilen sunucudaki bütün üyeleri döndürür
     * @param {Guild} guild 
     * @returns {Promise<Collection<String, GuildMember>>}
     */
    async getMembers(guild) {
        const cache = guild.members.cache;
        return guild.memberCount == cache.size ?
            cache :
            await guild.members.fetch().catch(() => new Collection());
    }

    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya aitse bu fonksiyonu kullan
     * @param {Guild} guild 
     * @param {String} userId 
     * @returns {Promise<GuildMember | undefined>}
     */
    async fetchMemberForce(guild, userId) {
        const allMembers = await this.getMembers(guild);
        return allMembers.get(userId);
    }


    /**
     * Eğer girilen ID kesinlikle bir kullanıcıya ait değilse bu fonksiyonu kullan
     * @param {Guild} guild 
     * @param {String} content 
     * @returns {Promise<GuildMember | undefined | null>}
     */
    async fetchMember(guild, content) {
        // Eğer girilen değer bir string değilse undefined döndür
        if (typeof content != "string") return undefined;

        const memberId = content.match(/\d{17,20}/);

        // Eğer ID bulunamadıysa undefined döndür
        if (!memberId) return undefined;

        return await this.fetchMemberForce(guild, memberId[0]) || null;
    };


    /**
     * Sunucunun shardını döndürür
     * @param {String} guildId 
     * @returns {Number}
     */
    shardId(guildId) {
        return Number(BigInt(guildId.match(/\d+/)?.[0] || 0) >> 22n) % shardCount;
    }


    /**
     * Mesajda yazılan ilk rolü çeker
     * @param {Message} message 
     * @returns {Role | undefined}
     */
    fetchRole(message) {
        // Eğer rolü etiketlemişse rolü döndür
        const role = message.mentions.roles.first();
        if (role) return role;

        const matchId = message.content.match(/\d{17,20}/);
        return matchId ?
            message.guild.roles.cache.get(matchId[0]) :
            undefined;
    };


    /**
     * Mesajda yazılan bütün rolleri çeker
     * @param {Message} message 
     * @returns {Collection<String, Role>}
     */
    fetchRoles(message) {
        const rolesMap = new Collection();

        // Mesajdaki rol ID'lerini çek
        const roleIds = message.content.match(/\d{17,20}/g);

        // Eğer hiç rol ID'si girilmemişse
        if (!roleIds) return rolesMap;

        for (let i = 0; i < roleIds.length; i++) {
            const roleId = roleIds[i];
            const role = message.guild.roles.cache.get(roleId);

            // Eğer rol yoksa döngüyü geç
            if (!role) continue;

            rolesMap.set(roleId, role);
        }
        return rolesMap;
    };

    /**
     * Mesajda yazılan ilk kanalı çeker
     * @param {Message} message 
     * @returns {Channel | undefined}
     */
    fetchChannel(message) {
        // Eğer kanalı etiketlemişse rolü döndür
        const channel = message.mentions.channels.first();
        if (channel) return channel;

        const matchId = message.content.match(/\d{17,20}/);
        return matchId ?
            message.guild.channels.cache.get(matchId[0]) :
            undefined;
    };


    /**
     * Mesajda yazılan bütün kanalları çeker
     * @param {Message} message 
     * @returns {Collection<String, GuildChannel>}
     */
    fetchChannels(message) {
        const channelsMap = new Collection();

        // Mesajdaki kanal ID'lerini çek
        const channelIds = message.content.match(/\d{17,20}/g);

        // Eğer hiç kanal ID'si girilmemişse
        if (!channelIds) return channelsMap;

        for (let i = 0; i < channelIds.length; i++) {
            const channelId = channelIds[i];
            const channel = message.guild.channels.cache.get(channelId);

            // Eğer kanal yoksa döngüyü geç
            if (!channel) continue;

            channelsMap.set(channelId, channel);
        }
        return channelsMap;
    };


    /**
     * Bot rolünü veya en yüksek rolü döndürür
     * @param {GuildMember} member 
     * @returns {Role}
     */
    getBotOrHighestRole(member) {
        let highestRole = member.guild.roles.everyone;
        const roles = member["_roles"];

        // Bütün rollerde gez ve en yüksek rolü bul
        for (let i = 0; i < roles.length; i++) {
            const role = member.guild.roles.cache.get(roles[i]);
            if (!role) continue;

            // Eğer rol bot rolüyse direkt döndür
            if (role.managed) return role;

            if (role.position > highestRole.position) {
                highestRole = role;
            }
        };

        return highestRole;
    }


    /**
     * Girilen ID'deki sunucunun ismini döndürür
     * @param {Client} client 
     * @param {String} guildId 
     * @param {"tr" | "en"} language
     * @param {Boolean} convertDiscordFormat - Eğer değer true ise Discord formatına dönüştürür (**{guildId}** ID'ye sahip)
     * @returns {Promise<String | undefined>}
     */
    async getGuildNameOrId(client, guildId, language = "tr", convertDiscordFormat = true) {
        const allLanguages = {
            tr(guildId) {
                return `**${guildId}** ID'ye sahip`;
            },
            en(guildId) {
                return `Server with ID **${guildId}**`;
            },
        }
        const guild = await client.shard.broadcastEval(
            (clientParam, guildIdParam) => clientParam.guilds.cache.get(guildIdParam),
            {
                context: guildId,
                shard: this.shardId(guildId)
            }
        );
        if (guild) return convertDiscordFormat ? `**${guild.name}**` : guild.name;
        return convertDiscordFormat ? allLanguages[language](guildId) : undefined;
    };


    /**
     * Eğer botun kodlarında bir hata varsa belirtilen kanala mesaj atar
     * @param {Error} error 
     * @param {String} dirname 
     * @param {Message | BaseInteraction} message
     * @returns {Promise<void>}
     */
    async error(error, dirname, message) {
        console.error(error);

        const author = message.user || message.author;

        this.webhooks.error.send(
            `**${dirname.split(`${path.sep}Commands${path.sep}`)[1]}** adlı komut dosyamda bir hata oluştu!\n` +
            `\`\`\`js\n` +
            `${error}\`\`\`\n` +
            `• **Hatayı bulan kullanıcı:** ${this.escapeMarkdown(author.tag)} - ${author.id}\n` +
            `• **Sunucu:** ${this.escapeMarkdown(message.guild.name)} - ${message.guild.id}\n` +
            `• **Kanal:** ${this.escapeMarkdown(message.channel.name)} - ${message.channel.id}` +
            (message instanceof Message ? `\n• **Mesaj:** ${message.content}` : "")
        );
    };


    /**
     * Girilen ID'deki sunucuyu döndürür. **Fakat döndürülen veriyi JSON olarak döndürür, yani hiçbir kanala mesaj atamaz ve üyeleri görüntüleyemezsiniz!**
     * @param {Client} client 
     * @param {String} guildId 
     * @returns {Promise<Object>}
     */
    async getGuild(client, guildId) {
        return await client.shard.broadcastEval(
            (clientParam, guildIdParam) => clientParam.guilds.cache.get(guildIdParam),
            {
                context: guildId,
                shard: this.shardId(guildId)
            }
        );
    };



    /**
     * İlk girilen map'teki verileri ikinci girilen map'ten çıkarır ve sonucu döndürür
     * @param {Array<String> | Collection<String,Role>} roles
     * @param {Array<String> | Collection<String,Role>} exceptRoles 
     * @returns {Array<String>}
     */
    getRolesExceptInputRoles(roles, exceptRoles) {
        if (!Array.isArray(roles)) roles = [...roles.keys()];
        if (!Array.isArray(exceptRoles)) exceptRoles = [...exceptRoles.keys()];

        const exceptRolesSet = new Set(exceptRoles);
        return roles.filter(role => !exceptRolesSet.has(role));
    }



    /**
     * Kullanıcının rollerini girilen rollerle değiştirir (Bu fonksiyon çıkartılamayan rolleri çıkartmaz)
     * @param {Collection<String,Role>} roles
     * @param {Array<String> | Collection<String,Role>} inputRoles 
     * @returns {Array<String>}
     */
    setMemberRolesWithInputRoles(roles, inputRoles) {
        if (!Array.isArray(inputRoles)) inputRoles = [...inputRoles.keys()];

        // Bütün rollerde gez ve girilen rolleri diziye ekle
        const result = new Set(inputRoles);
        for (const [roleId, role] of roles.entries()) {
            if (role.managed || role.tags?.premiumSubscriberRole) result.add(roleId);
        }
        return [...result];
    }


    /**
     * Bu fonksiyon sınırsız bir şekilde setTimeout fonksiyonunu çalıştırır
     * @param {() => any} functionParam 
     * @param {Number} milisecond 
     * @returns {() => void}
     */
    setTimeout(functionParam, milisecond) {
        const MAX_NUMBER_IN_TIMEOUT = 2 ** 31 - 1;

        // Yeni bir fonksiyon daha oluşturuyoruz
        function mySetTimeout(functionParam, milisecond, callback) {
            // Eğer girilen değer bir maximum değerden fazlaysa bu fonksiyonu tekrar çağır
            const timeout = milisecond >= MAX_NUMBER_IN_TIMEOUT ?
                setTimeout(() => {
                    callback(timeout);
                    return mySetTimeout(functionParam, milisecond - MAX_NUMBER_IN_TIMEOUT, callback);
                }, MAX_NUMBER_IN_TIMEOUT) :
                setTimeout(functionParam, milisecond);

            callback(timeout);
        }
        // Bir değişken oluşturuyoruz ve bu değişkeni sürekli değiştirerek şu anda çalışan setTimeout fonksiyonunun verisini tutuyoruz
        let timeout;
        mySetTimeout(
            functionParam,
            milisecond,
            (newTimeout) => timeout = newTimeout
        );

        // En sonunda ise bu timeout işlemini bitirmek için yeni bir fonksiyon daha oluşturuyoruz
        return function () {
            return clearTimeout(timeout);
        };
    };


    /**
     * Mesajı belirli bir süre sonra siler
     * @param {Promise<Message>} message 
     * @param {Number} time 
     */
    async waitAndDeleteMessage(message, time) {
        try {
            await this.wait(time);
            (await message).delete().catch(() => { });
        } catch (_) { }
    }


    /**
     * ID'leri girilen sunucuların ID'lerini döndürür
     * @param {Client<true>} client 
     * @param {Array<String>} guildIds
     * @returns {Promise<Object>}
     */
    async getGuildNames(client, guildIds) {
        // Sunucuların shard ID'lerini kaydet ve shardlarda sunucuyu bul
        const allShards = {};
        for (let i = 0; i < guildIds.length; ++i) {
            const guildId = guildIds[i];

            const shardId = this.shardId(guildId);
            allShards[shardId] ??= [];
            allShards[shardId].push(guildId);
        }

        // Bütün shardlarda dön ve sunucuların isimlerini döndür
        const allGuildNamesArray = await Promise.all(
            Object.entries(allShards).map(async ([shardId, guildIds]) =>
                await client.shard.broadcastEval(
                    (clientParam, guildIds) => {
                        // Bütün sunucuların ismini döndür
                        return guildIds.reduce(
                            (object, guildId) => ({ ...object, [guildId]: clientParam.guilds.cache.get(guildId)?.name }),
                            {}
                        )
                    },
                    {
                        context: guildIds,
                        shard: Number(shardId)
                    }
                )
            )
        );

        return allGuildNamesArray.reduce(
            (object, currObject) => ({ ...object, ...currObject }),
            {}
        );
    }


    /**
     * Şu anki kayıt sayısına göre bir rank döndürür. Eğer rank döndürürse kullanıcının rank atladığını gösterir
     * @param {Number} registerCount 
     * @param {"tr" | "en"} language
     * @returns {String | undefined}
     */
    checkUserRank(registerCount, language = "tr") {
        return languageObject.get(language).get(registerCount);
    }


    /**
     * Kullanıcının şu anki rankını gösterir
     * @param {Number} registerCount 
     * @param {"tr" | "en"} language
     * @returns {String}
     */
    getUserRank(registerCount, language = "tr") {
        const index = this.binarySearchFindIndex(rankNumbers, registerCount);
        return EMOJIS.allRanks[language][index];
    }


    /**
     * Discordda bazı karakterler özel karakter olduğu için onların başına "\\" getirerek etkisiz hale getiriyoruz
     * @param {String} string 
     * @returns {String}
     */
    escapeMarkdown(string) {
        return string.replace(/([_~|*`>])/g, "\\$1")
    }


    /**
     * Girilen stringdeki regExp karakterlerini etkisiz hale getirir
     * @param {String} string 
     * @returns {String}
     */
    disableRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /**
     * Kayıt yapılırken kullanıcının isminin baş harflerini büyük yapma fonksiyonu
     * @param {String} str 
     * @param {import("../Typedef").GuildDatabaseObject} guildDatabase
     * @returns {String}
     */
    registerCase(str, guildDatabase, defaultObject = {}) {
        // Eğer otodüzeltme kapalıysa
        if (!guildDatabase.register.isAutoCorrectOn) {
            const symbol = guildDatabase.register.symbol || defaultObject.symbol;
            return symbol ? str.replace(/ /g, ` ${symbol} `) : str;
        }

        // Bütün kelimeleri bul ve hepsinin ilk harfini otomatik olarak büyük yap
        str = str.replace(/\S+/g, word => word[0].toLocaleUpperCase(guildDatabase.language) + word.slice(1).toLocaleLowerCase(guildDatabase.language));

        const symbol = guildDatabase.register.symbol || defaultObject.symbol;
        return symbol ? str.replace(/ /g, ` ${symbol} `) : str;
    }


    /**
     * Sayıları insanların okuyabileceği bir şekilde geri döndürür
     * @param {Number} number 
     * @param {"tr" | "en"} language
     * @returns {String}
     */
    toHumanize(number, language = "tr") {
        return Number(number).toLocaleString(language);
    }


    /**
     * Girilen sayı değerini emojili bir halde geri döndürür
     * @param {Number} number 
     * @returns {String}
     */
    stringToEmojis(number) {
        let resultStr = "";
        const numberToString = String(number);
        for (let i = 0; i < numberToString.length; i++) {
            const char = numberToString[i];
            resultStr += EMOJIS.numbers[char];
        }
        return resultStr;
    }


    /**
     * Girilen dizideki verileri en fazla girilen değerdeki karakter uzunluğuna göre birleştirerek geri döndürür
     * @param {{arrayString: Array<String>, firstString?: String, joinString: String, limit: Number}} param0 
     * @returns {Array<String>}
     */
    splitMessage({
        arrayString,
        firstString = "",
        joinString = " ",
        limit = 1024
    }) {
        const resultArray = [];

        let isFirst = true;

        // Eğer eklenecek veri ilk veriyse firstString ifadesini başına ekle
        function addFirstString(str) {
            if (!isFirst) return str;

            isFirst = false;
            return `${firstString}${str}`;
        }

        // Stringe yazı ekleme
        function addString(str, add) {
            return addFirstString(str.length > 0 ? `${str}${joinString}${add}` : add);
        }

        let resultStr = "";
        for (let i = 0; i < arrayString.length; ++i) {
            const newString = addString(resultStr, arrayString[i]);

            // Eğer yeni dizinin uzunluğu limiti geçiyorsa
            if (newString.length > limit) {
                // Eğer verinin uzunluğu 0'dan fazlaysa döndürlecek diziye ekle
                if (resultStr.length > 0) {
                    resultArray.push(resultStr);
                }
                resultStr = arrayString[i].length > limit ? "" : arrayString[i];
            }
            // Eğer geçmiyorsa şu anki string verisiyle değiştir
            else {
                resultStr = newString;
            }
        }

        // Eğer döngü bitmesine rağmen hala veri varsa diziye ekle
        if (resultStr.length > 0 && limit >= resultStr.length) {
            resultArray.push(resultStr);
        }

        return resultArray;
    }



    /**
     * .map ve .join komutlarını art arda kullanmaya gerek kalmadan hepsini tek bir döngüde yapmanızı sağlar
     * @param {Array | Collection} array 
     * @param {(value: any, index: number) => String} mapCallback 
     * @param {String} joinString 
     * @returns {String}
     */
    mapAndJoin(array, mapCallback, joinString) {
        let finalStr = "";

        // Eğer array bir Collection ise array'a çevir
        if (array instanceof Collection) array = [...array.values()];

        for (let i = 0; i < array.length; ++i) {
            const result = mapCallback(array[i], i);

            // Eğer ilk döngüdeyse joinString'i ekleme
            finalStr += (i == 0 ? "" : joinString) + result;
        }

        return finalStr;
    }

    /**
    * .slice .map ve .join komutlarını art arda kullanmaya gerek kalmadan hepsini tek bir döngüde yapmanızı sağlar
    * @param {Array | Collection} array 
    * @param {Number} startIndex
    * @param {Number} endIndex
    * @param {(value: any, index: number) => String} mapCallback 
    * @param {String} joinString 
    * @returns {String}
    */
    sliceMapAndJoin(array, startIndex, endIndex, mapCallback, joinString) {
        let finalStr = "";

        // Eğer array bir Collection ise array'a çevir
        if (array instanceof Collection) array = [...array.values()];

        const minForLoop = Math.min(endIndex, array.length);

        for (let i = startIndex; i < minForLoop; ++i) {
            const result = mapCallback(array[i], i);

            // Eğer ilk döngüdeyse joinString'i ekleme
            finalStr += (i == 0 ? "" : joinString) + result
        }

        return finalStr;
    }


    /**
     * Girilen sayıyı dizide arar ve bulursa index'ini döndürür
     * @param {Array} array - Aranacak dizi
     * @param {Number} number - Aranacak sayı
     * @param {String} id - Eğer birden fazla aynı sayı varsa hangi ID'ye ait olduğunu bulmak için kullanılır
     * @param {{ findIdCallback: (array: Array, index: Number) => String, findNumberCallback: (array: Array, index: Number) => Number }} options - Eğer birden fazla aynı sayı varsa hangi ID'ye ait olduğunu bulmak için kullanılır
     * @returns {Number}
     */
    binarySearch(array, number, id, { findIdCallback = (array, index) => array[index][0], findNumberCallback = (array, index) => array[index][1] } = {}) {
        let startIndex = 0;
        let endIndex = array.length;

        while (startIndex < endIndex) {

            const middleIndex = Math.floor((endIndex + startIndex) / 2);
            const middleNumber = findNumberCallback(array, middleIndex);

            if (middleNumber === number) {
                const callbackId = findIdCallback(array, middleIndex);
                if (callbackId == id) return middleIndex;

                for (let i = middleIndex - 1; i > -1; --i) {
                    const middleNumber = findNumberCallback(array, i);
                    const callbackId = findIdCallback(array, i);
                    if (middleNumber != number) break;
                    if (callbackId == id) return i;
                }
                for (let i = middleIndex + 1; i < array.length; ++i) {
                    const middleNumber = findNumberCallback(array, i);
                    const callbackId = findIdCallback(array, i);
                    if (middleNumber != number) break;
                    if (callbackId == id) return i;
                }

            } else if (middleNumber > number) {
                startIndex = middleIndex == startIndex ? middleIndex + 1 : middleIndex;
            } else {
                endIndex = middleIndex == endIndex ? middleIndex - 1 : middleIndex;
            }
        }

        return -1;
    }


    /**
     * Girilen sayıyı dizide hangi index'te olacağını döndürür (artan sıralı)
     * @param {Array} array 
     * @param {Number} number 
     * @param {(array: Array, index: Number) => Number} operator 
     * @returns 
     */
    binarySearchFindIndex(array, number, operator = (array, index) => array[index]) {
        let startIndex = 0;
        let endIndex = array.length;

        while (startIndex < endIndex) {
            const middleIndex = Math.floor((endIndex + startIndex) / 2);
            const middleValue = operator(array, middleIndex);

            if (middleValue === number) {
                return middleIndex + 1;
            } else if (middleValue > number) {
                endIndex = middleIndex == endIndex ? middleIndex - 1 : middleIndex;
            } else {
                startIndex = middleIndex == startIndex ? middleIndex + 1 : middleIndex;
            }
        }
        return startIndex;
    }


    /**
     * Dizideki elemanları birleştirir
     * @param {Array<String>} array 
     * @param {"tr" | "en"} language 
     * @returns {String}
     */
    formatArray(array, language = "tr") {
        if (array.length < 2) return array[0] || "";

        const lastElement = array.pop();
        return `${array.join(", ")} ${require("./Localizations/Index.js")[language].others.and} ${lastElement}`;
    }




    /**
     * Girilen metni belirli bir uzunluğa kadar kısaltır ve sonuna ... ekler
     * @param {String} string 
     * @param {Number} maxLength 
     * @returns {String}
     */
    truncatedString(string, maxLength) {
        if (string.length <= maxLength) return string;

        let truncated = string.slice(0, maxLength);

        // Eğer kelimenin tam sonuna geldiyse olduğu gibi döndür
        if (
            !/[a-zA-ZığüşçöİĞÜŞÖÇ]/.test(string[maxLength])
        ) return `${truncated}...`;

        const lastSpaceIndex = truncated.lastIndexOf(" ");
        if (lastSpaceIndex !== -1) {
            truncated = truncated.slice(0, lastSpaceIndex).trim();
        }

        return `${truncated}...`;
    }


    /**
     * Girilen metinden aranılan kelimeyi bulur ve aranılan kelimenin etrafını bold yapar
     * @param {String} text 
     * @param {String | RegExp} searchParam 
     * @returns {String | null}
     */
    highlightSearchText(text, searchParam) {
        searchParam = searchParam instanceof RegExp ? searchParam.source : this.disableRegExp(searchParam.toLowerCase());

        const regex = new RegExp(`(.{0,30})(${searchParam})(.{0,30})`, "i");

        const matches = text.match(regex);
        if (!matches) return null;

        let resultText = "";

        // Eğer soldaki kısım metnin başı değil ise ... ekle
        if (matches[1].length === 30) resultText += "...";
        resultText += matches[1].slice(0, 25);

        // Aranan metni bold yap
        resultText += `__**${matches[2]}**__`;

        // Eğer sağdaki kısım metnin sonu değil ise ... ekle
        resultText += matches[3].slice(0, 25);
        if (matches[3].length === 30) resultText += "...";

        return resultText;
    }



    /**
     * Girilen metindeki komut ismini ve prefixi çıkarır
     * @param {String} content - Mesaj içeriği
     * @param {String} prefix - Botun prefixi
     * @param {Array<String>} commandNames - Komut isimleri
     */
    getContentWithoutCommandName(content, prefix, commandNames) {
        // prefix'i disableRegExp fonksiyonu ile etkisiz hale getir
        prefix = this.disableRegExp(prefix);

        return content.replace(
            new RegExp(`^ *${prefix} *(${commandNames.join(" | ")}) *`, "im"),
            ""
        )
    }


    /**
     * Belirtilen süre boyunca kodu durdurur
     * @param {Number} milisecond 
     * @returns {Promise<Boolean>}
     */
    async wait(milisecond) {
        return new Promise((resolve) =>
            this.setTimeout(() => {
                return resolve(true);
            }, milisecond)
        );
    }


    /**
     * Girilen iki değerin derinlemesine karşılaştırmasını yapar ve eğer aynı değilse false döndürür
     * @param {any} value1
     * @param {any} value2
     * @returns {Boolean}
     */
    deepCompare(value1, value2) {
        if (value1 === value2) return true;

        if (typeof value1 !== "object" || typeof value2 !== "object") return false;

        if (Object.keys(value1).length !== Object.keys(value2).length) return false;

        for (const key in value1) {
            if (!this.deepCompare(value1[key], value2[key])) return false;
        }

        return true;
    }

    /**
     * Girilen iki objenin türlerini karşılaştırır ve eğer aynı türde değilse false döndürür
     * @param {Object} object
     * @param {Object} defaultObject
     * @returns {Boolean}
     */
    compareTypes(object, defaultObject) {
        function findValueByPath(path) {
            let object = defaultObject;
            for (const key of path.split(".")) {
                if (!(key in object)) return undefined;
                object = object[key];
            }
            return object;
        }

        for (const keyPath in object) {
            const defaultValue = findValueByPath(keyPath);
            if (typeof defaultValue !== "undefined") {
                const value = object[keyPath];
                if (typeof value !== typeof defaultValue || Array.isArray(value) !== Array.isArray(defaultValue)) return false;
            }
        }

        return true;
    }

    /**
     * Girilen iki objeyi birleştirir (İlk objeyi ikinci objenin üstüne yazar)
     * @param {Object} obj1
     * @param {Object} obj2
     * @param {String} path
     * @param {Boolean} forceUpdate
     * @returns {{ $set: Object, $unset: Object, $push: Object }}
     */
    mergeObjects(obj1, obj2, path = "", forceUpdate = false) {
        const changedDatas = {
            $set: {},
            $unset: {},
            $push: {},
        };
        const that = this;

        function findChangedDatas(object1, object2, path) {
            for (const key in object1) {
                const absPath = path ? `${path}.${key}` : key;
                if (typeof object1[key] == "object" && typeof object2[key] == "object" && !Array.isArray(object1[key]) && !Array.isArray(object2[key])) {
                    findChangedDatas(object1[key], object2[key], absPath);
                } else if ((forceUpdate && !that.deepCompare(object1[key], object2[key])) || !(key in object2)) {
                    object2[key] = changedDatas.$set[absPath] = object1[key];
                }
            }
        }
        findChangedDatas(obj1, obj2, path);

        return changedDatas;
    }

}


module.exports = new Util();