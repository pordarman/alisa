"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kız",
        en: "girl"
    },
    id: "kız", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kız",
            "kızkayıt",
            "k"
        ],
        en: [
            "girl",
            "girlregister",
            "female",
            "femaleregister",
            "g"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı kız olarak kaydeder",
        en: "Registers the person as a girl"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kız <@kişi veya Kişi ID'si> <Yeni ismi>",
        en: "<px>girl <@user or User ID> <New name>"
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
        alisa,
        msg,
        guildDatabase,
        guildMe,
        guild,
        msgMember,
        language,
        errorEmbed,
        args
    }) {
        return new Register({
            msgOrInt: msg,
            guildDatabase,
            guild,
            msgMember,
            guildMe,
            language,
            registerType: "girl",
            alisa,
            errorEmbed
        }).checkControlsAndRegister(args);
    },
};