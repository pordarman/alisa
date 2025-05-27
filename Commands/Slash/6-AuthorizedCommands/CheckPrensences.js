"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/06-AuthorizedCommands/CheckPrensences.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("durum")
                .setDescription("Kontrol edilecek durumu belirler (<oyun/izliyor/dinliyor/özel> veya reklam/link)")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("status")
                .setDescription("Determines the status to be checked (<game/watching/listening/custom> or ad/link)")
                .setRequired(true)
            )
    },
    care: true, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let status;
        switch (params.language) {
            case "tr":
                status = params.int.options.getString("durum");
                break;
            case "en":
                status = params.int.options.getString("status");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [status]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};