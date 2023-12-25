"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "y", // Komutun ismi
    id: "y", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "y",
        "addfeature",
        "addfeatures",
        "yenilikekle"
    ],
    description: "Bottaki güncellemeler kısmını günceller", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>y <add|remove|change> <kod|yenilik|hata> <Mesajınız>", // Komutun kullanım şekli
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

        const addOrRemove = args[0]?.toLocaleLowerCase(language);
        const featureType = args[1]?.toLocaleLowerCase(language);
        if (!addOrRemove || !featureType) return errorEmbed(
            `Lütfen komutu aşağıdaki gibi kullanınız\n\n` +
            `**Example**\n` +
            `• ${prefix}y [add/remove/change] [kod/yenilik/hata] <mesajınız>`
        );

        // Girilen değere göre "newCodes" mi "newFeatures" mi yoksa "fixes" mi döndürüleceğini gösterir
        function codeFromText(text) {
            switch (text) {
                case "kod":
                case "ko":
                case "k":
                case "code":
                    return "newCodes"

                case "yenilik":
                case "y":
                case "yeni":
                case "feature":
                case "features":
                case "newfeature":
                case "newfeatures":
                    return "newFeatures"

                case "hata":
                case "h":
                case "error":
                case "fixes":
                case "fix":
                    return "fixes"
            }
        }

        const features = alisa.commandHelpers.features[language];

        switch (addOrRemove) {
            case "r":
            case "remove":
            case "ç":
            case "çıkar":
            case "çıkart": {
                const removeSliceIndex = Number(args[2]);

                // Eğer çıkartılacak index bir sayı değilse hata döndür
                if (!Time.isNumber(removeSliceIndex)) return errorEmbed(
                    `Lütfen geçerli bir sayı değeri giriniz. Gireceğiniz sayı değeri kadar en önce eklenen veriler silinecektir\n\n` +
                    `**Örnek:**\n` +
                    `• "${prefix}y remove kod 3" yazarsanız en önce eklenen 3 yeni kod verisi silinecektir`
                );

                const removeType = codeFromText(featureType);

                // Eğer hangi güncelleme olduğunu yazmamışsa hata döndür
                if (removeType === undefined) return errorEmbed(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`)

                features[removeType] = features[removeType].slice(0, -removeSliceIndex)
            }
                break;

            case "e":
            case "ekle":
            case "a":
            case "add": {
                const addType = codeFromText(featureType);

                // Eğer hangi güncelleme olduğunu yazmamışsa hata döndür
                if (addType === undefined) return errorEmbed(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`)

                const message = args.slice(2).join(" ");

                // Eğer hiçbir mesaj girmemişse hata döndür
                if (!message) return errorEmbed(`Lütfen bir mesaj giriniz`);

                features[addType].unshift(message);
                features.timestamp = msg.createdTimestamp;
            }
                break;

            case "c":
            case "change":
            case "d":
            case "değiştir":
            case "ch": {
                const changeIndex = Number(args[2]);

                // Eğer değiştirilecek index bir sayı değilse hata döndür
                if (!Time.isNumber(changeIndex)) return errorEmbed(`Lütfen geçerli bir sayı değeri giriniz`);

                const changeType = codeFromText(featureType);

                // Eğer hangi güncelleme olduğunu yazmamışsa hata döndür
                if (changeType === undefined) return errorEmbed(`Lütfen geçerli bir seçenek giriniz **[kod/yenilik/hata]**`);

                // Eğer girdiği sayı indexinde bir veri yoksa hata döndür
                if (features[changeType].length < changeIndex) return errorEmbed(`Lütfen daha küçük bir sayı girmeyi deneyiniz`);

                const message = args.slice(3).join(" ");

                // Eğer hiçbir mesaj girmemişse hata döndür
                if (!message) return errorEmbed(`Lütfen bir mesaj giriniz`);

                // Veriyi güncelle
                features[changeType][changeIndex - 1] = message
            }
                break;

            default:
                return errorEmbed(`Lütfen geçerli bir seçenek giriniz **[add/remove/change]**`)
        }

        // En sonunda ise işin bittiğini ifade eden emoji gönder
        msg.react(EMOJIS.yes);

        return database.writeFile(alisa, "alisa", "other");

    },
};