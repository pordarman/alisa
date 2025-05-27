"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "say-ayarlar",
        en: "count-settings"
    },
    id: "say-ayarlar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "say-ayarlar",
            "sayayarlar",
            "countsetting",
            "countsettings"
        ],
        en: [
            "count-setting",
            "countsetting",
            "countsettings"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Say komutunda gösterilecek verileri değiştirisiniz",
        en: "Change the data to be displayed in the count command"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>say-ayarlar <ekle veya çıkar> <veri>",
        en: "<px>count-settings <add or remove> <data>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        guildId,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {
        const {
            commands: {
                "say-ayarlar": messages
            },
            permissions: permissionMessages,
            switchs: {
                setCountOptions: switchKeys
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer bir şeyi yanlış girdiyse bilgilendirme mesajı için kullanılacak mesaj
        const options = messages.options({
            prefix,
            registerType: guildDatabase.register.type
        });

        const {
            datas,
            isEmoji
        } = guildDatabase.countCommandSettings;

        const dataToString = messages.dataToString;

        // Say komutunda gösterilecek verileri döndüren fonksiyon
        function showInfosInCountCommand(datas) {
            const resultArray = [];

            for (const key in datas) {

                // Eğer değer "false" ise döngüyü geç
                if (!datas[key]) continue;

                resultArray.push(
                    dataToString[key]
                )
            }
            return resultArray;
        }

        // Hangi veriyi ekleyip çıkacağını belirten switch
        switch (switchKeys.switch(args[0]?.toLocaleLowerCase(language))) {

            // Eğer veri ekleyecekse
            case "add": {
                const addType = switchKeys.codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!addType) return errorEmbed(
                    messages.enterOption(options),
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten gösteriyorsa
                if (datas[addType]) return errorEmbed(
                    messages.add.alreadyShow({
                        prefix,
                        data: dataToString[addType]
                    })
                );

                // Database'ye kaydet
                datas[addType] = true
                await database.updateGuild(guildId, {
                    $set: {
                        [`countCommandSettings.datas.${addType}`]: true
                    }
                });

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    messages.add.show({
                        prefix,
                        data: dataToString[addType],
                        showCommands: showCommands.join("\n• ")
                    }),
                    "success"
                );
            }

            // Eğer bir veriyi çıkartacaksa
            case "remove": {
                const removeType = switchKeys.codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!removeType) return errorEmbed(
                    messages.enterOption(options),
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten göstermiyorsa
                if (!datas[removeType]) return errorEmbed(
                    messages.remove.notShow({
                        prefix,
                        data: dataToString[removeType]
                    })
                );

                // Database'ye kaydet
                datas[removeType] = false;
                await database.updateGuild(guildId, {
                    $set: {
                        [`countCommandSettings.datas.${removeType}`]: false
                    }
                });

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    messages.remove.show({
                        prefix,
                        data: dataToString[removeType],
                        showCommands: showCommands.join("\n• ")
                    }),
                    "success"
                );
            }

            // Eğer komutu emojili yapmak istiyorsa
            case "emoji": {
                // Eğer zaten emojili ise
                if (isEmoji) return errorEmbed(
                    messages.emoji.alreadyEmoji(prefix)
                );

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "countCommandSettings.isEmoji": true
                    }
                });

                return errorEmbed(messages.emoji.successEmoji(prefix), "success");
            }

            // Eğer emojisiz yapmak istiyorsa
            case "noemoji": {
                // Eğer zaten emojili ise
                if (!isEmoji) return errorEmbed(
                    messages.emoji.alreadyNoEmoji(prefix)
                );

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "countCommandSettings.isEmoji": false
                    }
                });

                return errorEmbed(messages.emoji.successNoEmoji(prefix), "success");
            }

            // Eğer geçersiz bir veri girmişse
            default:
                return errorEmbed(
                    messages.enterOption(options),
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );
        }

    },
};