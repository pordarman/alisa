"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "autosuspect", // Komutun ismi
    id: "otoşüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "autosuspect",
        "autosuspicious",
        "auto-suspect",
        "auto-suspicious",
    ],
    description: "You can turn the auto suspect setting on and off", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>autosuspect <on or off>", // Komutun kullanım şekli
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

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer oto şüpheli ayarını açmak istiyorsa
            case "open":
            case "on":
            case "active":
                // Eğer oto şüpheli ayarı zaten açıksa
                if (guildDatabase.suspicious.autoSuspicious) return errorEmbed("My auto suspect setting is already __**on**__");

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My auto suspect setting has been turned on successfully!`, "success");

            // Eğer oto şüpheli ayarını kapatmak istiyorsa
            case "off":
            case "close":
            case "deactive":
                // Eğer oto şüpheli ayarı zaten kapalıysa
                if (!guildDatabase.suspicious.autoSuspicious) return errorEmbed("My auto suspect setting is already __**off**__");

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My auto suspect setting has been successfully turned off!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• To turn on my automatic suspect, you can type **${prefix}${this.name} on**\n\n` +
                    `• To close it, you can type **${prefix}${this.name} close**`,
                    "warn"
                )
        }

    },
};