"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "reload", // Komutun ismi
    id: "reload", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "reload",
        "r",
    ],
    description: "Komutları yenilersiniz", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>reload", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Bütün shard'larda komutları yenile
        const reloadCommandsAllShards = await msg.client.shard.broadcastEval(
            (client, path) => {
                const fs = require("fs");

                // Bütün önbellekteki dosyaları sil
                delete require.cache[require.resolve(`${path}\\Helpers\\Util`)];
                delete require.cache[require.resolve(`${path}\\Helpers\\Database`)];
                delete require.cache[require.resolve(`${path}\\Helpers\\Time`)];
                delete require.cache[require.resolve(`${path}\\settings.json`)];
                delete require.cache[require.resolve(`${path}\\messages.json`)];

                const database = require(`${path}\\Helpers\\Database`);

                const errors = [];

                // Bütün komutları yükleme fonksiyonu
                function loadAllCommands(path, language) {

                    // Prefix komutlarını ve kategori komutlarını sil
                    client.prefixCommands[language].clear();
                    client.categoryCommands[language].clear();

                    // Bu dilde karşılık gelen Tüm komutlar kelimesini oluştur
                    const allCommandsLanguage = {
                        tr: "Tüm komutlar",
                        en: "All commands"
                    }[language];

                    // Prefix komutlarını yükleme fonksiyonu
                    function loadPrefixCommands() {


                        // Eğer shards 0'da isek (yani ilk shard başlatılıyorsa) komut isimlerini dosyaya kaydet
                        const isFirstShard = client.shard.ids[0] == 0;
                        let alisaFiles;
                        let isChanged = false;
                        if (isFirstShard) alisaFiles = database.getFile("alisa", "other");

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
                                        // Komutu önbellekten sil
                                        delete require.cache[require.resolve(`${_path}/${file}`)];

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

                                        // Eğer ilk sharddaysak ve dosyada bu isimle bir veri yoksa oluştur
                                        if (isFirstShard && !(command.id in alisaFiles.commandUses)) {
                                            isChanged = true;
                                            alisaFiles.commandUses[command.id] = {
                                                prefix: 0,
                                                slash: 0,
                                                button: 0,
                                                selectMenu: 0
                                            }
                                        }

                                        // Komutları ekle
                                        const commandNamesArr = [...commandNames];
                                        command.aliases = commandNamesArr;
                                        commandNamesArr.forEach((commandName) => {
                                            // Komut isimlerini küçük harfe dönüştür ve boşlukları sil
                                            commandName = commandName.toLocaleLowerCase(language).replace(/\s+/g, "");

                                            // Eğer bu isimde bir komut bulunuyorsa hata döndür
                                            if (client.prefixCommands[language].has(commandName)) errors.push(`! ${file} - __${commandName}__ adlı komut zaten bulunuyor!`);
                                            else client.prefixCommands[language].set(commandName, command);
                                        });

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
                                        errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);

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

                        // Alisa dosyasındaki komutları alfabetik bir şekilde yeniden düzenle
                        if (isChanged) {
                            alisaFiles.commandUses = Object.fromEntries(
                                Object.entries(alisaFiles.commandUses).sort(
                                    ([firstKey], [secondKey]) => Number(firstKey > secondKey) || Number(firstKey === secondKey) - 1
                                )
                            );
                            database.writeFile(alisaFiles, "alisa", "other");
                        }

                    }
                    loadPrefixCommands();


                    // Buton komutlarını sil
                    client.buttonCommands[language].clear();

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
                                    // Komutu önbellekten sil
                                    delete require.cache[require.resolve(`${_path}/${file}`)];

                                    const command = require(`${_path}/${file}`);
                                    client.buttonCommands[language].set(command.name, command);
                                } catch (error) {
                                    errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                                }
                            }
                        }
                    }
                    loadButtonCommands(`${path}\\button`);


                    // Interaction komutlarını sil
                    client.interactionCommands[language].clear();

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
                                    // Komutu önbellekten sil
                                    delete require.cache[require.resolve(`${_path}/${file}`)];

                                    const command = require(`${_path}/${file}`);
                                    client.interactionCommands[language].set(command.name, command);
                                } catch (error) {
                                    errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                                }
                            }
                        }
                    }
                    loadInteractionCommands(`${path}\\interaction`);
                    // Selectmenu komutlarını sil
                    client.selectMenuCommands[language].clear();

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
                                    // Komutu önbellekten sil
                                    delete require.cache[require.resolve(`${_path}/${file}`)];

                                    const command = require(`${_path}/${file}`);
                                    client.selectMenuCommands[language].set(command.name, command);
                                } catch (error) {
                                    errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                                }
                            }
                        }
                    }
                    loadSelectMenuCommands(`${path}\\select menu`);


                    // Slash komutlarını sil
                    client.slashCommands[language].clear();

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
                                    // Komutu önbellekten sil
                                    delete require.cache[require.resolve(`${_path}/${file}`)];

                                    const command = require(`${_path}/${file}`);
                                    client.slashCommands[language].set(command.name, command);
                                } catch (error) {
                                    errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                                }
                            }
                        }
                    }
                    loadSlashCommands(`${path}\\interaction`);

                }

                // Bütün dillere özgü komutları yükle
                const allLanguages = fs.readdirSync(`${path}\\All Languages`);
                for (let i = 0; i < allLanguages.length; i++) {
                    const languageFile = allLanguages[i];

                    // Dil kısaltmasını çek
                    const language = languageFile.match(/(?<=\()\w+(?=\))/)[0];
                    loadAllCommands(`${path}\\All Languages\\${languageFile}`, language);
                }


                // Bütün eventleri yeniden yükleyeceğimiz için bütün hepsini kaldır
                client.removeAllListeners();

                // Bütün eventleri yükleme fonksiyonu
                function loadEvents(path) {
                    let files;

                    try {
                        files = fs.readdirSync(path);
                    } catch (error) {
                        console.error(error);
                        return;
                    }

                    for (const file of files) {
                        if (!file.includes(".")) {
                            // Eğer dosya bir klasör ise onun da içini kontrol et
                            loadEvents(`${path}/${file}`);
                        } else if (file.endsWith(".js")) {
                            try {
                                // Eventi önbellekten sil
                                delete require.cache[require.resolve(`${path}/${file}`)];

                                const command = require(`${path}/${file}`);
                                client[command.once ? "once" : "on"](command.name, (...args) => command.execute(...args));
                            } catch (error) {
                                errors.push(`! ${file} adlı komut yüklenirken bir hata oluştu!`);
                            }
                        }
                    }

                }
                loadEvents(`${path}\\Events`);

                return errors;
            },
            {
                context: __dirname.replace(/\\All Languages.*/, "")
            }
        );

        const errors = reloadCommandsAllShards[0]

        // Eğer herhangi bir hata varsa
        if (errors.length != 0) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `Bazı komutları yüklenirken hata oluştu!\n\n` +
                    `**İşte yüklenemeyen komutlar:**\n` +
                    `${errors.join("\n")}`
                )
                .setColor("DarkRed")
            return msg.reply({
                embeds: [
                    embed
                ]
            });
        }

        return msg.reply(`• Bütün komutlar başarıyla yenilendi!`)

    },
};