"use strict";

// Tanımlamalar
const {
    Client,
    GatewayIntentBits,
    Partials,
    RESTJSONErrorCodes,
    Options
} = require("discord.js");
const {
    mainBotToken,
    testBotToken,
    isMainBot,
    shardCount,
    topggtoken,
    mainBotId
} = require("./settings.json");
const client = new Client({
    intents: [
        // Botun erişmesini istediğimiz özellikler
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
        Partials.Reaction
    ],
    makeCache: Options.cacheWithLimits({ // Sadece belirli sayıda öğeyi önbelleğe alır, MessageManager dışındaki öğeleri önbelleğe almaz
        MessageManager: 25,
        GuildMemberManager: Infinity,
        PresenceManager: Infinity,
        VoiceStateManager: Infinity,
        GuildEmojiManager: Infinity,
        ReactionManager: 0,
        DMMessageManager: 0,
    }),
    sweepers: {
        messages: {
            lifetime: 60 * 15, // 15 dakika
            interval: 60 * 60, // 1 saat
            filter: () => true,
        },
    },
    presence: {
        status: "idle",
    },
    failIfNotExists: false, // Eğer cevap verdiği kullanıcının mesajı yoksa botun döndürip vermemesini ayarlar
    shardCount
});
const fs = require("fs");
const path = require("path");
const database = require("./Helpers/Database.js");

// Botun kaç milisaniyede başlatıldığını göstermek için database'ye şu anki zamanı kaydediyoruz
(async () => {
    // Sunucuya bağlan
    await database.init();

    if (client.shard.ids[0] === 0) {
        process.timestamp = Date.now();
        await database.updateFile("alisa", {
            $set: {
                lastUptimeTimestamp: process.timestamp
            }
        });
    }

    const token = isMainBot ? mainBotToken : testBotToken;

    client.setMaxListeners(0); // Konsola hata vermemesi için

    // Yardımcı komut yüklemeleri
    const files = fs.readdirSync(path.join(__dirname, "Handlers"));

    for (const file of files) {
        require(`./Handlers/${file}`)(client, __dirname);
    };

    // Botu başlatma
    client.login(token)
        .catch((err) => {
            console.error(
                err.code === RESTJSONErrorCodes.InvalidToken ?
                    "Girdiğiniz token hatalı! Lütfen tokeninizi kontrol ediniz ve tekrar başlatınız" :
                    err
            );
            return process.exit(1);
        })
        // Eğer bot başarıyla başlatılmışsa
        .then(() => {

            // Botun bilgilerini Top.gg'ye aktarma
            if (client.user.id === mainBotId && client.shard.ids[0] === 0) {
                const { AutoPoster } = require("topgg-autoposter");

                const poster = AutoPoster(topggtoken, client, {
                    interval: 1000 * 60 * 60 * 6, // Her 6 saatte bir güncelleme yap
                });

                poster.on("posted", () => { });
                poster.on("error", () => { });
            }
        });

})();