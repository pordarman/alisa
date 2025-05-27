"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/02-InformationCommands/Permissions.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addRoleOption(option => option
                .setName("rol")
                .setDescription("Yetkileri gösterilecek rol")
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName("üye")
                .setDescription("Yetkileri gösterilecek üye")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addRoleOption(option => option
                .setName("role")
                .setDescription("Role whose permissions will be shown")
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member whose permissions will be shown")
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
        let role, member;
        switch (params.language) {
            case "tr":
                role = params.int.options.getRole("rol");
                member = params.int.options.getMember("üye");
                break;
            case "en":
                role = params.int.options.getRole("role");
                member = params.int.options.getMember("member");
                break;
        }

        Util.interactionToMessage(params, {
            mentions: {
                role,
                member
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};