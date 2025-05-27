"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: "registerBot", // Butonun ismi
    id: "bot", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Botu bot olarak kayıt eder", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        alisa,
        guildDatabase,
        int,
        guild,
        errorEmbed,
        language,
        splitCustomId,
    }) {
        return new Register({
            msgOrInt: int,
            guildDatabase,
            guild,
            msgMember: int.member,
            guildMe: guild.members.me,
            language,
            registerType: "bot",
            alisa,
            errorEmbed
        }).checkControlsAndRegister(splitCustomId[1]);
    },
};