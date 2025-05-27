"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/04-RegisterCommands/ChangeName.js");

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
                .setDescription("İsmi değiştirilecek üye")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("isim")
                .setDescription("Üyenin ismi (Eğer yaş zoırunluluğu varsa yaş girilmesi zorunludur)")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("member")
                .setDescription("Member whose name will be changed")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("name")
                .setDescription("Name of the member (If there is an age requirement, the age must be entered)")
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
        let member, name;
        switch (params.language) {
            case "tr":
                member = params.int.options.getMember("üye");
                name = params.int.options.getString("isim");
                break;
            case "en":
                member = params.int.options.getMember("member");
                name = params.int.options.getString("name");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [name],
            },
            mentions: {
                member
            },
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};