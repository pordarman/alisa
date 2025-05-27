"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/06-AuthorizedCommands/ChangePrefix.js");

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
                .setName("prefix")
                .setDescription("Sunucunun yeni prefixi (sıfırlamak için: sıfırla)")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("prefix")
                .setDescription("New prefix of the server (to reset: reset)")
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
        let prefix;
        switch (params.language) {
            case "tr":
                prefix = params.int.options.getString("prefix");
                break;
            case "en":
                prefix = params.int.options.getString("prefix");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [prefix]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};