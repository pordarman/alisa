"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/01-BotCommands/Alisa");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addStringOption(option => option
                .setName("seçenek")
                .setDescription("Görmek istediğiniz veriyi seçin")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Lider Tablosu",
                        value: "sıralama"
                    },
                    {
                        name: "Komut kullanımları",
                        value: "komutlar"
                    },
                    {
                        name: "Toplam kayıt verileri",
                        value: "toplam"
                    },
                    {
                        name: "Sunucu kayıt sıralaması",
                        value: "sunucular"
                    },
                    {
                        name: "Alisa kim?",
                        value: "kim"
                    }
                )
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addStringOption(option => option
                .setName("option")
                .setDescription("Select the data you want to see")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Leaderboard",
                        value: "leaderboard"
                    },
                    {
                        name: "Command uses",
                        value: "commands"
                    },
                    {
                        name: "Total register data",
                        value: "total"
                    },
                    {
                        name: "Guild register order",
                        value: "guilds"
                    },
                    {
                        name: "Who is Alisa?",
                        value: "who"
                    }
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
        let option;
        switch (params.language) {
            case "tr":
                option = params.int.options.get("seçenek")?.value;
                break;
            case "en":
                option = params.int.options.get("option")?.value;
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args: [option]
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    }
};