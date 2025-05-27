"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "otoşüpheli",
        en: "autosuspect"
    },
    id: "otoşüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "otoşüpheli",
            "oto-şüpheli",
            "autosuspicious",
            "auto-suspicious",
        ],
        en: [
            "autosuspect",
            "autosuspicious",
            "auto-suspect",
            "auto-suspicious",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Oto şüpheliye atma ayarını açıp kapatırsınız",
        en: "You can turn the auto suspect setting on and off"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>otoşüpheli <aç veya kapat>",
        en: "<px>autosuspect <on or off>"
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
                otoşüpheli: messages
            },
            permissions: permissionMessages,
            onOrOff: allOnOffMessages,
            switchs: {
                onOrOff: onOffSwitchs
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const onOffMessages = allOnOffMessages(messages.optionName);

        switch (onOffSwitchs(args[0]?.toLocaleLowerCase(language))) {

            // Eğer otomatik şüpheli ayarını açmak istiyorsa
            case "on":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.suspicious.autoSuspicious) return errorEmbed(onOffMessages.alreadyOn);

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "suspicious.autoSuspicious": true
                    }
                });

                return errorEmbed(onOffMessages.successOn, "success");

            // Eğer otomatik şüpheli ayarını kapatmak istiyorsa
            case "off":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.suspicious.autoSuspicious) return errorEmbed(onOffMessages.alreadyOff);

                // Database'ye kaydet
                guildDatabase.suspicious.autoSuspicious = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "suspicious.autoSuspicious": false
                    }
                });

                return errorEmbed(onOffMessages.successOff, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn"
                )
        }

    },
};