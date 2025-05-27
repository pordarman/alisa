"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/07-JailCommands/Unjail.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addUserOption(option => option
                .setName("üye")
                .setDescription("Jail'den çıkarılacak üye")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member to be unjailed")
                .setRequired(true)
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let member;
        switch (params.language) {
            case "tr":
                member = params.int.options.getMember("üye");
                break;
            case "en":
                member = params.int.options.getMember("member");
                break;
        }

        Util.interactionToMessage(params, {
            mentions: {
                member
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};