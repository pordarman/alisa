"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "şüphelizaman", // Komutun ismi
    id: "şüphelizaman", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "şüphelizaman",
        "şüpheli-zaman",
        "suspicioustime",
        "suspicious-time"
    ],
    description: "Bir kişiyi şüpheli olarak göstermek için gereken süreyi ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>şüphelizaman <Süre>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const content = args.join(" ");
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan şüpheli süresini sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.suspiciousTime) return errorEmbed("Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli süre sıfırlanmış durumda");

            delete suspicious.suspiciousTime;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Sunucuya yeni giren kullanıcıların şüpheli olarak gözükmesi için gerekli süre başarıyla sıfırlandı", "success");
        }

        let suspiciousTime = 0;

        const TIMES = {
            SECOND: 1000,
            MINUTE: 60 * 1000,
            HOUR: 60 * 60 * 1000,
            DAY: 24 * 60 * 60 * 1000,
            WEEK: 7 * 24 * 60 * 60 * 1000,
            MONTH: 30 * 24 * 60 * 60 * 1000,
            YEAR: 365.25 * 24 * 60 * 60 * 1000
        }

        // Yazının içindeki bütün zaman değerlerini çek ve sil
        content.match(/(?<!\d)\d{1,5} ?\S+/gi)?.forEach(match => {
            let multi;

            const [num, unit] = match.split(" ");

            switch (unit) {
                case "saniye":
                case "sn":
                case "second":
                case "sec":
                case "seconds":
                case "s":
                    multi = TIMES.SECOND;
                    break;

                case "dakika":
                case "minute":
                case "min":
                case "minutes":
                case "dk":
                case "m":
                    multi = TIMES.MINUTE;
                    break;

                case "saat":
                case "hour":
                case "hours":
                case "h":
                    multi = TIMES.HOUR;
                    break;

                case "gün":
                case "gun":
                case "day":
                case "days":
                case "d":
                    multi = TIMES.DAY;
                    break;

                case "hafta":
                case "week":
                case "weeks":
                case "w":
                    multi = TIMES.WEEK;
                    break;

                case "ay":
                case "month":
                case "months":
                    multi = TIMES.MONTH;
                    break;

                case "yıl":
                case "y":
                case "year":
                case "years":
                    multi = TIMES.YEAR;
                    break;

                default:
                    return match;
            }

            suspiciousTime += num * multi;
        })

        // Eğer şüpheli zamanını girmemişse hata döndür
        if (suspiciousTime == 0) return errorEmbed(
            `Lütfen bir süre giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}${this.name} 1 gün 5 saat 6 dakika 30 saniye\n` +
            `• ${prefix}${this.name} 3 hafta`,
            "warn",
            20 * 1000 // Mesajı 20 saniye boyunca göster
        );

        suspicious.suspiciousTime = suspiciousTime;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra hesabı **${Time.duration(suspiciousTime, language)}** içinde açılan kişiler şüpheli olarak gözükecektir`,
            "success"
        );

    },
};