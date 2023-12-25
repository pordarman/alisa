"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "symbol", // Komutun ismi
    id: "sembol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "symbol",
        "setsysmbol",
        "sysmbolset",
        "set-symbol"
    ],
    description: "You set the symbol to be placed between the names", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>symbol <Symbol>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const newSymbol = args.join(" ");

        // Eğer sembolü girmediyse bilgilendirme mesajı gönder
        if (!newSymbol) return errorEmbed(
            `• To set the symbol **${prefix}${this.name} <Your symbol>**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn",
            15 * 1000 // Mesajı 15 saniye boyunca göster
        );

        // Eğer sembolü sıfırlamak istiyorsa
        if (newSymbol.toLocaleLowerCase(language) == "reset") {
            // Eğer sembol zaten sıfırlanmışsa
            if (!guildDatabase.register.symbol) return errorEmbed(`The symbol to be placed between the names has already been reset`);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.symbol = "";
            database.writeFile(guildDatabase, guildId);

            return errorEmbed(`The symbol to be placed between the names has been successfully reset`, "success");
        }

        // Eğer sembol uzunluğu sınırı aşıyorsa hata döndür
        if (newSymbol.length > Util.MAX.symbolLength) return errorEmbed(`Your symbol length can be up to ${Util.MAX.symbolLength} characters!`);

        // Eğer sembol zaten ayarlanan sembolse
        if (newSymbol === guildDatabase.register.symbol) return errorEmbed("The symbol to be placed between the names is the same as the symbol you have already written");

        // Tagı kaydet ve Database'ye kaydet
        guildDatabase.register.symbol = newSymbol;
        database.writeFile(guildDatabase, guildId);

        // Botun sembolü nasıl kullandığını göstermek için örnek göster
        const exampleName = Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            memberName: "Fearless Crazy",
            guildDatabase,
            inputAge: ["20"],
            isBot: false
        });

        return errorEmbed(
            `The symbol to be placed between names has been successfully set to **${newSymbol}**\n\n` +
            `**Example:**\n` +
            `${exampleName}`,
            "success"
        );

    },
};