"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/SetRegisterType.js");

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
                .setName("tür")
                .setDescription("Kayıt türünü")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Cinsiyetli kayıt",
                        value: "cinsiyet"
                    },
                    {
                        name: "Üye kayıt",
                        value: "üye"
                    }
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                .setName("type")
                .setDescription("Type of registration")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Gender registration",
                        value: "gender"
                    },
                    {
                        name: "Member registration",
                        value: "member"
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
        let type;
        switch (params.language) {
            case "tr":
                type = params.int.options.getString("tür");
                break;
            case "en":
                type = params.int.options.getString("type");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [type],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};