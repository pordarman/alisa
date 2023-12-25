"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");
const {
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "respawn", // Komutun ismi
    id: "respawn", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "respawn"
    ],
    description: "Botun bütün shard'larını yeniden başlatır", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>respawn", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language
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
        database.writeFile(alisa, "alisa", "other");

        // Botun bütün shardlarını yeniden başlat
        return await msg.client.shard.respawnAll();

    },
};