"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/05-ModerationCommands/Unban.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addStringOption(option => option
                .setName("üye_id")
                .setDescription("Yasaklanması kaldırılacak üyenin ID'si")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addStringOption(option => option
                .setName("member_id")
                .setDescription("ID of the member to be unbanned")
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
        let memberId;
        switch (params.language) {
            case "tr":
                memberId = params.int.options.getString("üye_id");
                break;
            case "en":
                memberId = params.int.options.getString("member_id");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [memberId]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};