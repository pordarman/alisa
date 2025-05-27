"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "statayar",
        en: "statsetting"
    },
    id: "statayar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "statayar",
            "statsetting",
            "statsettings"
        ],
        en: [
            "statsetting",
            "statsettings",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Stat ayarını açıp kapatırsınız (Eğer kapatırsanız bütün statlar sıfırlanır)",
        en: "You turn the stat setting on and off (If you turn it off, all stats will be reset)"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "İstatistik komutları",
        en: "Statistics commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>statayar <aç veya kapat>",
        en: "<px>statsetting <on or off>"
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
                statayar: messages
            },
            permissions: permissionMessages,
            switchs: {
                onOrOff: onOffSwitchs
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (onOffSwitchs(args[0]?.toLocaleLowerCase(language))) {

            // Eğer stat ayarını açmak istiyorsa
            case "on":
                // Eğer stat ayarı zaten açıksa
                if (guildDatabase.isStatOn) return errorEmbed(messages.on.already);

                // Database'ye kaydet
                guildDatabase.isStatOn = true;
                await database.updateGuild(guildId, {
                    $set: {
                        isStatOn: true
                    }
                });

                return errorEmbed(messages.on.success, "success");

            // Eğer stat ayarını kapatmak istiyorsa
            case "off":
                // Eğer stat ayarı zaten kapalıysa
                if (!guildDatabase.isStatOn) return errorEmbed(messages.off.already);

                // Database'ye kaydet
                guildDatabase.isStatOn = false;
                await database.updateGuild(guildId, {
                    $set: {
                        "isStatOn": false
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