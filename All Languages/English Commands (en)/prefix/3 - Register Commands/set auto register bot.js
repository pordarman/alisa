"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "botauto", // Komutun ismi
    id: "bototo", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "botauto",
        "bot-auto",
        "autoregisterbot",
        "auto-register-bot"
    ],
    description: "You set whether to automatically register bots", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>botauto <on or off>", // Komutun kullanım şekli
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

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer botları otomatik kayıt etmeyi açmak istiyorsa
            case "open":
            case "on":
            case "active":
                // Eğer kayıt ayarı zaten açıksa
                if (guildDatabase.register.isAutoRegisterForBot) return errorEmbed("My bot auto-register setting is already __**on**__");

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My automatic bot registration setting has been turned on successfully!`, "success");

            // Eğer botları otomatik kayıt etmeyi kapatmak istiyorsa
            case "off":
            case "close":
            case "deactive":
                // Eğer kayıt ayarı zaten kapalıysa
                if (!guildDatabase.register.isAutoRegisterForBot) return errorEmbed("My automatic bot registration setting is already __**off**__");

                // Database'ye kaydet
                guildDatabase.register.isAutoRegisterForBot = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My automatic bot registration setting has been successfully turned off!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• To turn on my automatic bot registration, you can type **${prefix}${this.name} on**\n\n` +
                    `• To close it, you can type **${prefix}${this.name} close**`,
                    "warn"
                )
        }

    },
};