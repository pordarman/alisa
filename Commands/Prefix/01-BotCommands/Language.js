"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "dil",
        en: "language"
    },
    id: "dil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "dil",
            "dildeğiştir",
            "language",
            "lang",
            "setlang"
        ],
        en: [
            "language",
            "lang",
            "setlang"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya özel, botun dilini değiştirir",
        en: "Server specific, changes the bot's language"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>dil <Yeni dil>",
        en: "<px>lang <New language>"
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
        msg,
        guildDatabase,
        guildId,
        msgMember,
        args,
        prefix,
        language,
        errorEmbed
    }) {

        const {
            commands: {
                dil: messages
            },
            permissions: permissionMessages,
            switchs: {
                language: switchKey
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {

            // Eğer botun dilini ingilizce yapmaya çalışıyorsa
            case "en":
                // Eğer botun dili zaten ingilizce ise
                if (language === "en") return errorEmbed(messages.already);

                // Database'ye kaydet
                guildDatabase.language = "en";
                await database.updateGuild(guildId, {
                    $set: {
                        language: guildDatabase.language
                    }
                });

                // İngilizce komutları yükle
                Util.setGuildCommands(msg.client.user.id, guildId, Util.maps.guildCommandsJSON.get(language));

                return msg.reply(messages.changed);

            // Eğer botun dilini türkçe yapmaya çalışıyorsa
            case "tr":
                // Eğer botun dili zaten türkçe ise
                if (language === "tr") return errorEmbed(messages.already);

                // Database'ye kaydet
                guildDatabase.language = "tr";
                await database.updateGuild(guildId, {
                    $set: {
                        language: guildDatabase.language
                    }
                });

                // Türkçe komutları yükle
                Util.setGuildCommands(msg.client.user.id, guildId, Util.maps.guildCommandsJSON.get(language));

                return msg.reply(messages.changed);

            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn",
                    30 * 1000 // Bu mesajı 30 saniye boyunca göster
                );
        }

    },
};