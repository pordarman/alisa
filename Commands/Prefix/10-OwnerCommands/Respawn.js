"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS
} = require("../../../settings.json");

module.exports = {
    name: { // Komutun ismi
        tr: "respawn",
        en: "respawn"
    },
    id: "respawn", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "respawn",
        ],
        en: [
            "respawn",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botun bütün shard'larını yeniden başlatır",
        en: "Restarts all shards of the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>respawn",
        en: "<px>respawn"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        alisa,
        msg,
    }) {

        const waitMessage = await msg.reply(
            `${EMOJIS.loading} **Bütün shardlar yeniden başlatılıyor...**`
        );

        // Eğer mesaj atılamamışsa
        if (!waitMessage) return;

        // Yeniden başlatmadan önce alisa.lastUptimeTimestamp verisini güncelle
        alisa.lastUptimeTimestamp = Date.now();
        alisa.lastUptimeMessage = {
            messageId: waitMessage.id,
            channelId: msg.channelId,
            guildId: msg.guildId,
        };

        // Alisa verisini güncelle
        await database.updateFile("alisa", {
            $set: {
                lastUptimeTimestamp: alisa.lastUptimeTimestamp,
                lastUptimeMessage: alisa.lastUptimeMessage,
            }
        });

        // Botun bütün shardlarını yeniden başlat
        return await msg.client.shard.respawnAll();
    },
};