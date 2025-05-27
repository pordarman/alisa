"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const Time = require("../../../Helpers/Time");

module.exports = {
    name: { // Komutun ismi
        tr: "yaşsınır",
        en: "agelimit"
    },
    id: "yaşsınır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yaşsınır",
            "yaş-sınır",
            "agelimit",
            "age-limit"
        ],
        en: [
            "agelimit",
            "age-limit"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt için gereken yaş sınırını belirtir",
        en: "Specifies the age limit required for registration"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yaşsınır <Yaş>",
        en: "<px>agelimit <Age>"
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
                "yaşsınır": messages
            },
            permissions: permissionMessages,
            switchs: {
                onOrOff: onOffSwitchs
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const content = args[0]?.toLocaleLowerCase(language);
        const register = guildDatabase.register;

        // Eğer yaş sınırını kapatmak istiyorsa
        if (onOffSwitchs(content) === "off") {
            // Eğer zaten sıfırlanmış ise
            if (!register.ageLimit) return errorEmbed(messages.alreadyReset);

            register.ageLimit = null;
            await database.updateGuild(guildId, {
                $aet: {
                    "register.ageLimit": null
                }
            });
            return errorEmbed(messages.successReset, "success");
        }

        // Eğer girdiği değer bir sayı değilse
        if (!Time.isNumber(content)) return errorEmbed(
            messages.enter(prefix)
        );

        const age = Number(content);

        // Eğer yaş sınırı 100'den büyükse
        if (age < 0 || age > 100) return errorEmbed(messages.notValid)

        register.ageLimit = age;
        await database.updateGuild(guildId, {
            $set: {
                "register.ageLimit": age
            }
        });

        return errorEmbed(
            messages.successSet(age),
            "success"
        );

    },
};