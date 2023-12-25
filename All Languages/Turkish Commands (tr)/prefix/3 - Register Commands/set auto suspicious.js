"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "otoşüpheli", // Komutun ismi
    id: "otoşüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "otoşüpheli",
        "oto-şüpheli",
        "autosuspicious",
        "auto-suspicious",
    ],
    description: "Oto şüpheliye atma ayarını açıp kapatırsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>otoşüpheli <aç veya kapat>", // Komutun kullanım şekli
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

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer oto şüpheli ayarını açmak istiyorsa
            case "aç":
            case "ac":
            case "açık":
            case "acik":
            case "aktif":
                // Eğer oto şüpheli ayarı zaten açıksa
                if (guildDatabase.suspicious.autoSuspicious) return errorEmbed("Oto şüpheli ayarım zaten __**açık**__ durumda");

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Oto şüpheli ayarım başarıyla açıldı!`, "success");

            // Eğer oto şüpheli ayarını kapatmak istiyorsa
            case "kapat":
            case "kapalı":
            case "kapali":
            case "deaktif":
                // Eğer oto şüpheli ayarı zaten kapalıysa
                if (!guildDatabase.suspicious.autoSuspicious) return errorEmbed("Oto şüpheli ayarım zaten __**kapalı**__ durumda");

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Oto şüpheli ayarım başarıyla kapatıldı!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Oto şüpheli ayarımı açmak için **${prefix}${this.name} aç**\n\n` +
                    `• Kapatmak için ise **${prefix}${this.name} kapat** yazabilirsiniz`,
                    "warn"
                )
        }

    },
};