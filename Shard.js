"use strict";

const {
    ShardingManager,
    EmbedBuilder
} = require("discord.js");
const {
    mainBotToken,
    isMainBot,
    EMOJIS: {
        yes: yesEmoji,
        offline: offlineEmoji,
        idle: idleEmoji
    },
    shardCount,
} = require("./settings.json");

const manager = new ShardingManager("./Index.js", {
    token: mainBotToken,
    respawn: true,
    totalShards: shardCount,
    execArgv: ["--trace-warnings", "--unhandled-rejections=strict", "--max-old-space-size=4096"],
});


const Util = require("./Helpers/Util.js");
const webhook = Util.webhooks.shard;

// Eğer main bot ise shardlarla ilgili bilgileri göndermek için webhook oluştur
if (isMainBot) {

    manager.on("shardCreate", shard => {
        Util.console.shard(`#${shard.id} ID'li shard başarıyla başlatıldı`);

        // Eğer shardlarda bir değişiklik olursa (bağlantısı koparsa, yeniden bağlanmayı denerse vs.) bunu shard log kanalına yaz
        shard.on("disconnect", () => {
            Util.console.shard(`#${shard.id} - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor`);

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
            Util.console.shard(`#${shard.id} - ID'li shard başarıyla başlatıldı`);
            
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
            Util.console.shard(`#${shard.id} - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor`);
            
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
            Util.console.shard(`#${shard.id} - ID'li shard'a bir hata oluştu`);
            
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
}

manager.spawn({
    timeout: 1000 * 60 * 5,
})
    .then(() => {
        if (isMainBot) {
            const embed = new EmbedBuilder()
                .setDescription(`**${yesEmoji} Bütün shard'lar başarıyla başlatıldı ve kullanıma hazır**`)
                .setColor("DarkPurple");

            webhook.send({
                embeds: [
                    embed
                ]
            })
        }
    });