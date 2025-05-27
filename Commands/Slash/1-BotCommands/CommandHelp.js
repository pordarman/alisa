"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/01-BotCommands/CommandHelp");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addStringOption(option => option
                .setName("komut")
                .setDescription("Bilgi almak istediğiniz komutun adını girin")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addStringOption(option => option
                .setName("command")
                .setDescription("Enter the name of the command you want to get information about")
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
        let commandName;
        switch (params.language) {
            case "tr":
                commandName = params.int.options.getString("komut");
                break;
            case "en":
                commandName = params.int.options.getString("command");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [commandName]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};