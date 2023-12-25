"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");

module.exports = {
    name: "suspicioustime", // Komutun ismi
    id: "şüphelizaman", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "suspicioustime",
        "suspicious-time"
    ],
    description: "You set the amount of time it takes to show a person as a suspect", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>suspicioustime <Duration>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const content = args.join(" ");
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan şüpheli süresini sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.suspiciousTime) return errorEmbed("The time required for new users entering the server to be viewed as suspicious has been reset");

            delete suspicious.suspiciousTime;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("The time required for new users entering the server to be viewed as suspicious has been successfully reset", "success");
        }

        const suspiciousTime = Time.parseTime(content);

        // Eğer şüpheli zamanını girmemişse hata döndür
        if (suspiciousTime == 0) return errorEmbed(
            `Please enter a time\n\n` +
            `**Example**\n` +
            `• ${prefix}${this.name} 1 day 5 hours 6 minutes 30 seconds\n` +
            `• ${prefix}${this.name} 3 weeks`,
            "warn",
            20 * 1000 // Mesajı 20 saniye boyunca göster
        );

        suspicious.suspiciousTime = suspiciousTime;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, people whose accounts are opened in **${Time.duration(suspiciousTime, language)}** will be seen as suspicious`,
            "success"
        );

    },
};