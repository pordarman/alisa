"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/05-ModerationCommands/DeleteMessage.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .addIntegerOption(option => option
                .setName("sayı")
                .setDescription("Kaç mesaj silmek istiyorsunuz?")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(Util.MAX.messageDeleteCount)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .addIntegerOption(option => option
                .setName("count")
                .setDescription("How many messages do you want to delete?")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(Util.MAX.messageDeleteCount)
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let count;
        switch (params.language) {
            case "tr":
                count = params.int.options.getInteger("sayı");
                break;
            case "en":
                count = params.int.options.getInteger("count");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [count]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};