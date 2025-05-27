"use strict";
const Time = require("../../../Helpers/Time");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "uptime",
        en: "uptime"
    },
    id: "uptime", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "uptime",
        ],
        en: [
            "uptime",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Her bir shard'ın uptime süresini gösterir",
        en: "Shows the uptime of each shard"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>uptime",
        en: "<px>uptime"
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
        msg,
    }) {

        const shardUptimes = await msg.client.shard.broadcastEval(
            client => ({
                id: client.shard.ids[0],
                memory: process.memoryUsage().heapUsed,
                uptime: client.uptime,
            })
        );

        // Ram kullanımını okuma
        function readMemory(usedMemory) {
            function baytToMegabayt(number, fixed = 0) {
                return (number / 1024 / 1024).toFixed(fixed);
            }
            function baytToGigabayt(number, fixed = 1) {
                return (number / 1024 / 1024 / 1024).toFixed(fixed);
            }

            const gigabayt = baytToGigabayt(usedMemory);
            // Eğer bellek kullanımı 1 gb'yi aştıysa gigabayt'a çevir ve geri döndür
            return parseFloat(gigabayt) >= 1 ?
                `${gigabayt} GB` :
                `${baytToMegabayt(usedMemory)} MB`;
        }

        const info = Util.mapAndJoin(
            shardUptimes,
            shard => `• \`#${shard.id}\` - **${Time.duration(shard.uptime, "tr")}**`,
            "\n"
        )

        return msg.reply(
            `${info}\n\n` +
            `• **Toplam bellek:  __${readMemory(shardUptimes.reduce((total, shard) => total + shard.memory, 0))}__**`
        )

    },
};