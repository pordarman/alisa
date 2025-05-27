"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/06-AuthorizedCommands/Vip.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addSubcommand(subcommand => subcommand
                .setName("rol")
                .setDescription("VIP rolünü ayarlar (sıfırlamak için: sıfırla)")
                .addStringOption(option => option
                    .setName("rol")
                    .setDescription("VIP rolü")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("yetkili")
                .setDescription("VIP yetkili rolünü ayarlar (sıfırlamak için: sıfırla)")
                .addStringOption(option => option
                    .setName("rol")
                    .setDescription("VIP yetkili rolü")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("al")
                .setDescription("VIP rolünü bir üyeden alır")
                .addStringOption(option => option
                    .setName("üye")
                    .setDescription("VIP rolü alınacak üyenin etiketi veya ID'si")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("ver")
                .setDescription("VIP rolünü bir üyeye verir")
                .addStringOption(option => option
                    .setName("üye")
                    .setDescription("VIP rolü verilecek üyenin etiketi veya ID'si")
                    .setRequired(true)
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addSubcommand(subcommand => subcommand
                .setName("role")
                .setDescription("Sets the VIP role (to reset: reset)")
                .addStringOption(option => option
                    .setName("role")
                    .setDescription("VIP role")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("authorized")
                .setDescription("Sets the VIP authorized role (to reset: reset)")
                .addStringOption(option => option
                    .setName("role")
                    .setDescription("VIP authorized role")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("take")
                .setDescription("Takes the VIP role from a member")
                .addStringOption(option => option
                    .setName("member")
                    .setDescription("Tag or ID of the member who will be given the VIP role")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("give")
                .setDescription("Gives the VIP role to a member")
                .addStringOption(option => option
                    .setName("member")
                    .setDescription("Tag or ID of the member who will be given the VIP role")
                    .setRequired(true)
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
        let commandName = params.int.options.getSubcommand();
        let roleOrMember;
        switch (params.language) {
            case "tr":
                roleOrMember = params.int.options.getString("rol") || params.int.options.getString("üye");
                if (commandName == "ver") commandName = null; // Eğer komut "ver" ise null olacak
                break;
            case "en":
                roleOrMember = params.int.options.getString("role") || params.int.options.getString("member");
                if (commandName == "give") commandName = null; // If the command is "give", it will be null
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [commandName, roleOrMember],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};