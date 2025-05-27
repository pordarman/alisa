"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/SetCustomNames.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addSubcommand(subcommand => subcommand
                .setName("kayıt")
                .setDescription("Kayıt sırasında değiştirilecek ismi değiştirir")
                .addStringOption(option => option
                    .setName("isim")
                    .setDescription("Değiştirilecek isim (<tag>, <isim> ve <yaş> kullanılabilir) (sıfırlamak için: sıfırla)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("kayıtbot")
                .setDescription("Bot kayıt sırasında değiştirilecek ismi değiştirir")
                .addStringOption(option => option
                    .setName("isim")
                    .setDescription("Değiştirilecek isim (<tag> ve <isim> kullanılabilir) (sıfırlamak için: sıfırla)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("giriş")
                .setDescription("Kullanıcı sunucuya girdikten sonraki ismi değiştirir")
                .addStringOption(option => option
                    .setName("isim")
                    .setDescription("Değiştirilecek isim (<tag> ve <isim> kullanılabilir) (sıfırlamak için: sıfırla)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("girişbot")
                .setDescription("Bot sunucuya girdikten sonraki ismi değiştirir")
                .addStringOption(option => option
                    .setName("isim")
                    .setDescription("Değiştirilecek isim (<tag> ve <isim> kullanılabilir) (sıfırlamak için: sıfırla)")
                    .setRequired(true)
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addSubcommand(subcommand => subcommand
                .setName("register")
                .setDescription("Changes the name to be changed during registration")
                .addStringOption(option => option
                    .setName("name")
                    .setDescription("Name to change (<tag>, <name> and <age> can be used) (to reset: reset)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("registerbot")
                .setDescription("Changes the name to be changed during bot registration")
                .addStringOption(option => option
                    .setName("name")
                    .setDescription("Name to change (<tag> and <name> can be used) (to reset: reset)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("login")
                .setDescription("Changes the name after the user enters the server")
                .addStringOption(option => option
                    .setName("name")
                    .setDescription("Name to change (<tag> and <name> can be used) (to reset: reset)")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("loginbot")
                .setDescription("Changes the name after the bot enters the server")
                .addStringOption(option => option
                    .setName("name")
                    .setDescription("Name to change (<tag> and <name> can be used) (to reset: reset)")
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
        const subcommand = params.int.options.getSubcommand();
        let name;
        switch (params.language) {
            case "tr":
                name = params.int.options.getString("isim");
                break;
            case "en":
                name = params.int.options.getString("name");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [subcommand, name],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};