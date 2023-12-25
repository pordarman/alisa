"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "autocorrect", // Komutun ismi
    id: "otodüzeltme", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "autocorrect",
        "auto-correct",
    ],
    description: "You turn the autocorrect setting on and off", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>autocorrect <on or off>", // Komutun kullanım şekli
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

            // Eğer oto düzeltme ayarını açmak istiyorsa
            case "open":
            case "on":
            case "active":
                // Eğer oto düzeltme ayarı zaten açıksa
                if (guildDatabase.register.isAutoCorrectOn) return errorEmbed("My autocorrect setting is already __**on**__");

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My autocorrect setting has been turned on successfully!`, "success");

            // Eğer oto düzeltme ayarını kapatmak istiyorsa
            case "off":
            case "close":
            case "deactive":
                // Eğer oto düzeltme ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoCorrectOn) return errorEmbed("My autocorrect setting is already __**off**__");

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My autocorrect setting has been successfully turned off!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• To turn on my autocorrect, you can type **${prefix}${this.name} on**\n\n` +
                    `• To close it, you can type **${prefix}${this.name} close**`,
                    "warn"
                )
        }

    },
};