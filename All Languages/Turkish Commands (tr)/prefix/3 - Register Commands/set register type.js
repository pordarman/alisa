"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kayıttür", // Komutun ismi
    id: "kayıttür", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kayıttür",
        "kayıttür",
        "kayıt-türü",
        "registertype",
        "register-type",
    ],
    description: "Kayıt türünüzü değiştirirsiniz", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kayıttür <Cinsiyet veya Normal>", // Komutun kullanım şekli
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

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer kayıt türüni "normal" istiyorsa
            case "normal":
            case "üye":
            case "uye":
            case "tekrol":
                // Eğer kayıt türü zaten "normal" ise
                if (guildDatabase.register.type == "normal") return errorEmbed("Kayıt türüm zaten __**Normal Kayıt**__ durumda");

                // Database'ye kaydet ve kız ve erkek rollerini temizle
                guildDatabase.register.type = "normal";
                guildDatabase.register.roleIds.girl = [];
                guildDatabase.register.roleIds.boy = [];
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Kayıt türüm başarıyla "Normal Kayıt" oldu!`, "success");

            // Eğer kayıt türüni "cinsiyet" istiyorsa
            case "cinsiyet":
            case "kızerkek":
            case "kizerkek":
            case "erkekkız":
            case "erkekkiz":
            case "gender":
                // Eğer kayıt türü zaten "cinsiyet" ise
                if (guildDatabase.register.type == "gender") return errorEmbed("Kayıt türüm zaten __**Cinsiyet**__ durumda");

                // Database'ye kaydet
                guildDatabase.register.type = "gender";
                guildDatabase.register.roleIds.normal = [];
                database.writeFile(guildDatabase, guildId);

                return errorEmbed(`Kayıt türüm başarıyla "Cinsiyet" oldu!`, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    `• Kayıt türünü "Normal Kayıt" yapmak için **${prefix}${this.name} normal**\n\n` +
                    `• "Cinsiyet" yapmak için ise **${prefix}${this.name} cinsiyet** yazabilirsiniz`,
                    "warn"
                )
        }

    },
};