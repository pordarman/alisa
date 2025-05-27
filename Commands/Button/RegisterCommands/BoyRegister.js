"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: "registerBoy", // Butonun ismi
    id: "erkek", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı erkek olarak kayıt eder", // Butonun açıklaması
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
        extras
    }) {
        return new Register({
            msgOrInt: int,
            guildDatabase,
            guild,
            msgMember: int.member,
            guildMe: guild.members.me,
            language,
            registerType: "boy",
            alisa,
            errorEmbed,
            extras
        }).checkControlsAndRegister(splitCustomId[1]);
    },
};