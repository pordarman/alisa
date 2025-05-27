"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/SetAfterRegisterChannel.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addChannelOption(option => option
                .setName("kanal")
                .setDescription("Kayıt sonrası mesajların gönderileceği kanal")
                .setRequired(true)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addChannelOption(option => option
                .setName("channel")
                .setDescription("Channel where messages will be sent after registration")
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
        let channel;
        switch (params.language) {
            case "tr":
                channel = params.int.options.getChannel("kanal");
                break;
            case "en":
                channel = params.int.options.getChannel("channel");
                break;
        }

        Util.interactionToMessage(params, {
            mentions: {
                channel,
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};