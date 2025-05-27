"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sembol",
        en: "symbol"
    },
    id: "sembol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sembol",
            "sembolayarla",
            "symbol-a",
            "setsembol",
            "sembolset",
            "set-symbol"
        ],
        en: [
            "symbol",
            "setsysmbol",
            "sysmbolset",
            "set-symbol"
        ]
    },
    description: { // Komutun açıklaması
        tr: "İsimlerin arasına konacak sembolü ayarlarsınız",
        en: "You set the symbol to be placed between the names"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sembol <Sembol>",
        en: "<px>symbol <Symbol>"
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
                sembol: messages
            },
            permissions: permissionMessages,
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const newSymbol = args.join(" ");

        // Eğer sembolü girmediyse bilgilendirme mesajı gönder
        if (!newSymbol) return errorEmbed(
            messages.enter(prefix),
            "warn",
            30 * 1000 // Mesajı 30 saniye boyunca göster
        );

        // Eğer sembolü sıfırlamak istiyorsa
        if (resetSet.has(newSymbol.toLocaleLowerCase(language))) {
            // Eğer sembol zaten sıfırlanmışsa
            if (!guildDatabase.register.symbol) return errorEmbed(messages.alreadyReset);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.symbol = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.symbol": ""
                }
            });

            return errorEmbed(messages.successReset, "success");
        }

        // Eğer sembol uzunluğu sınırı aşıyorsa hata döndür
        if (newSymbol.length > Util.MAX.symbolLength) return errorEmbed(messages.maxError(Util.MAX.symbolLength));

        // Eğer sembol zaten ayarlanan sembolse
        if (newSymbol === guildDatabase.register.symbol) return errorEmbed(messages.sameSymbol);

        // Tagı kaydet ve Database'ye kaydet
        guildDatabase.register.symbol = newSymbol;
        await database.updateGuild(guildId, {
            $set: {
                "register.symbol": guildDatabase.register.symbol
            }
        });

        // Botun sembolü nasıl kullandığını göstermek için örnek göster
        const exampleName = Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            name: "Fearless Crazy",
            guildDatabase,
            age: "20",
            isBot: false
        });

        return errorEmbed(
            messages.success({
                symbol: newSymbol,
                example: exampleName
            }),
            "success"
        );

    },
};