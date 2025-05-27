"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "bototo",
        en: "botauto"
    },
    id: "bototo", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "bototo",
            "bot-oto",
            "bototokayıt",
            "bot-oto-kayıt",
            "autoregisterbot",
            "auto-register-bot"
        ],
        en: [
            "botauto",
            "bot-auto",
            "autoregisterbot",
            "auto-register-bot"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botları otomatik olarak kayıt edilip edilmeyeceğini ayarlarsınız",
        en: "You set whether to automatically register bots"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>bototo <aç veya kapat>",
        en: "<px>botauto <on or off>"
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
                bototo: messages
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

            // Eğer bot oto kayıt ayarını açmak istiyorsa
            case "on":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.register.isAutoRegisterForBot) return errorEmbed(onOffMessages.alreadyOn);

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = true;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAutoRegisterForBot": true
                    }
                });

                return errorEmbed(onOffMessages.successOn, "success");

            // Eğer bot oto kayıt ayarını kapatmak istiyorsa
            case "off":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoRegisterForBot) return errorEmbed(onOffMessages.alreadyOff);

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "register.isAutoRegisterForBot": false
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