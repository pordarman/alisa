"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/07-JailCommands/Tempjail.js");

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
                .setDescription("Jaile atılacak üye")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("süre")
                .setDescription("Jaile atma süresi")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("sebep")
                .setDescription("Jaile atma sebebi")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member to be jailed")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("time")
                .setDescription("Jail time")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("reason")
                .setDescription("Jail reason")
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