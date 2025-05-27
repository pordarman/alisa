"use strict";
const Register = require("../../../Helpers/Functions/Register.js");

module.exports = {
    name: "registerAgain", // Butonun ismi
    id: "yeniden", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı önceki verilerle yeniden kayıt eder", // Butonun açıklaması
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
        splitCustomId
    }) {
        return new Register({
            msgOrInt: int,
            guildDatabase,
            guild,
            msgMember: int.member,
            guildMe: guild.members.me,
            language,
            alisa,
            errorEmbed,
            isAgainRegister: true,
        }).checkControlsAndRegister(splitCustomId[1]);
    },
};