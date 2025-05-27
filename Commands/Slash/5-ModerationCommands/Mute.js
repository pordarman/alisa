"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/05-ModerationCommands/Mute.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addUserOption(option => option
                .setName("üye")
                .setDescription("Susturulacak üye")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("süre")
                .setDescription("Susturma süresi")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("sebep")
                .setDescription("Susturma sebebi")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member to be muted")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("time")
                .setDescription("Mute time")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("reason")
                .setDescription("Mute reason")
                .setRequired(false)
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        let member, time, reason;
        switch (params.language) {
            case "tr":
                member = params.int.options.getMember("üye");
                time = params.int.options.getString("süre");
                reason = params.int.options.getString("sebep");
                break;
            case "en":
                member = params.int.options.getMember("member");
                time = params.int.options.getString("time");
                reason = params.int.options.getString("reason");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [time, reason]
            },
            mentions: {
                member
            },
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};