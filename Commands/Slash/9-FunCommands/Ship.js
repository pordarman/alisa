"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/09-FunCommands/Ship.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addUserOption(option => option
                .setName("kişi_1")
                .setDescription("Ship atılacak kişi")
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName("kişi_2")
                .setDescription("Ship atılacak kişi")
                .setRequired(false)
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addUserOption(option => option
                .setName("person_1")
                .setDescription("Person to ship")
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName("person_2")
                .setDescription("Person to ship")
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
        let member1, member2;
        switch (params.language) {
            case "tr":
                member1 = params.int.options.getMember("kişi_1");
                member2 = params.int.options.getMember("kişi_2");
                break;
            case "en":
                member1 = params.int.options.getMember("person_1");
                member2 = params.int.options.getMember("person_2");
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [member1, member2],
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};