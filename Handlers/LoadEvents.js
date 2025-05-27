const { Client } = require("discord.js");
const fs = require("fs");
const pathModule = require("path");

/**
 * 
 * @param {Client} client - Discord.js client nesnesi
 * @param {String} dirname - - Komutların bulunduğu dizin
 * @param {Boolean} printConsole - Konsola hata mesajı yazdırma durumu (Eğer false ise sadece hataların olduğu bir dizi döner)
 * @returns {?Array<String>} - Komutları yükler ve dosyaya kaydeder (Eğer hata varsa bir dizi döner)
 */
module.exports = (client, dirname, printConsole) => {

    client.removeAllListeners(); // Bütün eventleri kaldır

    const result = [];

    function printError(error, onlyConsole = false) {
        if (onlyConsole || printConsole) {
            console.error(error);
        } else {
            result.push(`- **${error.match(/(?<=! )\S+/)?.[0] || error}**`);
        }
    }

    function loadEvents(path) {
        let files;

        try {
            files = fs.readdirSync(path);
        } catch (error) {
            printError(error, true);
            return;
        }

        for (const file of files) {
            const filePath = pathModule.resolve(path, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                // Eğer dosya bir klasör ise onun da içini kontrol et
                loadEvents(filePath);
            } else if (file.endsWith(".js")) {
                try {
                    delete require.cache[require.resolve(filePath)];

                    const command = require(filePath);
                    client[command.once ? "once" : "on"](command.name, (...args) => command.execute(...args));
                } catch (error) {
                    printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                    printError(error, true);
                }
            }
        }
    }
    loadEvents(pathModule.resolve(dirname, "Events"));

    if (!printConsole) {
        return result;
    }
};
