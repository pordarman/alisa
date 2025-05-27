"use strict";
const database = require("../../../Helpers/Database.js");
const Time = require("../../../Helpers/Time");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "şüphelizaman",
        en: "suspicioustime"
    },
    id: "şüphelizaman", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "şüphelizaman",
            "şüpheli-zaman",
            "suspicioustime",
            "suspicious-time"
        ],
        en: [
            "suspicioustime",
            "suspicious-time"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bir kişiyi şüpheli olarak göstermek için gereken süreyi ayarlarsınız",
        en: "You set the amount of time it takes to show a person as a suspect"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>şüphelizaman <Süre>",
        en: "<px>suspicioustime <Duration>"
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
                şüphelizaman: messages
            },
            permissions: permissionMessages,
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const content = args.join(" ");
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan şüpheli süresini sıfırlamak istiyorsa
        if (resetSet.has(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.suspiciousTime) return errorEmbed(messages.alreadyReset);

            suspicious.suspiciousTime = null;
            await database.updateGuild(guildId, {
                $set: {
                    "suspicious.suspiciousTime": null
                }
            });
            return errorEmbed(messages.successReset, "success");
        }

        const suspiciousTime = Time.parseTime(content);

        // Eğer şüpheli zamanını girmemişse hata döndür
        if (suspiciousTime == 0) return errorEmbed(
            messages.enter(prefix),
            "warn",
            30 * 1000 // Mesajı 30 saniye boyunca göster
        );

        suspicious.suspiciousTime = suspiciousTime;
        await database.updateGuild(guildId, {
            $set: {
                "suspicious.suspiciousTime": suspiciousTime
            }
        });
        return errorEmbed(
            messages.success(Time.duration(suspiciousTime, language)),
            "success"
        );

    },
};