require("./modüller/database").yaz("lastUptime", Date.now(), "alisa", "diğerleri")
const { ShardingManager, WebhookClient, EmbedBuilder } = require('discord.js');
let { token, p, shard: totalShards, webhook: url } = require("./ayarlar.json")
    , kullanıcıAdı = "Botun kullanıcı adı"
    , wb
if (url) try { wb = new WebhookClient({ url }) } catch (e) { }

const manager = new ShardingManager('./main.js', { token, respawn: true, totalShards });

manager.on('shardCreate', shard => {
    console.log(`[SHARD] #${shard.id} ID'li shard başarıyla başlatıldı`)
    if (wb) {
        shard.on("disconnect", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:cevrimdisi:864276829794992138> \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] })
        })
        shard.on("reconnecting", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:cevrimici:864276829808099408> \`#${shard.id}\` - ID'li shard yeniden başlatılıyor**`).setColor("Green")] })
        })
        shard.on("ready", async () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:bosta:864276829539926037> \`#${shard.id}\` - ID'li shard başarıyla başlatıldı**`).setColor("Yellow")] })
        })
        shard.on("death", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:cevrimdisi:864276829794992138> \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] })
        })
        shard.on("error", (err) => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**‼️ \`#${shard.id}\` - ID'li shard'a bir hata oluştu\n\n• ${err}**`).setColor("Red")] })
        })
    }
})

manager.spawn().then(() => {
    if (wb) wb.send({ embeds: [new EmbedBuilder().setDescription(`**${p} Bütün shard'lar başarıyla başlatıldı ve kullanıma hazır**`).setColor("DarkPurple")] })
    console.log(`[READY] ${kullanıcıAdı} giriş yaptı!`)
})