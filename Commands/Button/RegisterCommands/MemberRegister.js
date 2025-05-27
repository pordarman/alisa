"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: "registerMember", // Butonun ismi
    id: "kayıt", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı üye olarak kayıt eder", // Butonun açıklaması
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
        splitCustomId,
        guild,
        errorEmbed,
        language,
        extras
    }) {
        return new Register({
            msgOrInt: int,
            guildDatabase,
            guild,
            msgMember: int.member,
            guildMe: guild.members.me,
            language,
            registerType: "member",
            alisa,
            errorEmbed,
            extras
        }).checkControlsAndRegister(splitCustomId[1]);
    },
};