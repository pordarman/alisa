"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/SetAgeLimit.js");

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
                .setName("yaş")
                .setDescription("Yaş sınırı (eğer kaldırmak istiyorsanız \"kaldır\" yazın)")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("age")
                .setDescription("Age limit (if you want to remove, type \"remove\")")
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
        let age;
        switch (params.language) {
            case "tr":
                age = params.int.options.getString("yaş");
                break;
            case "en":
                age = params.int.options.getString("age");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [age],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};