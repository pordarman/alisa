"use strict";
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/06-AuthorizedCommands/CreateEmoji.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
            .addStringOption(option => option
                .setName("emoji")
                .setDescription("Emoji, emoji ID'si veya emoji URL'si")
                .setRequired(false)
            )
            .addAttachmentOption(option => option
                .setName("dosya")
                .setDescription("Emoji dosyası")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("isim")
                .setDescription("Emojinin ismi (opsionel)")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
            .addStringOption(option => option
                .setName("emoji")
                .setDescription("Emoji, emoji ID or emoji URL")
                .setRequired(false)
            )
            .addAttachmentOption(option => option
                .setName("file")
                .setDescription("Emoji file")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("name")
                .setDescription("Name of the emoji (optional)")
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
        let emoji, name, file;
        switch (params.language) {
            case "tr":
                emoji = params.int.options.getString("emoji");
                name = params.int.options.getString("isim");
                file = params.int.options.getAttachment("dosya");
                break;
            case "en":
                emoji = params.int.options.getString("emoji");
                name = params.int.options.getString("name");
                file = params.int.options.getAttachment("file");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [emoji, name]
            },
            message: {
                attachments: file ? [file] : []
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    }
}