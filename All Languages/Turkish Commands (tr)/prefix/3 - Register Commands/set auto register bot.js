"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "bototo", // Komutun ismi
    id: "bototo", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "bototo",
        "bot-oto",
        "bototokayıt",
        "bot-oto-kayıt",
        "autoregisterbot",
        "auto-register-bot"
    ],
    description: "Botları otomatik olarak kayıt edilip edilmeyeceğini ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>bototo <aç veya kapat>", // Komutun kullanım şekli
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

            // Eğer botları otomatik kayıt etmeyi açmak istiyorsa
            case "aç":
            case "ac":
            case "açık":
            case "acik":
            case "aktif":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.register.isAutoRegisterForBot) return errorEmbed("Botları otomatik kayıt etme ayarım zaten __**açık**__ durumda");

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Botları otomatik kayıt etme ayarım başarıyla açıldı!`, "success");

            // Eğer botları otomatik kayıt etmeyi kapatmak istiyorsa
            case "kapat":
            case "kapalı":
            case "kapali":
            case "deaktif":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoRegisterForBot) return errorEmbed("Botları otomatik kayıt etme ayarım zaten __**kapalı**__ durumda");

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Botları otomatik kayıt etme ayarım başarıyla kapatıldı!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Botları otomatik kayıt etme ayarımı açmak için **${prefix}${this.name} aç**\n\n` +
                    `• Kapatmak için ise **${prefix}${this.name} kapat** yazabilirsiniz`,
                    "warn"
                )
        }

    },
};