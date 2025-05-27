"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: { // Komutun ismi
        tr: "bot",
        en: "bot"
    },
    id: "bot", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "b",
            "bot",
            "botkayıt",
        ],
        en: [
            "b",
            "bot",
            "botregister",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botu kayıt eder",
        en: "Register the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>bot <@bot veya Bot ID'si> [Yeni ismi]",
        en: "<px>bot <@bot or Bot ID> [New name]"
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
            registerType: "bot",
            alisa,
            errorEmbed
        }).checkControlsAndRegister(args);
    },
};