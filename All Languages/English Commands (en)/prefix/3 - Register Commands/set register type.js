"use strict";
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "registertype", // Komutun ismi
    id: "kayıttür", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "registertype",
        "register-type",
    ],
    description: "You change your register type", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>registertype <Gender or Normal>", // Komutun kullanım şekli
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
        msg,
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

            // Eğer kayıt türüni "normal" istiyorsa
            case "normal":
                // Eğer kayıt türü zaten "normal" ise
                if (guildDatabase.register.type == "normal") return errorEmbed("My register type is already __**Normal Registration**__");

                // Database'ye kaydet ve kız ve erkek rollerini temizle
                guildDatabase.register.type = "normal";
                guildDatabase.register.roleIds.girl = [];
                guildDatabase.register.roleIds.boy = [];
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My register type is successfully changed to "Normal Registration"!`, "success");

            // Eğer kayıt türüni "cinsiyet" istiyorsa
            case "gender":
                // Eğer kayıt türü zaten "cinsiyet" ise
                if (guildDatabase.register.type == "gender") return errorEmbed("My record type is already __**Gender**__");

                // Database'ye kaydet
                guildDatabase.register.type = "gender";
                guildDatabase.register.roleIds.normal = [];
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`My record type is successfully changed to "Gender"!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• To change the register type to "Normal Registration" **${prefix}${this.name} normal**\n\n` +
                    `• To set "gender" you can type **${prefix}${this.name} gender**`,
                    "warn"
                )
        }

    },
};