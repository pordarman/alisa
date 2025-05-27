"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: { // Komutun ismi
        tr: "erkek",
        en: "boy"
    },
    id: "erkek", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "erkek",
            "erkekkayıt",
            "e"
        ],
        en: [
            "boy",
            "boyregister",
            "male",
            "maleregister"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıyı erkek olarak kaydeder",
        en: "Registers the person as a boy"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>erkek <@kişi veya Kişi ID'si> <Yeni ismi>",
        en: "<px>boy <@user or User ID> <New name>"
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
            registerType: "boy",
            alisa,
            errorEmbed
        }).checkControlsAndRegister(args);
    },
};