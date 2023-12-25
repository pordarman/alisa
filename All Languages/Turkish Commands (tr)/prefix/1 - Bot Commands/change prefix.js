"use strict";
const {
    prefix: defaultPrefix
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "prefix", // Komutun ismi
    id: "prefix", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "prefix",
        "prefixayarla",
        "prefix-ayarla",
        "setprefix",
        "set-prefix",
    ],
    description: "Sunucuya özel prefixi değiştirir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>prefix <Yeni prefix>", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const newPrefix = args[0]?.toLocaleLowerCase(language);

        // Eğer yeni prefixi yazmadıysa bilgilendirme mesajı gönder
        if (!newPrefix) return errorEmbed(
            `Lütfen yeni prefixini yazınız\n\n` +
            `**Örnek:**\n` +
            `• ${prefix}prefix a!` +
            `• ${prefix}prefix sıfırla (prefixi varsayılan değere **(${defaultPrefix})** sıfırlar)`,
            "warn"
        );

        // Eğer değiştirmeye çalıştığı prefix şimdiki prefixle aynıysa
        if (newPrefix === defaultPrefix) return errorEmbed(`Botun prefixi zaten değiştirmeye çalıştığınız prefixle aynı şapşik şey seni :)`);

        // Eğer prefixi sıfırlamaya çalışıyorsa
        if ([defaultPrefix, "sıfırla", "sifirla"].includes(newPrefix)) {
            guildDatabase.prefix = defaultPrefix;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed(
                `Prefixiniz başarıyla varsayılan değere **(${defaultPrefix})** sıfırlandı!`,
                "success",
                null,
                {
                    fields: [
                        {
                            name: "Örnek",
                            value: `\`\`\`css\n` +
                                `${defaultPrefix}yardım\n` +
                                `${defaultPrefix}prefix\n` +
                                `${defaultPrefix}destek\n` +
                                `@${msg.client.user.tag} yardım\n\`\`\``
                        }
                    ]
                }
            );
        }

        // Prefixin uzunluğu 5'den uzunsa hata döndür
        if (newPrefix.length > 5) return errorEmbed(`Prefixiniz uzunluğunuz 5'den uzun olamaz!`);

        guildDatabase.prefix = newPrefix;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Prefixiniz başarıyla **${newPrefix}** olarak değiştirildi!`,
            "success",
            null,
            {
                fields: [
                    {
                        name: "Örnek",
                        value: `\`\`\`css\n` +
                            `${newPrefix}yardım\n` +
                            `${newPrefix}prefix\n` +
                            `${newPrefix}destek\n` +
                            `@${msg.client.user.tag} yardım\n\`\`\``
                    }
                ]
            }
        );

    },
};