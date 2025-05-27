"use strict";
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kayıttür",
        en: "registertype"
    },
    id: "kayıttür", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıttür",
            "kayıttür",
            "kayıt-türü",
            "registertype",
            "register-type",
        ],
        en: [
            "registertype",
            "register-type",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt türünüzü değiştirirsiniz",
        en: "You change your register type"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıttür <Cinsiyet veya Üye>",
        en: "<px>registertype <Gender or Member>"
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
                kayıttür: messages
            },
            permissions: permissionMessages,
            switchs: {
                setRegisterType: switchKey
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {

            // Eğer kayıt türüni "member" istiyorsa
            case "member":
                // Eğer kayıt türü zaten "member" ise
                if (guildDatabase.register.type == "member") return errorEmbed(messages.member.already);

                // Database'ye kaydet ve kız ve erkek rollerini temizle
                guildDatabase.register.type = "member";
                guildDatabase.register.roleIds.girl = [];
                guildDatabase.register.roleIds.boy = [];
                await database.updateGuild(guildId, {
                    $set: {
                        "register.type": "member",
                        "register.roleIds.girl": [],
                        "register.roleIds.boy": []
                    }
                });

                return errorEmbed(messages.member.success, "success");

            // Eğer kayıt türüni "cinsiyet" istiyorsa
            case "gender":
                // Eğer kayıt türü zaten "cinsiyet" ise
                if (guildDatabase.register.type == "gender") return errorEmbed(messages.gender.already);

                // Database'ye kaydet
                guildDatabase.register.type = "gender";
                guildDatabase.register.roleIds.member = [];
                await database.updateGuild(guildId, {
                    $set: {
                        "register.type": "gender",
                        "register.roleIds.member": []
                    }
                });

                return errorEmbed(messages.gender.success, "success");

            // Eğer geçerli bir şey girmediyse bilgilendirme mesajı gönder
            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn"
                )
        }

    },
};