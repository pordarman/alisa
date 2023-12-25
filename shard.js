"use strict";

// Botun kaç milisaniyede başlatıldığını göstermek için database'ye şu anki zamanı kaydediyoruz
const database = require("./Helpers/Database");
const alisaFile = database.getFile("alisa", "other");
alisaFile.lastUptimeTimestamp = Date.now();
database.writeFile(alisaFile, "alisa", "other");

const {
    ShardingManager,
    EmbedBuilder
} = require("discord.js");
const {
    token,
    EMOJIS: {
        yes: yesEmoji,
        offline: offlineEmoji,
        idle: idleEmoji
    },
    shardCount,
} = require("./settings.json");
const Util = require("./Helpers/Util");

const webhook = Util.webhooks.shard;

const manager = new ShardingManager("./index.js", {
    token,
    respawn: true,
    totalShards: shardCount,
});

manager.on("shardCreate", shard => {
    console.log(`[SHARD] #${shard.id} ID'li shard başarıyla başlatıldı`);

    // Eğer shardlarda bir değişiklik olursa (bağlantısı koparsa, yeniden bağlanmayı denerse vs.) bunu shard log kanalına yaz
    shard.on("disconnect", () => {
        const embed = new EmbedBuilder()
            .setDescription(`**${offlineEmoji} \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`)
            .setColor("Red");

        webhook.send({
            embeds: [
                embed
            ]
        })
    });

    shard.on("ready", async () => {
        const embed = new EmbedBuilder()
            .setDescription(`**${idleEmoji} \`#${shard.id}\` - ID'li shard başarıyla başlatıldı**`)
            .setColor("Yellow");

        webhook.send({
            embeds: [
                embed
            ]
        })
    });

    shard.on("death", () => {
        const embed = new EmbedBuilder()
            .setDescription(`**${offlineEmoji} \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`)
            .setColor("Red");

        webhook.send({
            embeds: [
                embed
            ]
        })
    });

    shard.on("error", (err) => {
        const embed = new EmbedBuilder()
            .setDescription(
                `**‼️ \`#${shard.id}\` - ID'li shard'a bir hata oluştu\n\n` +
                `• ${err}**`
            )
            .setColor("DarkRed");

        webhook.send({
            embeds: [
                embed
            ]
        })
    });
})

manager.spawn().then(() => {
    const embed = new EmbedBuilder()
        .setDescription(`**${yesEmoji} Bütün shard'lar başarıyla başlatıldı ve kullanıma hazır**`)
        .setColor("DarkPurple");

    webhook.send({
        embeds: [
            embed
        ]
    })
});