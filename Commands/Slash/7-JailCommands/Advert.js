"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/07-JailCommands/Advert.js");

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
                .setDescription("Reklam sebebiyle jaile atılacak üye")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("sebep")
                .setDescription("Jail sebebini (Girdiğiniz sebebin başına her zaman \"Reklam\" yazılır)")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member to be jailed for advertising")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("reason")
                .setDescription("Reason for the jail (\"Advertising\" is always written at the beginning of the reason)")
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
        let member, reason;
        switch (params.language) {
            case "tr":
                member = params.int.options.getMember("üye");
                reason = params.int.options.getString("sebep");
                break;
            case "en":
                member = params.int.options.getMember("member");
                reason = params.int.options.getString("reason");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [reason]
            },
            mentions: {
                member
            },
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};