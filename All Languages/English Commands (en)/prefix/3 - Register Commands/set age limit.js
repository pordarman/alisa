"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "agelimit", // Komutun ismi
    id: "yaşsınır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "agelimit",
        "age-limit"
    ],
    description: "Specifies the age limit required for registration", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>agelimit <Age>", // Komutun kullanım şekli
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
        language,
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const content = args[0]?.toLocaleLowerCase(language);
        const register = guildDatabase.register;

        // Eğer yaş sınırını kapatmak istiyorsa
        if (["off", "close", "deactive"].includes(content)) {
            // Eğer zaten sıfırlanmış ise
            if (!register.ageLimit) return errorEmbed("The age limit has already been reset");

            delete register.ageLimit;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Age limit successfully reset", "success");
        }

        const age = Number(content);

        // Eğer girdiği değer bir sayı değilse
        if (isNaN(age)) return errorEmbed(
            `• To set the age limit **${prefix}${this.name} <age>**\n\n` +
            `• To close it, you can type **${prefix}${this.name} close**\n\n` +
            `**Example**\n` +
            `• ${prefix}${this.name} 14\n` +
            `• ${prefix}${this.name} 9`
        );

        // Eğer yaş sınırı 100'den büyükse
        if (age > 100) return errorEmbed("Please keep your age range between 0-100")

        register.ageLimit = age;
        database.writeFile(guildDatabase, guildId);

        return errorEmbed(
            `The server's age limit has been successfully changed to **${age}**! I will not allow people under this age to be registered`,
            "success"
        );

    },
};