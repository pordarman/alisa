"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıtayar",
        en: "registersetting"
    },
    id: "kayıtayar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtayar",
            "recordsetting",
            "recordsettings"
        ],
        en: [
            "registersetting",
            "registersettings",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt ayarını açıp kapatırsınız",
        en: "You turn the register setting on and off"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtayar <aç veya kapat>",
        en: "<px>registersetting <on or off>"
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
                kayıtayar: messages
            },
            permissions: permissionMessages,
            switchs: {
                onOrOff: onOffSwitchs
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (onOffSwitchs(args[0]?.toLocaleLowerCase(language))) {

            // Eğer kayıt ayarını açmak istiyorsa
            case "on":
                // Eğer kayıt ayarı zaten açıksa
                if (!guildDatabase.register.isRegisterOff) return errorEmbed(messages.on.already);

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isRegisterOff": false
                    }
                });

                return errorEmbed(messages.on.success, "success");

            // Eğer kayıt ayarını kapatmak istiyorsa
            case "off":
                // Eğer kayıt ayarı zaten kapalıysa
                if (guildDatabase.register.isRegisterOff) return errorEmbed(messages.off.already);

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isRegisterOff": true
                    }
                });

                return errorEmbed(messages.off.success, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn"
                )
        }

    },
};