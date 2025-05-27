"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/SetAgeRequired.js");

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
                .setName("ayar")
                .setDescription("Yaş zorunluluğunu açmak mı yoksa kapatmak mı istersiniz?")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Aç",
                        value: "aç"
                    },
                    {
                        name: "Kapat",
                        value: "kapat"
                    }
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("setting")
                .setDescription("Do you want to turn on or off the age requirement?")
                .setRequired(true)
                .addChoices(
                    {
                        name: "On",
                        value: "on"
                    },
                    {
                        name: "Off",
                        value: "off"
                    }
                )
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let setting;
        switch (params.language) {
            case "tr":
                setting = params.int.options.getString("ayar");
                break;
            case "en":
                setting = params.int.options.getString("setting");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [setting],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};