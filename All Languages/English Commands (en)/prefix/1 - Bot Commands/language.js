"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "lang", // Komutun ismi
    id: "dil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "language",
        "lang",
        "setlang"
    ],
    description: "Server specific, changes the bot's language", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>lang <New language>", // Komutun kullanım şekli
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
        msg,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer botun dilini ingilizce yapmaya çalışıyorsa
            case "en":
            case "english":
            case "ingilizce":
            case "ingiliz":
            case "английский":
                return errorEmbed(`You're already using **English 🇬🇧** language right now you silly thing :)`);

            // Eğer botun dilini türkçe yapmaya çalışıyorsa
            case "tr":
            case "turkish":
            case "türkçe":
            case "turkce":
            case "türkce":
            case "turkçe":
            case "турецкий":
                // Database'ye kaydet
                guildDatabase.language = "tr";
                database.writeFile(guildDatabase, guildId);

                return msg.reply(`Botun size özel dili başarıyla **Türkçe 🇹🇷** olarak değiştirildi`);

            default:
                return errorEmbed(
                    `Please enter the language that the bot will change for guild\n\n` +
                    `**Currently available languages:**\n` +
                    `• ${prefix}lang turkish\n` +
                    `• ${prefix}lang english`,
                    "warn",
                    20 * 1000 // Bu mesajı 20 saniye boyunca göster
                );
        }

    },
};