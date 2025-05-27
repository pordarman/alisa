"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/09-FunCommands/Write.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addStringOption(option => option
                .setName("mesaj")
                .setDescription("Yazılacak mesaj")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("mesaj_id")
                .setDescription("Alıntılanacak mesajın ID'si")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addStringOption(option => option
                .setName("message")
                .setDescription("Message to write")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("message_id")
                .setDescription("ID of the message to be quoted")
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
        let message, messageId;
        switch (params.language) {
            case "tr":
                message = params.int.options.getString("mesaj");
                messageId = params.int.options.getString("mesaj_id");
                break;
            case "en":
                message = params.int.options.getString("message");
                messageId = params.int.options.getString("message_id");
                break;
        }

        Util.interactionToMessage(params, {
            message: {
                content: message,
                reference: {
                    messageId
                }
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};