"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "yaşsınır", // Komutun ismi
    id: "yaşsınır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yaşsınır",
        "yaş-sınır",
        "agelimit",
        "age-limit"
    ],
    description: "Kayıt için gereken yaş sınırını belirtir", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yaşsınır <Yaş>", // Komutun kullanım şekli
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
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const content = args[0]?.toLocaleLowerCase(language);
        const register = guildDatabase.register;

        // Eğer yaş sınırını kapatmak istiyorsa
        if (["kapat", "kapalı", "deaktif"].includes(content)) {
            // Eğer zaten sıfırlanmış ise
            if (!register.ageLimit) return errorEmbed("Yaş sınırı zaten sıfırlanmış durumda");

            delete register.ageLimit;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Yaş sınırı başarıyla sıfırlandı", "success");
        }

        const age = Number(content);

        // Eğer girdiği değer bir sayı değilse
        if (isNaN(age)) return errorEmbed(
            `• Yaş sınırını ayarlamak için **${prefix}${this.name} <yaş>**\n\n` +
            `• Kapatmak için ise **${prefix}${this.name} kapat** yazabilirsiniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}${this.name} 14\n` +
            `• ${prefix}${this.name} 9`,
            "warn"
        );

        // Eğer yaş sınırı 100'den büyükse
        if (age > 100) return errorEmbed("Lütfen yaş aralığınızı 0-100 arasında tutunuz")

        register.ageLimit = age;
        database.writeFile(guildDatabase, guildId);

        return errorEmbed(
            `Sunucunun yaş sınırı başarıyla **${age}** oldu! Bu yaşın altındaki kişilerin kayıt edilmesine izin vermeyeceğim`,
            "success"
        );

    },
};