"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "otodüzeltme", // Komutun ismi
    id: "otodüzeltme", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "otodüzeltme",
        "oto-düzeltme",
        "autocorrect",
        "auto-correct",
    ],
    description: "Oto düzeltme ayarını açıp kapatırsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>otodüzeltme <aç veya kapat>", // Komutun kullanım şekli
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

            // Eğer oto düzeltme ayarını açmak istiyorsa
            case "aç":
            case "ac":
            case "açık":
            case "acik":
            case "aktif":
                // Eğer oto düzeltme ayarı zaten açıksa
                if (guildDatabase.register.isAutoCorrectOn) return errorEmbed("Oto düzeltme ayarım zaten __**açık**__ durumda");

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Oto düzeltme ayarım başarıyla açıldı!`, "success");

            // Eğer oto düzeltme ayarını kapatmak istiyorsa
            case "kapat":
            case "kapalı":
            case "kapali":
            case "deaktif":
                // Eğer oto düzeltme ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoCorrectOn) return errorEmbed("Oto düzeltme ayarım zaten __**kapalı**__ durumda");

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Oto düzeltme ayarım başarıyla kapatıldı!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Oto düzeltme ayarımı açmak için **${prefix}${this.name} aç**\n\n` +
                    `• Kapatmak için ise **${prefix}${this.name} kapat** yazabilirsiniz`,
                    "warn"
                )
        }

    },
};