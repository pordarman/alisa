"use strict";
const {
    SlashCommandBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const prefixCommand = require("../../Prefix/01-BotCommands/Premium.js");

module.exports = {
    name: prefixCommand.name, // Komutun ismi
    id: prefixCommand.id, // Komutun ID'si
    cooldown: prefixCommand.cooldown, // Komutun bekleme süresi
    data: { // Komutun verileri
        tr: new SlashCommandBuilder()
            .setName(prefixCommand.name.tr)
            .setDescription(prefixCommand.description.tr)
            .addSubcommand(subcommand => subcommand
                .setName("kullan")
                .setDescription("Premium kodunuzu kullanmanızı sağlar")
                .addStringOption(option => option
                    .setName("kod")
                    .setDescription("Kullanılacak premium kodu")
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("sunucu_id")
                    .setDescription("Kullanılacak sunucu ID'si (isteğe bağlı)")
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("değiştir")
                .setDescription("Sunucudaki premiumu başka bir sunucuya taşır")
                .addStringOption(option => option
                    .setName("sunucu_id")
                    .setDescription("Taşınacak sunucu ID'si")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("özellikler")
                .setDescription("Botun premium özelliklerini gösterir")
            )
            .addSubcommand(subcommand => subcommand
                .setName("fiyat")
                .setDescription("Botun premium fiyatlarını gösterir")
            )
            .addSubcommand(subcommand => subcommand
                .setName("süre")
                .setDescription("Premiumunuzun ne kadar süre sona ereceğini gösterir")
            ),
        en: new SlashCommandBuilder()
            .setName(prefixCommand.name.en)
            .setDescription(prefixCommand.description.en)
            .addSubcommand(subcommand => subcommand
                .setName("use")
                .setDescription("Allows you to use your premium code")
                .addStringOption(option => option
                    .setName("code")
                    .setDescription("The premium code to be used")
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName("guild_id")
                    .setDescription("Server ID to use (optional)")
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("change")
                .setDescription("Transfers the premium in the server to another server")
                .addStringOption(option => option
                    .setName("guild_id")
                    .setDescription("Server ID to be transferred")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("features")
                .setDescription("Shows the premium features of the bot")
            )
            .addSubcommand(subcommand => subcommand
                .setName("price")
                .setDescription("Shows the premium prices of the bot")
            )
            .addSubcommand(subcommand => subcommand
                .setName("time")
                .setDescription("Shows how long your premium will expire")
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunSlash} params 
     */
    async execute(params) {
        const option = params.int.options.getSubcommand();
        const args = [option];

        switch (params.language) {
            case "tr":
                switch (option) {
                    case "kullan":
                        args.push(
                            params.int.options.getString("kod"),
                            params.int.options.getString("sunucu_id")
                        )
                        break;
                    case "değiştir":
                        args.push(
                            params.int.options.getString("sunucu_id")
                        )
                        break;
                }
                break;

            case "en":
                switch (option) {
                    case "use":
                        args.push(
                            params.int.options.getString("code"),
                            params.int.options.getString("guild_id")
                        )
                        break;
                    case "change":
                        args.push(
                            params.int.options.getString("guild_id")
                        )
                        break;
                }
                break;
        }

        Util.interactionToMessage(params, {
            main: {
                args
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);
    },
};