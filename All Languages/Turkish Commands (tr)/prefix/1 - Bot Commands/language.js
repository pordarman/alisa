"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "dil", // Komutun ismi
    id: "dil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "dil",
        "dildeğiştir",
        "language",
        "lang",
        "setlang"
    ],
    description: "Sunucuya özel, botun dilini değiştirir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>dil <Yeni dil>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
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

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer botun dilini türkçe yapmaya çalışıyorsa
            case "tr":
            case "turkish":
            case "türkçe":
            case "turkce":
            case "türkce":
            case "turkçe":
            case "турецкий":
                return errorEmbed(`Şu anda zaten **Türkçe 🇹🇷** dilini kullanıyorsun şapşik şey seni :)`);

            // Eğer botun dilini ingilizce yapmaya çalışıyorsa
            case "en":
            case "english":
            case "ingilizce":
            case "ingiliz":
            case "английский":
                // Database'ye kaydet
                guildDatabase.language = "en";
                database.writeFile(guildDatabase, guildId);

                return msg.reply(`The bot's custom language has been successfully changed to **English 🇬🇧**`);

            default:
                return errorEmbed(
                    `Lütfen botun size özel değiştireceği dili giriniz\n\n` +
                    `**Şu anda kullanılabilecek diller:**\n` +
                    `• ${prefix}dil türkçe\n` +
                    `• ${prefix}dil ingilizce`,
                    "warn",
                    20 * 1000 // Bu mesajı 20 saniye boyunca göster
                );
        }

    },
};