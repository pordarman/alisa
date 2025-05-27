const fs = require("fs");
const database = require("../Helpers/Database.js");
const {
    languages
} = require("../settings.json");
const Util = require("../Helpers/Util.js");
const allMessages = require("../Helpers/Localizations/Index.js");
const pathModule = require("path");
const { Client } = require("discord.js");

/**
 * 
 * @param {Client} client - Discord Client
 * @param {String} dirname - Botun ana dizini
 * @param {Boolean} printConsole - Konsola çıktı verip vermeyeceğini belirten bir boolean değer (Eğer false ise sadece hataların olduğu bir dizi döner)
 * @returns {Promise<?Array<String>>} - Komutları yükler ve dosyaya kaydeder (Eğer hata varsa bir dizi döner)
 */
module.exports = async (client, dirname, printConsole = true) => {

    const result = [];

    function printError(error, onlyConsole = false, path = "") {
        if (onlyConsole || printConsole) {
            console.error(error);
        } else {
            result.push(`- **${path.split(`${pathModule.sep}Commands${pathModule.sep}`)[1]}**`);
        }
    }

    const alisaFile = await database.getFile("alisa");

    const copyCommandUses = JSON.parse(JSON.stringify(alisaFile.commandUses));

    // Bütün komutları yükleme fonksiyonu
    (function loadAllCommands(path) {

        // Eğer shards 0'da isek (yani ilk shard başlatılıyorsa) komut isimlerini dosyaya kaydet
        const isFirstShard = client.shard.ids[0] == 0;

        Util.maps.buttonCommands.clear();

        Util.maps.selectMenuCommands.clear();

        // Dile göre Map fonksiyonunu oluşturma
        for (const language of languages) {
            Util.maps.prefixCommands.set(language, new Map());
            Util.maps.categoryCommands.set(language, new Map());

            Util.maps.interactionCommands.set(language, new Map());

            Util.maps.slashCommands.set(language, new Map());
            Util.maps.guildCommandsJSON.set(language, []);
        }

        // Prefix komutlarını yükleme fonksiyonu
        (function loadPrefixCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path).sort((a, b) => (a.match(/\d+/)?.[0] || 0) - (b.match(/\d+/)?.[0] || 0));
            } catch (error) {
                printError(error, true)
                return;
            }

            for (const file of files) {
                const filePath = pathModule.resolve(_path, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadPrefixCommands(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)];

                        // Komut verileri
                        const command = require(filePath);

                        // Bütün dilleri yükle
                        for (const language of languages) {
                            // Eğer komut daha hazırlanmamışsa ("name" değeri yoksa) döngüyü geç
                            if (command.name[language] == "") continue;

                            // Komutun ID'sini önbelleğe ekle
                            Util.maps.prefixCommandIds.set(command.id, command);

                            command.dirname = filePath.split(`${pathModule.sep}Commands${pathModule.sep}`)[1];

                            const commandNames = new Set(command.aliases[language]).add(command.name[language]);

                            // İngilizce klavye kullananlar için türkçe harfleri ingilizceye çevir ve onları da ekle
                            for (const commandName of commandNames) {
                                commandNames.add(
                                    Util.removeTurkishChars(commandName)
                                )
                            };

                            command.aliases[language] = [...commandNames];

                            // commandNames'ten komutun ismini çıkar
                            commandNames.delete(command.name[language]);

                            const commands = Util.maps.prefixCommands.get(language);

                            // Komutu sadece komutun ismiyle eşleştir sonra diğerlerini de komutun ismiyle eşleştir
                            commands.set(command.name[language].toLocaleLowerCase(language), command);
                            commandNames.forEach((commandName) => {
                                // Komut isimlerini küçük harfe dönüştür ve boşlukları sil
                                commandName = commandName.toLocaleLowerCase(language).replace(/\s+/g, "");

                                // Eğer bu isimde bir komut bulunuyorsa hata döndür
                                if (commands.has(commandName)) printError(`! ${file} - ${commandName} adlı komut zaten bulunuyor!`, true);
                                else commands.set(commandName, command.name[language]);
                            });


                            // Eğer ilk sharddaysak ve dosyada bu isimle bir veri yoksa oluştur
                            if (isFirstShard) {
                                alisaFile.commandUses[command.id] = {
                                    prefix: 0,
                                    slash: 0,
                                    button: 0,
                                    selectMenu: 0,
                                    contextMenu: 0,
                                    total: 0,
                                    ...alisaFile.commandUses[command.id]
                                }
                            }

                            // Eğer komut yardım komutuna eklenecekse
                            if (command.addHelpCommand) {
                                const commandCategory = Util.maps.categoryCommands.get(language);

                                // Yardım komutu için komutu kategoriye ekle
                                const category = commandCategory.get(command.category[language]) ?? [];
                                const object = {
                                    name: command.name[language],
                                    id: command.id,
                                    aliases: [...command.aliases[language]],
                                    description: command.description[language],
                                    category: command.category[language],
                                    dirname: filePath
                                }
                                category.push(object);

                                // Eğer komut sadece sahiplerin kullanabileceği bir komut değilse şu anki dile karşılık gelen "Tüm komutlar" verisine ekle
                                if (!command.ownerOnly) {
                                    const allCommands = allMessages[language].others.allCommands;
                                    const allCategoryCommands = commandCategory.get(allCommands) ?? [];
                                    allCategoryCommands.push(object);
                                    commandCategory.set(allCommands, allCategoryCommands);
                                }
                                commandCategory.set(command.category[language], category);
                            }
                        }

                    } catch (error) {
                        printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`, false, filePath);
                        printError(error, true);
                    }
                }
            }

            // Kategorideki komutları alfabetik bir şekilde yeniden düzenle
            for (const language of Util.maps.categoryCommands.keys()) {
                for (const array of Util.maps.categoryCommands.get(language).values()) {
                    array.sort(({ name: a }, { name: b }) => a.localeCompare(b, language));
                }
            }

        })(pathModule.resolve(path, "Prefix"));

        // Buton komutlarını yükleme fonksiyonu
        (function loadButtonCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                printError(error, true)
                return;
            }

            for (const file of files) {
                const filePath = pathModule.resolve(_path, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadButtonCommands(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)];

                        const command = require(filePath);
                        command.dirname = filePath.split(`${pathModule.sep}Commands${pathModule.sep}`)[1];

                        Util.maps.buttonCommands.set(command.name, command);
                    } catch (error) {
                        printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`, false, filePath);
                        printError(error, true)
                    }
                }
            }
        })(pathModule.resolve(path, "Button"));

        // Interaction komutlarını yükleme fonksiyonu
        (function loadInteractionCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                printError(error, true)
                return;
            }

            for (const file of files) {
                const filePath = pathModule.resolve(_path, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadInteractionCommands(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)];

                        const command = require(filePath);
                        command.dirname = filePath.split(`${pathModule.sep}Commands${pathModule.sep}`)[1];

                        for (const language of languages) {
                            Util.maps.interactionCommands.get(language).set(command.name[language], command);
                            Util.maps.guildCommandsJSON.get(language).push(command.data[language].toJSON());
                        }
                    } catch (error) {
                        printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`, false, filePath);
                        printError(error, true)
                    }
                }
            }
        })(pathModule.resolve(path, "Interaction"));

        // Select Menu komutlarını yükleme fonksiyonu
        (function loadSelectMenuCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                printError(error, true)
                return;
            }

            for (const file of files) {
                const filePath = pathModule.resolve(_path, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadSelectMenuCommands(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)];

                        const command = require(filePath);
                        command.dirname = filePath.split(`${pathModule.sep}Commands${pathModule.sep}`)[1];

                        Util.maps.selectMenuCommands.set(command.name, command);
                    } catch (error) {
                        printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`, false, filePath);
                        printError(error, true)
                    }
                }
            }
        })(pathModule.resolve(path, "SelectMenu"));

        // Slash komutlarını yükleme fonksiyonu
        (function loadSlashCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                printError(error, true)
                return;
            }

            for (const file of files) {
                const filePath = pathModule.resolve(_path, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadSlashCommands(filePath);
                } else if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)];

                        const command = require(filePath);
                        command.dirname = filePath.split(`${pathModule.sep}Commands${pathModule.sep}`)[1];

                        for (const language of languages) {
                            Util.maps.slashCommands.get(language).set(command.name[language], command);
                            Util.maps.guildCommandsJSON.get(language).push(command.data[language].toJSON());
                        }
                    } catch (error) {
                        printError(`! ${file} adlı komut yüklenirken bir hata oluştu!`, false, filePath);
                        printError(error, true)
                    }
                }
            }
        })(pathModule.resolve(path, "Slash"));
    })(pathModule.resolve(dirname, "Commands"));

    // Alisa dosyasındaki komutları alfabetik bir şekilde yeniden düzenle
    alisaFile.commandUses = Object.fromEntries(
        Object.entries(alisaFile.commandUses).sort(
            ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey)
        )
    );

    // En sonunda ise alisa dosyasında bir değişiklik yapıldıysa dosyayı kaydet
    if (!Util.deepCompare(alisaFile.commandUses, copyCommandUses)) {
        await database.updateFile("alisa",
            {
                $set: {
                    commandUses: alisaFile.commandUses
                }
            },
            true
        );
    }

    if (!printConsole) {
        return result;
    }
};
