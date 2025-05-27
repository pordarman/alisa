"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "otodüzeltme",
        en: "autocorrect"
    },
    id: "otodüzeltme", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "otodüzeltme",
            "oto-düzeltme",
            "autocorrect",
            "auto-correct",
        ],
        en: [
            "autocorrect",
            "auto-correct",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Oto düzeltme ayarını açıp kapatırsınız",
        en: "You turn the autocorrect setting on and off"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>otodüzeltme <aç veya kapat>",
        en: "<px>autocorrect <on or off>"
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
                otodüzeltme: messages
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

            // Eğer oto düzeltme ayarını açmak istiyorsa
            case "on":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.register.isAutoCorrectOn) return errorEmbed(onOffMessages.alreadyOn);

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAutoCorrectOn": true
                    }
                });

                return errorEmbed(onOffMessages.successOn, "success");

            // Eğer oto düzeltme ayarını kapatmak istiyorsa
            case "off":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoCorrectOn) return errorEmbed(onOffMessages.alreadyOff);

                // Database'ye kaydet
                guildDatabase.register.isAutoCorrectOn = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAutoCorrectOn": false
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