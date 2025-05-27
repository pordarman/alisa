"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const pathModule = require("path");

module.exports = {
    name: { // Komutun ismi
        tr: "reload",
        en: "reload"
    },
    id: "reload", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "reload",
            "r",
        ],
        en: [
            "reload",
            "r",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Komutları yenilersiniz",
        en: "You refresh the commands"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>reload",
        en: "<px>reload"
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

        const message = await msg.reply("Komutlar yenileniyor...");
        if (!message) return;

        // Bütün shard'larda komutları yenile
        const reloadCommandsAllShards = await msg.client.shard.broadcastEval(
            async (client, path) => {
                const fs = require("fs");
                const os = require("os");
                const pathModule = require("path");

                // Bütün önbellekteki dosyaları sil
                function clearRequireCache(path) {
                    const files = fs.readdirSync(path);

                    for (const file of files) {
                        const filePath = pathModule.resolve(path, file);
                        if (fs.statSync(filePath).isDirectory()) {
                            clearRequireCache(filePath);
                        } else if (file.endsWith(".js")) {
                            delete require.cache[require.resolve(filePath)];
                        }
                    }
                }
                clearRequireCache(pathModule.resolve(path, "Helpers"));
                clearRequireCache(pathModule.resolve(path, "Handlers"))

                process.removeAllListeners(os.platform() == "win32" ? "SIGINT" : "SIGTERM");


                const database = require(pathModule.resolve(path, "Helpers", "Database.js"));
                await database.init();

                const commandErrors = await (require(pathModule.resolve(path, "Handlers", "LoadAllCommands.js"))(client, path, false));
                const eventErrors = require(pathModule.resolve(path, "Handlers", "LoadEvents.js"))(client, path, false);

                return [
                    ...commandErrors,
                    ...eventErrors
                ];
            },
            {
                context: __dirname.split(`${pathModule.sep}Commands${pathModule.sep}`)[0]
            }
        );

        const errors = reloadCommandsAllShards[0]

        // Eğer herhangi bir hata varsa
        if (errors.length != 0) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `Bazı komutları yüklenirken hata oluştu!\n\n` +
                    `**İşte yüklenemeyen komutlar:**\n` +
                    `${errors.join("\n")}\n\n` +
                    `**• Daha bilgi için lütfen konsolu kontrol edin!**`
                )
                .setColor("DarkRed")
            return message.edit({
                embeds: [
                    embed
                ],
                content: null
            });
        }

        return message.edit(`• Bütün komutlar başarıyla yenilendi!`);

    },
};