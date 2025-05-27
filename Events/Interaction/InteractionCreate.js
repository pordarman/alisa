"use strict";
const {
    BaseInteraction,
    Events,
    MessageFlags
} = require("discord.js");
const {
    owners,
} = require("../../settings.json");
const database = require("../../Helpers/Database.js")
const Util = require("../../Helpers/Util.js");
const allMessages = require("../../Helpers/Localizations/Index.js");
const SpamControl = require("../../Helpers/SpamControl");
const spamControl = new SpamControl();

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {BaseInteraction} int
     */
    async execute(int) {
        try {
            const {
                customId,
            } = int;

            // Eğer butonun id'si "COMMAND_" ile başlıyorsa hiçbir şey yapma
            if (customId?.startsWith("COMMAND_")) return;

            const {
                guild,
                guildId,
                values,
                channel,
                user: {
                    id: authorId
                }
            } = int;
            const guildDatabase = await database.getGuild(guildId);
            const {
                language,
                prefix: guildPrefix
            } = guildDatabase;

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const otherMessages = allMessages[language].others.events.messageOrInteractionCreate;

            /**
             * Komutun çalıştırılıp çalıştırılmayacağını kontrol eder ve çalıştırır
             * @param {Object} command 
             * @param {"button" | "slash" | "selectMenu"} type 
             * @param {Array<String>} splitCustomId
             * @returns 
             */
            async function checkCommandAndRun(command, type, splitCustomId = []) {
                const isOwner = owners.includes(authorId);
                const premium = await database.getFile("premium")[guildId];

                const errorEmbed = Util.errorEmbed(int, otherMessages.errorEmbed);

                // Eğer butona tıklayan kişi botun sahibi değilse
                if (!isOwner) {
                    // Komutun bakım modunda olup olmadığını kontrol eder
                    if (command.care) return errorEmbed(otherMessages.care);

                    // Komutun premium kullanıcılara özel olup olmadığını kontrol eder
                    if (command.premium && !premium) return errorEmbed(otherMessages.premium(guildPrefix));
                }

                function sendMessageIfAvaible(message) {
                    // Kontrolleri yap ve komutu çalıştır
                    const checks = ["reply", "followUp", "editReply", "edit", "send"];
                    for (let i = 0; i < checks.length; ++i) {
                        const check = checks[i];
                        if (check in int) return int[check]({
                            content: message,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    if ("channel" in int) return int.channel.send({
                        content: message,
                        flags: MessageFlags.Ephemeral
                    });

                    // Eğer hiçbiri yoksa kullanıcıya mesaj gönder
                    return int.user.send({
                        content: message
                    });
                }

                const isSpam = await spamControl.addCountAndReturnMessage(authorId, "afk", language);
                if (isSpam) return sendMessageIfAvaible(isSpam);

                const isCooldown = Util.maps.prefixCooldown.get(`${authorId}.${command.id}`);

                // Kullanıcı aynı komutu çok hızlı kullanırsa onu durdur
                if (isCooldown) {
                    // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
                    if (isCooldown.isSee) return;

                    isCooldown.isSee = true;
                    const remainTime = isCooldown.expires - Date.now();
                    if (remainTime > 0) return sendMessageIfAvaible(otherMessages.waitCommand(remainTime));

                    Util.maps.prefixCooldown.delete(`${authorId}.${command.id}`);
                }

                Util.maps.prefixCooldown.set(`${authorId}.${command.id}`, {
                    isSee: false,
                    expires: Date.now() + (command.cooldown * 1000)
                });

                const channelCooldown = Util.maps.channelCooldown.get(channel.id);

                if (channelCooldown) {
                    channelCooldown.count += 1;
                    setTimeout(() => {
                        channelCooldown.count -= 1;
                    }, 2000)

                    // Eğer kanalda çok kısa sürede 4 taneden fazla komut kullanılmış ise uyarı ver
                    if (channelCooldown.count > 4) {

                        // Eğer kanalda aynı anda komut kullanılırsa kullanıcıları uyar
                        if (channelCooldown.isSee) return; // Eğer mesajı daha önceden atmışsa alttakileri çalıştırma
                        channelCooldown.isSee = true;

                        // 5 saniye sonra isSee değerini false yap
                        setTimeout(() => {
                            channelCooldown.isSee = false;
                        }, 5 * 1000);

                        return sendMessageIfAvaible(otherMessages.waitChannel);
                    }
                } else {
                    const object = {
                        isSee: false,
                        count: 1
                    }
                    Util.maps.channelCooldown.set(channel.id, object);
                    setTimeout(() => {
                        object.count -= 1;
                    }, 2 * 1000)
                }

                const alisaFile = await database.getFile("alisa");

                alisaFile.commandUses[command.id][type] += 1;
                alisaFile.commandUses[command.id].total += 1;

                alisaFile.usersCommandUses[authorId] = (alisaFile.usersCommandUses[authorId] || 0) + 1;
                alisaFile.guildsCommandUses[guildId] = (alisaFile.guildsCommandUses[guildId] || 0) + 1;

                await database.updateFile("alisa", {
                    $inc: {
                        [`commandUses.${command.id}.prefix`]: 1,
                        [`commandUses.${command.id}.total`]: 1,
                        [`usersCommandUses.${authorId}`]: 1,
                        [`guildsCommandUses.${guildId}`]: 1
                    }
                });

                // Komutu çalıştırmaya çalış
                try {
                    await command.execute({
                        alisa: alisaFile,
                        guildDatabase,
                        int,
                        customId,
                        splitCustomId,
                        guild,
                        guildId,
                        authorId,
                        language,
                        errorEmbed,
                        premium,
                        isOwner
                    });

                    const newAlisaFile = await database.getFile("alisa");
                    const setObject = {};

                    if (!Util.deepCompare(alisaFile.registersCount, newAlisaFile.registersCount)) setObject["alisa.registersCount"] = newAlisaFile.registersCount;

                    await database.updateFile("alisa", {
                        $set: setObject
                    });
                }
                // Eğer hata çıkarsa kullanıcıyı bilgilendir
                catch (error) {

                    // Eğer kullanan kişi bot sahibiyse hatayı konsola değil mesajda göster
                    if (isOwner) return errorEmbed(
                        otherMessages.commandErrorOwner(error.stack)
                    );

                    // Eğer kişi bot sahibi değilse
                    errorEmbed(
                        otherMessages.commandError(authorId)
                    );
                    Util.error(error, command.dirname, int)

                }
            };


            // Eğer butona tıkladıysa veya modal gönderdiyse
            if (int.isButton() || int.isModalSubmit()) {
                const splitCustomId = customId.split("-");
                const command = Util.maps.buttonCommands.get(splitCustomId[0]);

                if (!command) return;

                // Kontrolleri yap ve komutu çalıştır
                return checkCommandAndRun(command, "button", splitCustomId);
            }

            // Eğer user context menü komutlarını kullandıysa
            if (int.isUserContextMenuCommand()) {
                const command = Util.maps.interactionCommands.get(language).get(int.commandName);
                if (!command) return;

                // Kontrolleri yap ve komutu çalıştır
                return checkCommandAndRun(command, "contextMenu");
            }

            // Eğer slash komutlarını kullandıysa
            if (int.isChatInputCommand()) {
                const command = Util.maps.slashCommands.get(language).get(int.commandName);
                if (!command) return;

                // Kontrolleri yap ve komutu çalıştır
                return checkCommandAndRun(command, "slash");
            }

            // Eğer seçmeli menüden bir seçenek veya birden çok seçenek seçtiyse
            if (int.isStringSelectMenu()) {
                // Eğer tek bir tane seçenek seçilmesi zorunluysa arayacak veriyi değiştir
                const findValue = customId.startsWith("ONE") ? values[0] : customId;

                const splitCustomId = findValue.split("-");
                const command = Util.maps.selectMenuCommands.get(splitCustomId[0]);

                if (!command) return;

                // Kontrolleri yap ve komutu çalıştır
                return checkCommandAndRun(command, "selectMenu", splitCustomId);
            }

        } catch (error) {
            console.error(error);
        }
    },
};
