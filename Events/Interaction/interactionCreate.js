"use strict";
const {
    EmbedBuilder,
    BaseInteraction,
    Events
} = require("discord.js");
const {
    owners,
    EMOJIS,
} = require("../../settings.json");
const database = require("../../Helpers/Database")
const Util = require("../../Helpers/Util");

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {BaseInteraction} int
     */
    async execute(int) {
        try {

            const authorId = int.user.id;
            const {
                customId,
                guild,
                guildId,
                values
            } = int;
            const guildDatabase = Util.getGuildData(int.client, guildId);
            const {
                language,
                prefix: guildPrefix
            } = guildDatabase;

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const allMessages = Util.eventMessages.messageOrInteractionCreate[language];

            /**
                 * Bazı embedler için biz hazır önayar yaparız
                 * Mesela hata embed'i yapmak için her seferinde başlığı "Hata" yapmak yerine hazır yaparız ki hem tekrardan düzenlemesinde kolaylık olur
                 * hem de hata oranı azalır
                 * @param {String} messageContent
                 * @param {String} type
                 * @param {Number} cooldown
                 * @returns
                 */
            function errorEmbed(messageContent, type = "error", cooldown = 8000, { fields, image = null } = {}) {
                const embed = new EmbedBuilder()
                    .setTimestamp();

                if (fields) embed.addFields(...fields)
                if (image) embed.setImage(image)

                const {
                    errorEmbed: {
                        errorTitle,
                        memberPermissionError,
                        botPermissionError,
                        warn,
                        success
                    }
                } = allMessages;

                switch (type) {
                    case "memberPermissionError": {
                        embed
                            .setTitle(errorTitle)
                            .setDescription(
                                memberPermissionError(messageContent)
                            )
                            .setColor("Red")
                    }
                        break;

                    case "botPermissionError": {
                        embed
                            .setTitle(errorTitle)
                            .setDescription(
                                botPermissionError(messageContent)
                            )
                            .setColor("Red")
                    }
                        break;

                    case "error": {
                        embed
                            .setTitle(errorTitle)
                            .setDescription(`• ${messageContent}`)
                            .setColor("Red");
                    }
                        break;

                    case "warn": {
                        embed
                            .setTitle(warn)
                            .setDescription(messageContent)
                            .setColor("Orange");
                    }
                        break;

                    case "success": {
                        let splitString = messageContent.split("\n");

                        messageContent = splitString.length > 1 ?
                            `${splitString[0]} ${EMOJIS.yes}\n${splitString.slice(1).join("\n")}` :
                            `${messageContent} ${EMOJIS.yes}`;

                        embed
                            .setTitle(success)
                            .setDescription(messageContent)
                            .setColor("Green");

                        return int.reply({
                            embeds: [
                                embed
                            ]
                        });
                    }

                    default:
                        throw new TypeError(`Bilinmeyen bir tip girişi! - ${type}`);
                }

                int.reply({
                    embeds: [
                        embed
                    ],
                    ephemeral: true
                })
            }

            // Eğer butona tıkladıysa veya modal gönderdiyse
            if (int.isButton() || int.isModalSubmit()) {

                const command = [...int.client.buttonCommands[language].values()].find(
                    ({ name: commandName }) => commandName == customId || customId.startsWith(`${commandName}-`)
                );
                if (!command) return;

                // Eğer butona tıklayan kişi botun sahibi değilse
                if (!owners.includes(authorId)) {
                    // Komutun bakım modunda olup olmadığını kontrol eder
                    if (command.care) return errorEmbed({
                        content: allMessages.care,
                        ephemeral: true
                    });

                    // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
                    if (command.premium) return errorEmbed({
                        content: allMessages.premium(guildPrefix),
                        ephemeral: true
                    });
                }

                const alisaFile = database.getFile("alisa", "other");

                // Komut kullanımını database'ye kaydet
                alisaFile.commandUses[command.id] ??= {
                    prefix: 0,
                    slash: 0,
                    button: 0,
                    selectMenu: 0,
                    total: 0
                }
                alisaFile.commandUses[command.id].button += 1;
                alisaFile.commandUses[command.id].total += 1;

                alisaFile.usersCommandUses[authorId] ??= 0;
                alisaFile.usersCommandUses[authorId] += 1;

                alisaFile.guildsCommandUses[guildId] ??= 0;
                alisaFile.guildsCommandUses[guildId] += 1;

                database.writeFile(alisaFile, "alisa", "other");

                // Komutu çalıştırmaya çalış
                try {
                    await command.execute({
                        alisa: alisaFile,
                        guildDatabase,
                        int,
                        customId,
                        guild,
                        guildId,
                        authorId,
                        language,
                        errorEmbed
                    });
                }
                // Eğer hata çıkarsa kullanıcıyı bilgilendir
                catch (error) {

                    // Eğer komut sahip komutuysa hatayı konsola değil de mesajda gönster
                    if (command.ownerOnly) return errorEmbed(
                        allMessages.commandErrorOwner(error)
                    );

                    // Eğer sahip komutu değilse
                    errorEmbed(
                        allMessages.commandError(authorId)
                    );
                    Util.error(error, command.dirname)

                }
            }

            // Eğer slash komutlarını kullandıysa
            if (int.isCommand()) {

                const command = int.client.slashCommands[language].get(int.commandName);
                if (!command) return;

                // Eğer butona tıklayan kişi botun sahibi değilse
                if (!owners.includes(authorId)) {
                    // Komutun bakım modunda olup olmadığını kontrol eder
                    if (command.care) return errorEmbed({
                        content: allMessages.care,
                        ephemeral: true
                    });

                    // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
                    if (command.premium) return errorEmbed({
                        content: allMessages.premium(guildPrefix),
                        ephemeral: true
                    });
                }

                const alisaFile = database.getFile("alisa", "other");

                // Komut kullanımını database'ye kaydet
                alisaFile.commandUses[command.id] ??= {
                    prefix: 0,
                    slash: 0,
                    button: 0,
                    selectMenu: 0,
                    total: 0
                }
                alisaFile.commandUses[command.id].slash += 1;
                alisaFile.commandUses[command.id].total += 1;

                alisaFile.usersCommandUses[authorId] ??= 0;
                alisaFile.usersCommandUses[authorId] += 1;

                alisaFile.guildsCommandUses[guildId] ??= 0;
                alisaFile.guildsCommandUses[guildId] += 1;

                database.writeFile(alisaFile, "alisa", "other");

                // Komutu çalıştırmaya çalış
                try {
                    await command.execute({
                        alisa: alisaFile,
                        guildDatabase,
                        int,
                        customId,
                        guild,
                        guildId,
                        authorId,
                        language,
                        errorEmbed
                    });
                }
                // Eğer hata çıkarsa kullanıcıyı bilgilendir
                catch (error) {

                    // Eğer komut sahip komutuysa hatayı konsola değil de mesajda gönster
                    if (command.ownerOnly) return errorEmbed(
                        allMessages.commandErrorOwner(error)
                    );

                    // Eğer sahip komutu değilse
                    errorEmbed(
                        allMessages.commandError(authorId)
                    );
                    Util.error(error, command.dirname)
                }

            }

            // Eğer seçmeli menüden bir seçenek veya birden çok seçenek seçtiyse
            if (int.isStringSelectMenu()) {

                // Eğer tek bir tane seçenek seçilmesi zorunluysa arayacak veriyi değiştir
                const findValue = customId.startsWith("ONE") ? values[0] : customId;
                const command = int.client.selectMenuCommands[language].get(findValue) || [...int.client.selectMenuCommands[language].values()].find(
                    ({ name: commandName }) => findValue.startsWith(`${commandName}-`)
                );
                if (!command) return;

                // Eğer butona tıklayan kişi botun sahibi değilse
                if (!owners.includes(authorId)) {
                    // Komutun bakım modunda olup olmadığını kontrol eder
                    if (command.care) return errorEmbed({
                        content: allMessages.care,
                        ephemeral: true
                    });

                    // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
                    if (command.premium) return errorEmbed({
                        content: allMessages.premium(guildPrefix),
                        ephemeral: true
                    });
                }

                const alisaFile = database.getFile("alisa", "other");

                // Komut kullanımını database'ye kaydet
                alisaFile.commandUses[command.id] ??= {
                    prefix: 0,
                    slash: 0,
                    button: 0,
                    selectMenu: 0,
                    total: 0
                }
                alisaFile.commandUses[command.id].selectMenu += 1;
                alisaFile.commandUses[command.id].total += 1;

                alisaFile.usersCommandUses[authorId] ??= 0;
                alisaFile.usersCommandUses[authorId] += 1;

                alisaFile.guildsCommandUses[guildId] ??= 0;
                alisaFile.guildsCommandUses[guildId] += 1;

                database.writeFile(alisaFile, "alisa", "other");

                // Komutu çalıştırmaya çalış
                try {
                    await command.execute({
                        alisa: alisaFile,
                        guildDatabase,
                        int,
                        customId,
                        guild,
                        guildId,
                        authorId,
                        language,
                        errorEmbed
                    });
                }
                // Eğer hata çıkarsa kullanıcıyı bilgilendir
                catch (error) {

                    // Eğer komut sahip komutuysa hatayı konsola değil de mesajda gönster
                    if (command.ownerOnly) return errorEmbed(
                        allMessages.commandErrorOwner(error)
                    );

                    // Eğer sahip komutu değilse
                    errorEmbed(
                        allMessages.commandError(authorId)
                    );
                    Util.error(error, command.dirname)
                }
            }

        } catch (error) {
            console.log(error);
        }
    },
};
