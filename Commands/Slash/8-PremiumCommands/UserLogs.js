"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/08-PremiumCommands/UserLogs.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addUserOption(option => option
                .setName("kullanıcı")
                .setDescription("Bilgilerini görmek istediğiniz kullanıcı")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("user")
                .setDescription("User whose information you want to see")
                .setRequired(false)
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let user;
        switch (params.language) {
            case "tr":
                user = params.int.options.getUser("kullanıcı");
                break;
            case "en":
                user = params.int.options.getUser("user");
                break;
        }
        user ||= params.int.user;

        Util.interactionToMessage(params, {
            mentions: {
                user
            },
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};