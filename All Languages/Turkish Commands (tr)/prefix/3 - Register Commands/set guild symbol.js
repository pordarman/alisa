"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "sembol", // Komutun ismi
    id: "sembol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sembol",
        "sembolayarla",
        "symbol-a",
        "setsembol",
        "sembolset",
        "set-symbol"
    ],
    description: "İsimlerin arasına konacak sembolü ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sembol <Sembol>", // Komutun kullanım şekli
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
        language
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const newSymbol = args.join(" ");

        // Eğer sembolü girmediyse bilgilendirme mesajı gönder
        if (!newSymbol) return errorEmbed(
            `• Sembolü ayarlamak için **${prefix}${this.name} <Sembolünüz>**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn",
            15 * 1000 // Mesajı 15 saniye boyunca göster
        );

        // Eğer sembolü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(newSymbol.toLocaleLowerCase(language))) {
            // Eğer sembol zaten sıfırlanmışsa
            if (!guildDatabase.register.symbol) return errorEmbed(`İsimlerin arasına konacak sembol zaten sıfırlanmış durumda`);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.symbol = "";
            database.writeFile(guildDatabase, guildId);

            return errorEmbed(`İsimlerin arasına konacak sembol başarıyla sıfırlandı`, "success");
        }

        // Eğer sembol uzunluğu sınırı aşıyorsa hata döndür
        if (newSymbol.length > Util.MAX.symbolLength) return errorEmbed(`Sembol uzunluğunuz en fazla ${Util.MAX.symbolLength} karakter olabilir!`);

        // Eğer sembol zaten ayarlanan sembolse
        if (newSymbol === guildDatabase.register.symbol) return errorEmbed("İsimlerin arasına konacak sembol zaten yazdığınız sembolle aynı");

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
            `İsimlerin arasına konacak sembol başarıyla **${newSymbol}** olarak ayarlandı\n\n` +
            `**Örnek:**\n` +
            `${exampleName}`,
            "success"
        );

    },
};