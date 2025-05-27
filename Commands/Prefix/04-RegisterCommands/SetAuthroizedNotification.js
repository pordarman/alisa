"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yetkilietiket",
        en: "authnotif"
    },
    id: "yetkilietiket", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yetkilietiket",
            "yetkili-etiket",
            "yetkili-etiket-ayarla",
            "yetkilibildirim",
            "yetkili-bildirim",
            "yetkili-bildirim-ayarla",
        ],
        en: [
            "authnotif",
            "authorized-notification",
            "authorized-notification-set",
            "setauthnotif",
            "setauthorizednotification",
            "authorizednotification",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Birisi sunucuya giriş yapınca yetkili rolünü etiketleyip etiketlemeyeceğini ayarlarsınız",
        en: "You set whether someone will be mentioned with the authoritative role when they login to the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yetkilietiket <aç veya kapat>",
        en: "<px>authnotif <on or off>"
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
                yetkilietiket: messages
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

            // Eğer yetkili etiket ayarını açmak istiyorsa
            case "on":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.register.isAuthroizedNotificationOn) return errorEmbed(onOffMessages.alreadyOn);

                // Database'ye kaydet
                guildDatabase.register.isAuthroizedNotificationOn = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAuthroizedNotificationOn": true
                    }
                });

                return errorEmbed(onOffMessages.successOn, "success");

            // Eğer yetkili etiket ayarını kapatmak istiyorsa
            case "off":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.register.isAuthroizedNotificationOn) return errorEmbed(onOffMessages.alreadyOff);

                // Database'ye kaydet
                guildDatabase.register.isAuthroizedNotificationOn = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAuthroizedNotificationOn": false
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