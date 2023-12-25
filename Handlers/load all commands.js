const fs = require("fs");
const database = require("../Helpers/Database");

module.exports = (client, dirname) => {

    const alisaFile = database.getFile("alisa", "other");

    // Bütün komutları yükleme fonksiyonu
    function loadAllCommands(path, language) {

        // Prefix komutlarını yükleme fonksiyonu
        function loadPrefixCommands() {

            // Eğer shards 0'da isek (yani ilk shard başlatılıyorsa) komut isimlerini dosyaya kaydet
            const isFirstShard = client.shard.ids[0] == 0;

            // Dile göre Map fonksiyonunu oluşturma
            client.prefixCommands[language] = new Map();
            client.categoryCommands[language] = new Map();

            const allCommandsLanguage = {
                tr: "Tüm komutlar",
                en: "All commands"
            }[language];

            function _loadPrefixCommands(_path) {
                let files;

                try {
                    files = fs.readdirSync(_path);
                } catch (error) {
                    console.error(error);
                    return;
                }

                for (const file of files) {
                    if (!file.includes(".")) {
                        // Eğer dosya bir klasör ise onun da içini kontrol et
                        _loadPrefixCommands(`${_path}/${file}`);
                    } else if (file.endsWith(".js")) {
                        try {
                            // Komut verileri
                            const command = require(`${_path}/${file}`);
                            // Eğer komut daha hazırlanmamışsa ("name" değeri yoksa) döngüyü geç
                            if (command.name == "") continue;

                            const commandNames = new Set(command.aliases);

                            // Ttürkçe karakterleri ingilizceye çevir ve her ikisini de komutlara ekle
                            const removeTurkishChar = {
                                "ç": "c",
                                "ğ": "g",
                                "ı": "i",
                                "ö": "o",
                                "ş": "s",
                                "ü": "u"
                            };

                            // İngilizce klavye kullananlar için türkçe harfleri ingilizceye çevir ve onları da ekle
                            for (const commandName of command.aliases) {
                                commandNames.add(
                                    commandName.replace(
                                        new RegExp(`[${Object.keys(removeTurkishChar).join("")}]`, "g"),
                                        char => removeTurkishChar[char] || char
                                    )
                                )
                            }

                            // Komutları ekle
                            const commandNamesArr = [...commandNames];
                            command.aliases = commandNamesArr;
                            commandNamesArr.forEach((commandName) => {
                                // Komut isimlerini küçük harfe dönüştür ve boşlukları sil
                                commandName = commandName.toLocaleLowerCase(language).replace(/\s+/g, "");

                                // Eğer bu isimde bir komut bulunuyorsa hata döndür
                                if (client.prefixCommands[language].has(commandName)) console.log(`! ${file} - ${commandName} adlı komut zaten bulunuyor!`);
                                else client.prefixCommands[language].set(commandName, command);
                            });

                            // Eğer ilk sharddaysak ve dosyada bu isimle bir veri yoksa oluştur
                            if (isFirstShard && !(command.id in alisaFile.commandUses)) {
                                alisaFile.commandUses[command.id] = {
                                    prefix: 0,
                                    slash: 0,
                                    button: 0,
                                    selectMenu: 0,
                                    total: 0
                                }
                            }

                            // Eğer komut yardım komutuna eklenecekse
                            if (command.addHelpCommand) {

                                // Yardım komutu için komutu kategoriye ekle
                                const category = client.categoryCommands[language].get(command.category) ?? [];
                                const object = {
                                    name: command.name,
                                    id: command.id,
                                    aliases: [...command.aliases],
                                    description: command.description,
                                    category: command.category,
                                    dirname: `${_path}/${file}`
                                }
                                category.push(object);

                                // Eğer komut sadece sahiplerin kullanabileceği bir komut değilse şu anki dile karşılık gelen "Tüm komutlar" verisine ekle
                                if (!command.ownerOnly) {
                                    const allcategoryCommands = client.categoryCommands[language].get(allCommandsLanguage) ?? [];
                                    allcategoryCommands.push(object);
                                    client.categoryCommands[language].set(allCommandsLanguage, allcategoryCommands);
                                }
                                client.categoryCommands[language].set(command.category, category);
                            }

                        } catch (error) {
                            console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                            console.error(error);
                        }
                    }
                }
            }
            _loadPrefixCommands(`${path}\\prefix`);

            // Kategorideki komutları alfabetik bir şekilde yeniden düzenle
            for (const language in client.categoryCommands) {
                for (const array of client.categoryCommands[language].values()) {
                    array.sort(({ name: a }, { name: b }) => a.localeCompare(b));
                }
            }

        }
        loadPrefixCommands();

        // Dile göre Map fonksiyonunu oluşturma
        client.buttonCommands[language] = new Map();

        // Buton komutlarını yükleme fonksiyonu
        function loadButtonCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                console.error(error);
                return;
            }

            for (const file of files) {
                if (!file.includes(".")) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadButtonCommands(`${_path}/${file}`);
                } else if (file.endsWith(".js")) {
                    try {
                        const command = require(`${_path}/${file}`);
                        client.buttonCommands[language].set(command.name, command);
                    } catch (error) {
                        console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                        console.error(error);
                    }
                }
            }
        }
        loadButtonCommands(`${path}\\button`);

        // Dile göre Map fonksiyonunu oluşturma
        client.interactionCommands[language] = new Map();

        // Interaction komutlarını yükleme fonksiyonu
        function loadInteractionCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                console.error(error);
                return;
            }

            for (const file of files) {
                if (!file.includes(".")) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadInteractionCommands(`${_path}/${file}`);
                } else if (file.endsWith(".js")) {
                    try {
                        const command = require(`${_path}/${file}`);
                        client.interactionCommands[language].set(command.name, command);
                    } catch (error) {
                        console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                        console.error(error);
                    }
                }
            }
        }
        loadInteractionCommands(`${path}\\interaction`);

        // Dile göre Map fonksiyonunu oluşturma
        client.selectMenuCommands[language] = new Map();

        // Select Menu komutlarını yükleme fonksiyonu
        function loadSelectMenuCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                console.error(error);
                return;
            }

            for (const file of files) {
                if (!file.includes(".")) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadSelectMenuCommands(`${_path}/${file}`);
                } else if (file.endsWith(".js")) {
                    try {
                        const command = require(`${_path}/${file}`);
                        client.selectMenuCommands[language].set(command.name, command);
                    } catch (error) {
                        console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                        console.error(error);
                    }
                }
            }
        }
        loadSelectMenuCommands(`${path}\\select menu`);

        // Dile göre Map fonksiyonunu oluşturma
        client.slashCommands[language] = new Map();

        // Slash komutlarını yükleme fonksiyonu
        function loadSlashCommands(_path) {
            let files;

            try {
                files = fs.readdirSync(_path);
            } catch (error) {
                console.error(error);
                return;
            }

            for (const file of files) {
                if (!file.includes(".")) {
                    // Eğer dosya bir klasör ise onun da içini kontrol et
                    loadSlashCommands(`${_path}/${file}`);
                } else if (file.endsWith(".js")) {
                    try {
                        const command = require(`${_path}/${file}`);
                        client.slashCommands[language].set(command.name, command);
                        client.slashCommandsJSON.push(command.data.toJSON());
                    } catch (error) {
                        console.error(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                        console.error(error);
                    }
                }
            }
        }
        loadSlashCommands(`${path}\\slash`);
    }

    // Bütün dillere özgü komutları yükle
    const allLanguages = fs.readdirSync(`${dirname}\\All Languages`);
    for (let i = 0; i < allLanguages.length; i++) {
        const languageFile = allLanguages[i];

        // Dil kısaltmasını çek
        const language = languageFile.match(/(?<=\()\w+(?=\))/)[0];

        // Eğer alisa dosyasında bu dile özgü veri yoksa oluştur
        alisaFile.commandHelpers.features[language] ??= {
            "newCodes": [],
            "newFeatures": [],
            "fixes": [],
            "timestamp": Date.now()
        }

        loadAllCommands(`${dirname}\\All Languages\\${languageFile}`, language);
    }

    // Alisa dosyasındaki komutları alfabetik bir şekilde yeniden düzenle
    alisaFile.commandUses = Object.fromEntries(
        Object.entries(alisaFile.commandUses).sort(
            ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey)
        )
    );

    // En sonunda ise dosyayı kaydet
    database.writeFile(alisaFile, "alisa", "other");
};
