"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "register", // Komutun ismi
    id: "kayıtayar", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "register",
        "registersetting",
        "registersettings",
    ],
    description: "You turn the register setting on and off", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>register <on or off>", // Komutun kullanım şekli
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

            // Eğer kayıt ayarını açmak istiyorsa
            case "open":
            case "on":
            case "active":
                // Eğer kayıt ayarı zaten açıksa
                if (!guildDatabase.register.isRegisterOff) return errorEmbed("My register setting is already __**on**__ so you can do all registration operations");

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = false;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My register setting has been successfully opened, now you can do all registration operations!`, "success");

            // Eğer kayıt ayarını kapatmak istiyorsa
            case "off":
            case "close":
            case "deactive":
                // Eğer kayıt ayarı zaten kapalıysa
                if (guildDatabase.register.isRegisterOff) return errorEmbed("My register setting is already __**off**__ so you cannot do all recording operations");

                // Database'ye kaydet
                guildDatabase.register.isRegisterOff = true;
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My register setting has been closed successfully. From now on, you will not be able to perform any registration operations!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• You can type **${prefix}${this.name} open** to open my registry setting\n\n` +
                    `• To close it, you can type **${prefix}${this.name} close**`,
                    "warn"
                )
        }

    },
};