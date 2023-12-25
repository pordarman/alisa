"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "count-setting", // Komutun ismi
    id: "say-ayarlar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "count-setting",
        "countsetting",
        "countsettings"
    ],
    description: "Change the data to be displayed in the count command", // Komutun açıklaması
    category: "Information commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>count-setting <add or remove> <data>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer bir şeyi yanlış girdiyse bilgilendirme mesajı için kullanılacak mesaj
        const options = `**• ${prefix}${this.name} [emoji/noemoji]**\n\n` +
            `**• ${prefix}${this.name} [add/remove] total =>** Shows the number of members on the server\n` +
            `**• ${prefix}${this.name} [add/remove] member =>** Shows how many ${guildDatabase.register.type == "normal" ? "member" : "boy, girl"} and unregistered members are on the server\n` +
            `**• ${prefix}${this.name} [add/remove] tagged =>** Shows the number of tagged members on the server\n` +
            `**• ${prefix}${this.name} [add/remove] voice =>** Shows how many people are on voice channels\n` +
            `**• ${prefix}${this.name} [add/remove] boost =>** Shows how many boosts and how many people pressed boosts on the server\n` +
            `**• ${prefix}${this.name} [add/remove] vip =>** Shows the number of VIP members on the server\n` +
            `**• ${prefix}${this.name} [add/remove] registerauth =>** Shows the number of members with the registrar role on the server\n` +
            `**• ${prefix}${this.name} [add/remove] jail =>** Shows the number of members with the jail role on the server\n` +
            `**• ${prefix}${this.name} [add/remove] jailauth =>** Shows the number of members with the jail authority role on the server\n` +
            `**• ${prefix}${this.name} [add/remove] banauth =>** Shows the number of members with the ban authority role on the server\n` +
            `**• ${prefix}${this.name} [add/remove] kickauth =>** Shows the number of members with the kick authority role on the server`;

        const {
            datas,
            isEmoji
        } = guildDatabase.countCommandSettings;

        const dataToString = {
            total: "Total number of members on the server",
            registered: "Number of registered and unregistered members",
            tagged: "Number of tagged members",
            voice: "Number of members in the voice",
            boostCount: "Number of boosts on the server",
            vip: "Number of VIP members",
            registerAuth: "Number of registration authority members",
            jail: "Number of jail members",
            jailAuth: "Number of jail authority members",
            vipAuth: "Number of VIP authorized members",
            banAuth: "Number of banned authorized members",
            kickAuth: "Number of kick authorized members",
            muteAuth: "Number of mute authorized members"
        };

        // Girilen veriye göre hangi seçeneği değiştireceğini gösteren fonksiyon
        function codeFromText(text) {
            switch (text) {

                case "total":
                case "membercount":
                    return "total";

                case "member":
                case "members":
                case "user":
                case "users":
                    return "registered";

                case "tagged":
                    return "tagged";

                case "voice":
                    return "voice";

                case "boost":
                    return "boostCount";

                case "vip":
                    return "vip";

                case "registerauth":
                    return "registerAuth";

                case "jail":
                    return "jail";

                case "jailauth":
                    return "jailAuth";

                case "vipauth":
                    return "vipAuth";

                case "banauth":
                case "ban":
                    return "banAuth";

                case "kickauth":
                case "kick":
                    return "kickAuth";

                case "mute":
                case "muteauth":
                    return "muteAuth";

            }
        }

        // Say komutunda gösterilecek verileri döndüren fonksiyon
        function showInfosInCountCommand(datas) {
            let resultArray = [];

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
        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer veri ekleyecekse
            case "add": {
                let addType = codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!addType) return errorEmbed(
                    `Please enter an option\n\n` +
                    `**🗒️ Enterable options**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten gösteriyorsa
                if (datas[addType]) return errorEmbed(`I am already showing the __${dataToString[addType]}__ that you wrote in the **${prefix}count** command`);

                // Database'ye kaydet
                datas[addType] = true
                database.writeFile(guildDatabase, guildId);

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    `In **${prefix}count** command, I now also show __${dataToString[addType]}__!!\n\n` +
                    `**Data to be displayed in the count command**\n` +
                    `• ${showCommands.join("\n• ")}`,
                    "success"
                );
            }

            // Eğer bir veriyi çıkartacaksa
            case "çıkar":
            case "kaldır":
            case "ç":
            case "k":
            case "çıkart": {
                let removeType = codeFromText(args[1]?.toLocaleLowerCase(language));

                // Eğer bir şey döndürülmemişse
                if (!removeType) return errorEmbed(
                    `Please enter an option\n\n` +
                    `**🗒️ Enterable options**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );

                // Eğer veriyi zaten göstermiyorsa
                if (!datas[removeType]) return errorEmbed(`I am not already showing the __${dataToString[addType]}__ that you wrote in the **${prefix}count** command`);

                // Database'ye kaydet
                datas[removeType] = false;
                database.writeFile(guildDatabase, guildId);

                // Say komutunda hangi verilerin gösterileceğini gösteren fonksiyon
                const showCommands = showInfosInCountCommand(datas);

                return errorEmbed(
                    `I no longer show __${dataToString[removeType]}__ in **${prefix}count** command!!\n\n` +
                    `**Data to be displayed in the count command**\n` +
                    `• ${showCommands.join("\n• ")}`,
                    "success"
                );
            }

            // Eğer komutu emojili yapmak istiyorsa
            case "emoji": {
                // Eğer zaten emojili ise
                if (isEmoji) return errorEmbed(`On this server, my **${prefix}count** emoji setting is already __with emoji__`);

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My **${prefix}count** command on this server is now __emoji__!`, "success");
            }

            // Eğer emojisiz yapmak istiyorsa
            case "noemoji":
            case "emojino": {
                // Eğer zaten emojili ise
                if (!isEmoji) return errorEmbed(`On this server, my **${prefix}count** emoji setting is already __emojiless__`);

                // Database'ye kaydet
                guildDatabase.countCommandSettings.isEmoji = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My **${prefix}count** command on this server is now without __emoji__!`, "success");
            }

            // Eğer geçersiz bir veri girmişse
            default:
                return errorEmbed(
                    `Please enter an option\n\n` +
                    `**🗒️ Enterable options**\n` +
                    `${options}`,
                    "warn",
                    45 * 1000 // Bu mesajı 45 saniye boyunca göster
                );
        }

    },
};