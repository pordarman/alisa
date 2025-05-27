"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/01-BotCommands/Language.js");

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
                .setName("dil")
                .setDescription("Değiştirmek istediğiniz dil seçin")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Türkçe",
                        value: "türkçe"
                    },
                    {
                        name: "İngilizce",
                        value: "ingilizce"
                    }
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("language")
                .setDescription("Select the language you want to change")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Turkish",
                        value: "turkish"
                    },
                    {
                        name: "English",
                        value: "english"
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
        let language;
        switch (params.language) {
            case "tr":
                language = params.int.options.getString("dil");
                break;
            case "en":
                language = params.int.options.getString("language");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [language]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};