"use strict";
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "uptime", // Komutun ismi
    id: "uptime", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "uptime"
    ],
    description: "Her bir shard'ın uptime süresini gösterir", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>uptime", // Komutun kullanım şekli
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
        language,
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
            return gigabayt >= 1 ?
                `${gigabayt} GB` :
                `${baytToMegabayt(usedMemory)} MB`;
        }

        return msg.reply(
            `${shardUptimes.map(shard => `• \`#${shard.id}\` - **${Time.duration(shard.uptime, language)}** - ( ${readMemory(shard.memory)} )`).join("\n")}\n\n` +
            `• **Toplam bellek:  __${readMemory(shardUptimes.reduce((total, shard) => total + shard.memory, 0))}__**`
        )

    },
};