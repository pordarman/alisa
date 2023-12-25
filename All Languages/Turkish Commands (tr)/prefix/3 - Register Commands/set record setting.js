"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıtayar", // Komutun ismi
    id: "kayıtayar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıtayar",
        "recordsetting",
        "recordsettings"
    ],
    description: "Kayıt ayarını açıp kapatırsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıtayar <aç veya kapat>", // Komutun kullanım şekli
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

            // Eğer kayıt ayarını açmak istiyorsa
            case "aç":
            case "ac":
            case "açık":
            case "acik":
            case "aktif":
                // Eğer kayıt ayarı zaten açıksa
                if (!guildDatabase.register.isRegisterOff) return errorEmbed("Kayıt ayarım zaten __**açık**__ durumda yani tüm kayıt işlemlerini yapabilirsiniz");

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Kayıt ayarım başarıyla açıldı bundan sonra tüm kayıt işlemlerini yapabilirsiniz!`, "success");

            // Eğer kayıt ayarını kapatmak istiyorsa
            case "kapat":
            case "kapalı":
            case "kapali":
            case "deaktif":
                // Eğer kayıt ayarı zaten kapalıysa
                if (guildDatabase.register.isRegisterOff) return errorEmbed("Kayıt ayarım zaten __**kapalı**__ durumda yani tüm kayıt işlemlerini yapamazsınız");

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Kayıt ayarım başarıyla kapatıldı bundan sonra tüm kayıt işlemlerini __yapamazsınız__!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Kayıt ayarımı açmak için **${prefix}${this.name} aç**\n\n` +
                    `• Kapatmak için ise **${prefix}${this.name} kapat** yazabilirsiniz`,
                    "warn"
                )
        }

    },
};