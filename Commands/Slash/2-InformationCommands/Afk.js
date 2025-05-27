"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/02-InformationCommands/Afk.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addStringOption(option => option
                .setName("sebep")
                .setDescription("AFK olma sebebiniz")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addStringOption(option => option
                .setName("reason")
                .setDescription("Your reason for being AFK")
                .setRequired(false)
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let reason;
        switch (params.language) {
            case "tr":
                reason = params.int.options.getString("sebep");
                break;
            case "en":
                reason = params.int.options.getString("reason");
                break;
        }
        reason ||= "";

        Util.interactionToMessage(params, {
            message: {
                content: reason
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};