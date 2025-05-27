"use strict";
const {
    Message,
    ChannelType
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kur",
        en: "setup"
    },
    id: "kur", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kur",
            "kayıtkur",
            "kurkayıt",
            "kurulum",
            "kayıtkurulum",
            "setup",
            "setupregister"
        ],
        en: [
            "setup",
            "setupregister"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bütün rolleri ve kanalları teker teker ayarlamak yerine hepsini birden ayarlarsınız",
        en: "Instead of setting up all roles and channels one by one, you set them all at once"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kur",
        en: "<px>setup"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
   * Parametrelerdeki isimlerin ne olduklarını tanımlar
   * @param {import("../../../Typedef").ExportsRunCommands} params 
   */
    async execute(params) {

        const {
            msg,
            guildDatabase,
            guildId,
            guildMe,
            guildMePermissions,
            guild,
            msgMember,
            authorId,
            language,
            errorEmbed,
            extras
        } = params;

        // Eğer Bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        let registerDatabase = {
            roleIds: {
                boy: [],
                girl: [],
                member: [],
                bot: [],
                registerAuth: "",
                unregister: ""
            },
            channelIds: {
                register: "",
                log: "",
                afterRegister: "",
            },
            customNames: {
                register: "<tag> <name>",
                registerBot: "<tag> <name>",
                guildAdd: "<tag> <name>",
                guildAddBot: "<tag> <name>",
            },
            tag: "",
            symbol: ""
        };
        const filter = message => message.author.id === authorId && message.content?.trim()?.length > 0;
        const timeout = 90 * 1000; // Mesajları 1.30 dakika süreyle bekle
        const channel = msg.channel;

        const {
            commands: {
                kur: messages,
                tagayarla: tagMessages,
                sembol: symbolMessages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            channels: channelMessages,
            others: {
                roleNames
            },
            switchs: {
                setupRegister: setupSwitchs,
                setRegisterType: genderSwitch
            }
        } = allMessages[language];

        const allErrors = messages.allErrors;
        const allRegisterMessages = messages.allRegisterMessages;

        // Eğer kullanıcı kur komutunu kullanırken çok fazla hata yaptıysa komutu bitir
        // Ve en fazla kaç tane hata yapabilir belirt
        let currErrorCount = 0;

        // Özel bir şekilde mesaj gönderme fonksiyonu
        async function sendCustomMessage(message, content) {
            return message.reply({
                content,
                allowedMentions: {
                    roles: [],
                    repliedUser: true
                }
            });
        }

        // Hatalara bir tane hata ekle ve mesaj gönder
        async function addErrorAndSendMessage(message, content, func) {
            currErrorCount += 1;

            // Eğer maximum hata ulaştıysa
            if (currErrorCount == Util.MAX.errorForSetup) {
                // Veriyi sil ve Database'ye kaydet
                delete guildDatabase.waitMessageCommands.setup;
                await database.updateGuild(guildId, {
                    $unset: {
                        "waitMessageCommands.setup": ""
                    }
                });
                return sendCustomMessage(
                    message,
                    allErrors.cancel
                );
            };

            // İşlemi devam ettir
            sendCustomMessage(
                message,
                `${allErrors.numberOfRemainingAttempts(Util.MAX.errorForSetup - currErrorCount)}\n` +
                content
            );
            return func(message);
        }

        // Database'ye kaydetme fonksiyonu
        const saveDatabase = async (message, functionName) => {
            guildDatabase.waitMessageCommands.setup = {
                commandName: this.name[language],
                messageId: message.id,
                channelId: channel.id,
                functionName,
                registerData: registerDatabase,
                errorCount: currErrorCount,
                timestamp: Date.now()
            };
            await database.updateGuild(guildId, {
                $set: {
                    "waitMessageCommands.setup": guildDatabase.waitMessageCommands.setup
                }
            });
        }

        // Eğer Bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır 
        if (extras) {
            const textToFunc = {
                // Kanal ayarlamaları
                setRegisterChannel: (message) => {
                    sendCustomMessage(message, allRegisterMessages.registerChannel)
                    return setRegisterChannel(message);
                },
                setAfterRegisterChannel: (message) => {
                    sendCustomMessage(message, allRegisterMessages.afterRegisterChannel)
                    return setAfterRegisterChannel(message);
                },
                setRegisterLogChannel: (message) => {
                    sendCustomMessage(message, allRegisterMessages.registerLogChannel)
                    return setRegisterLogChannel(message);
                },

                // Yetkili ve kayıtsız rolü ayarlamaları
                setRegisterAuthRole: (message) => {
                    sendCustomMessage(message, allRegisterMessages.registerAuthRole)
                    return setRegisterAuthRole(message);
                },
                setUnregisteredRole: (message) => {
                    sendCustomMessage(message, allRegisterMessages.unregisterRole)
                    return setUnregisteredRole(message);
                },

                // Kayıt tipini ayarlama
                setRegisterType: (message) => {
                    sendCustomMessage(message, allRegisterMessages.registerType)
                    return setRegisterType(message);
                },

                // Diğer rol ayarlamalı
                setGirlRoles: (message) => {
                    sendCustomMessage(message, allRegisterMessages.girlRoles)
                    return setGirlRoles(message);
                },
                setBoyRoles: (message) => {
                    sendCustomMessage(message, allRegisterMessages.boyRoles)
                    return setBoyRoles(message);
                },
                setMemberRoles: (message) => {
                    sendCustomMessage(message, allRegisterMessages.memberRoles)
                    return setMemberRoles(message);
                },
                setBotRoles: (message) => {
                    sendCustomMessage(message, allRegisterMessages.botRoles)
                    return setBotRoles(message);
                },

                // Tag ve sembol ayarlamaları
                setGuildTag: (message) => {
                    sendCustomMessage(message, allRegisterMessages.tag(Util.customMessages.registerName({
                        message: guildDatabase.register.customNames.register,
                        name: "Fearless Crazy",
                        guildDatabase,
                        age: "20",
                        isBot: false,
                        defaultObject: {
                            tag: "♫"
                        }
                    })))
                    return setGuildTag(message);
                },
                setGuildSymbol: (message) => {
                    sendCustomMessage(message, allRegisterMessages.symbol(Util.customMessages.registerName({
                        message: guildDatabase.register.customNames.register,
                        name: "Fearless Crazy",
                        guildDatabase,
                        age: "20",
                        isBot: false,
                        defaultObject: {
                            symbol: "|"
                        }
                    })))
                    return setGuildSymbol(message);
                },

                // Otoisim ayarlaması
                setGuildAddName: (message) => {
                    sendCustomMessage(message, allRegisterMessages.guildAddName(Util.customMessages.unregisterName({
                        message: guildDatabase.register.customNames.guildAdd,
                        guildDatabase,
                        name: messages.usersName,
                        defaultObject: {
                            tag: registerDatabase.tag
                        }
                    })))
                    return setGuildAddName(message);
                },
            };

            // Database'ye kaydedilen veriyleri çek
            const {
                registerData,
                functionName,
                errorCount
            } = extras;
            registerDatabase = registerData;
            currErrorCount = errorCount;

            // Fonksiyonu çalıştır
            return textToFunc[functionName](msg);
        }

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer kayıt işlemi daha önceden başlatılmışsa hata döndür
        if (guildDatabase.waitMessageCommands.setup) return errorEmbed(messages.already);

        // Eğer botta "Yönetici" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "botPermissionError");

        // Mesajı gönder 
        sendCustomMessage(
            msg,
            `${allRegisterMessages.registerChannel}\n\n` +
            messages.cancelAndClose
        );
        return await setRegisterChannel(msg);


        /**
         * Kayıt kanalını ayarlar
         * @param {Message} message 
         */
        async function setRegisterChannel(message) {
            await Promise.all([

                // Database'ye kaydet
                saveDatabase(message, "setRegisterChannel"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.registerAuthRole)
                                return await setRegisterAuthRole(message);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(
                                    message,
                                    messages.allErrors.dontKnow +
                                    `${allRegisterMessages.registerChannel}`
                                );
                                return await setRegisterChannel(message)
                        };

                        // Mesajdaki ilk kanalı bul
                        const channel = Util.fetchChannel(message);

                        // Eğer bir kanal etiketlememişse
                        if (!channel) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerChannel,
                            setRegisterChannel
                        );

                        // Eğer etiketlediği kanal bir yazı kanalı değilse
                        if (channel.type != ChannelType.GuildText) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${channelMessages.notTextChannel}`,
                            setRegisterChannel
                        );

                        // Database'ye kaydet ve devam et
                        registerDatabase.channelIds.register = channel.id;
                        sendCustomMessage(
                            message,
                            allRegisterMessages.afterRegisterChannel
                        );
                        return await setAfterRegisterChannel(message)
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerChannel,
                            setRegisterChannel
                        );
                    })
            ]);

        }

        /**
         * Kayıt sonrası kanalı ayarlar
         * @param {Message} message 
         */
        async function setAfterRegisterChannel(message) {
            await Promise.all([

                // Database'ye kaydet
                saveDatabase(message, "setAfterRegisterChannel"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.registerLogChannel)
                                return await setRegisterLogChannel(message);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(
                                    message,
                                    allRegisterMessages.registerChannel
                                );
                                return await setRegisterChannel(message)
                        };

                        // Mesajdaki ilk kanalı bul
                        const channel = Util.fetchChannel(message);

                        // Eğer bir kanal etiketlememişse
                        if (!channel) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.afterRegisterChannel,
                            setAfterRegisterChannel
                        );

                        // Eğer etiketlediği kanal bir yazı kanalı değilse
                        if (channel.type != ChannelType.GuildText) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${channelMessages.notTextChannel}`,
                            setAfterRegisterChannel
                        );

                        // Database'ye kaydet ve devam et
                        registerDatabase.channelIds.afterRegister = channel.id;
                        sendCustomMessage(
                            message,
                            allRegisterMessages.registerLogChannel
                        );
                        return await setRegisterLogChannel(message)
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerChannel,
                            setAfterRegisterChannel
                        );
                    })
            ]);
        }

        /**
         * Kayıt sonrası kanalı ayarlar
         * @param {Message} message 
         */
        async function setRegisterLogChannel(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setRegisterLogChannel"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.registerAuthRole);
                                return await setRegisterAuthRole(message);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(
                                    message,
                                    allRegisterMessages.afterRegisterChannel
                                );
                                return await setAfterRegisterChannel(message);
                        };

                        // Mesajdaki ilk kanalı bul
                        const channel = Util.fetchChannel(message);

                        // Eğer bir kanal etiketlememişse
                        if (!channel) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerLogChannel,
                            setRegisterLogChannel
                        );

                        // Eğer etiketlediği kanal bir yazı kanalı değilse
                        if (channel.type != ChannelType.GuildText) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${channelMessages.notTextChannel}`,
                            setRegisterLogChannel
                        );

                        // Database'ye kaydet ve devam et
                        registerDatabase.channelIds.log = channel.id;
                        sendCustomMessage(
                            message,
                            allRegisterMessages.registerAuthRole
                        );
                        return await setRegisterAuthRole(message)
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerChannel,
                            setRegisterLogChannel
                        );
                    })
            ]);
        }

        /**
         * Kayıt yetkili rolünü ayarlar
         * @param {Message} message 
         */
        async function setRegisterAuthRole(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setRegisterAuthRole"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel)

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.registerLogChannel)
                                return await setRegisterLogChannel(message);
                        }

                        // Mesajdaki ilk rolü bul
                        const role = Util.fetchRole(message);

                        // Eğer rolü etiketlememişse
                        if (!role) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerAuthRole,
                            setRegisterAuthRole
                        );

                        // Eğer etiketlediği rol bir bot rolüyse
                        if (role.managed) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setRegisterAuthRole
                        );

                        registerDatabase.roleIds.registerAuth = role.id;
                        sendCustomMessage(message, allRegisterMessages.unregisterRole);
                        return await setUnregisteredRole(message)
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerAuthRole,
                            setRegisterAuthRole
                        );
                    })
            ]);
        }

        /**
         * Kayıtsız rolünü ayarlar
         * @param {Message} message 
         */
        async function setUnregisteredRole(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setUnregisteredRole"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel)

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.registerAuthRole)
                                return await setRegisterAuthRole(message);
                        }

                        // Mesajdaki ilk rolü bul
                        const role = Util.fetchRole(message);

                        // Eğer rolü etiketlememişse
                        if (!role) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.unregisterRole,
                            setUnregisteredRole
                        );

                        // Eğer etiketlediği rol bir bot rolüyse
                        if (role.managed) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setUnregisteredRole
                        );

                        // Eğer etiketlediği rol yetkili rolüyse
                        if (role.id == registerDatabase.roleIds.registerAuth) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: role.id,
                                roleName: roleNames.registerAuth
                            })}`,
                            setUnregisteredRole
                        );

                        registerDatabase.roleIds.unregister = role.id;
                        sendCustomMessage(message, allRegisterMessages.registerType);
                        return await setRegisterType(message)
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerAuthRole,
                            setUnregisteredRole
                        );
                    })
            ]);
        }

        /**
         * Kayıt türünü belirler
         * @param {Message} message 
         */
        async function setRegisterType(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setRegisterType"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.memberRoles)
                                return await setMemberRoles(message);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.unregisterRole)
                                return await setUnregisteredRole(message);
                        }

                        switch (genderSwitch(message.content?.toLocaleLowerCase(language))) {
                            // Eğer seçeneğini cinsiyet olarak seçmişse
                            case "gender":
                                registerDatabase.type = "gender";
                                sendCustomMessage(message, allRegisterMessages.girlRoles);
                                return await setGirlRoles(message);

                            // Eğer seçeneğini Üye olarak seçmişse
                            case "member":
                                registerDatabase.type = "member";
                                sendCustomMessage(message, allRegisterMessages.memberRoles)
                                return await setMemberRoles(message);

                            // Eğer girdiği değer geçerli bir değer değilse
                            default:
                                return await addErrorAndSendMessage(
                                    message,
                                    allRegisterMessages.registerType,
                                    setRegisterType
                                );
                        }
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.registerType,
                            setRegisterType
                        );
                    })
            ]);
        }

        /**
         * Üye rollerini ayarlar
         * @param {Message} message 
         */
        async function setMemberRoles(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setMemberRoles"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.registerType)
                                return await setRegisterType(message);
                        }

                        // Mesajdaki rolleri çek
                        const roles = Util.fetchRoles(message);

                        // Eğer hiç rol etiketlememişse
                        if (roles.size == 0) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.memberRoles,
                            setMemberRoles
                        );

                        // Eğer bot rolünü etiketlemişse
                        if (roles.some(role => role.managed)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setMemberRoles
                        );

                        // Eğer yetkili rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.registerAuth)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.registerAuth,
                                roleName: roleNames.registerAuth
                            })}`,
                            setMemberRoles
                        );

                        // Eğer kayıtsız rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.unregister)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.unregister,
                                roleName: roleNames.unregister
                            })}`,
                            setMemberRoles
                        );

                        // Eğer maximum rol sayısına ulaştıysa
                        if (roles.size > Util.MAX.mentionRoleForRegister) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.maxRoleError(Util.MAX.mentionRoleForRegister)}`,
                            setGirlRoles
                        );

                        // Eğer rollerin bazıları bot rolünün üstündeyse
                        const highestRoleBot = message.guild.members.me.roles.highest.position;
                        const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
                        if (roleAboveTheBotRole.size > 0) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.rolesAreHigherThanMe({
                                roleIds: Util.mapAndJoin(roleAboveTheBotRole, role => role.id, " | "),
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            })}`,
                            setMemberRoles
                        );

                        // Database'ye kaydet
                        registerDatabase.roleIds.member = roles.map(role => role.id);
                        sendCustomMessage(message, allRegisterMessages.botRoles)
                        return await setBotRoles(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.memberRoles,
                            setMemberRoles
                        );
                    })
            ]);
        }

        /**
        * Kız rollerini ayarlar
        * @param {Message} message 
        */
        async function setGirlRoles(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setGirlRoles"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.registerType)
                                return await setRegisterType(message);
                        }

                        // Mesajdaki rolleri çek
                        const roles = Util.fetchRoles(message);

                        // Eğer hiç rol etiketlememişse
                        if (roles.size == 0) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.girlRoles,
                            setGirlRoles
                        );

                        // Eğer bot rolünü etiketlemişse
                        if (roles.some(role => role.managed)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setGirlRoles
                        );

                        // Eğer yetkili rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.registerAuth)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.registerAuth,
                                roleName: roleNames.registerAuth
                            })}`,
                            setGirlRoles
                        );

                        // Eğer kayıtsız rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.unregister)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.unregister,
                                roleName: roleNames.unregister
                            })}`,
                            setGirlRoles
                        );

                        // Eğer maximum rol sayısına ulaştıysa
                        if (roles.size > Util.MAX.mentionRoleForRegister) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.maxRoleError(Util.MAX.mentionRoleForRegister)}`,
                            setGirlRoles
                        );

                        // Eğer rollerin bazıları bot rolünün üstündeyse
                        const highestRoleBot = message.guild.members.me.roles.highest.position;
                        const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
                        if (roleAboveTheBotRole.size > 0) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.rolesAreHigherThanMe({
                                roleIds: Util.mapAndJoin(roleAboveTheBotRole, role => role.id, " | "),
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            })}`,
                            setGirlRoles
                        );

                        // Database'ye kaydet
                        registerDatabase.roleIds.girl = roles.map(role => role.id);
                        sendCustomMessage(message, allRegisterMessages.boyRoles)
                        return await setBoyRoles(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.girlRoles,
                            setGirlRoles
                        );
                    })
            ]);
        }

        /**
         * Erkek rollerini ayarlar
         * @param {Message} message 
         */
        async function setBoyRoles(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setBoyRoles"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.girlRoles)
                                return await setGirlRoles(message);
                        }

                        // Mesajdaki rolleri çek
                        const roles = Util.fetchRoles(message);

                        // Eğer hiç rol etiketlememişse
                        if (roles.size == 0) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.boyRoles,
                            setBoyRoles
                        );

                        // Eğer bot rolünü etiketlemişse
                        if (roles.some(role => role.managed)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setBoyRoles
                        );

                        // Eğer yetkili rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.registerAuth)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.registerAuth,
                                roleName: roleNames.registerAuth
                            })}`,
                            setBoyRoles
                        );

                        // Eğer kayıtsız rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.unregister)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.unregister,
                                roleName: roleNames.unregister
                            })}`,
                            setBoyRoles
                        );

                        // Eğer maximum rol sayısına ulaştıysa
                        if (roles.size > Util.MAX.mentionRoleForRegister) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.maxRoleError(Util.MAX.mentionRoleForRegister)}`,
                            setBoyRoles
                        );

                        // Eğer rollerin bazıları bot rolünün üstündeyse
                        const highestRoleBot = message.guild.members.me.roles.highest.position;
                        const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
                        if (roleAboveTheBotRole.size > 0) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.rolesAreHigherThanMe({
                                roleIds: Util.mapAndJoin(roleAboveTheBotRole, role => role.id, " | "),
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            })}`,
                            setBoyRoles
                        );

                        // Database'ye kaydet
                        registerDatabase.roleIds.boy = roles.map(role => role.id);
                        sendCustomMessage(message, allRegisterMessages.botRoles)
                        return await setBotRoles(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.boyRoles,
                            setBoyRoles
                        );
                    })
            ]);
        }

        /**
         * Bot rollerini ayarlar
         * @param {Message} message 
         */
        async function setBotRoles(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setBotRoles"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel);

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.tag(Util.customMessages.registerName({
                                    message: guildDatabase.register.customNames.register,
                                    name: "Fearless Crazy",
                                    guildDatabase,
                                    age: "20",
                                    isBot: false,
                                    defaultObject: {
                                        tag: "♫"
                                    }
                                })))
                                return await setGuildTag(message);

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.boyRoles)
                                return await setBotRoles(message);
                        }

                        // Mesajdaki rolleri çek
                        const roles = Util.fetchRoles(message);

                        // Eğer hiç rol etiketlememişse
                        if (roles.size == 0) return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.botRoles,
                            setBotRoles
                        );

                        // Eğer bot rolünü etiketlemişse
                        if (roles.some(role => role.managed)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.botRole}`,
                            setBotRoles
                        );

                        // Eğer yetkili rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.registerAuth)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.registerAuth,
                                roleName: roleNames.registerAuth
                            })}`,
                            setBotRoles
                        );

                        // Eğer kayıtsız rolünü etiketlemişse
                        if (roles.has(registerDatabase.roleIds.unregister)) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.errorRole({
                                roleId: registerDatabase.roleIds.unregister,
                                roleName: roleNames.unregister
                            })}`,
                            setBotRoles
                        );

                        // Eğer maximum rol sayısına ulaştıysa
                        if (roles.size > Util.MAX.mentionRoleForRegister) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.maxRoleError(Util.MAX.mentionRoleForRegister)}`,
                            setBotRoles
                        );

                        // Eğer rollerin bazıları bot rolünün üstündeyse
                        const highestRoleBot = message.guild.members.me.roles.highest.position;
                        const roleAboveTheBotRole = roles.filter(role => role.position >= highestRoleBot);
                        if (roleAboveTheBotRole.size > 0) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${roleMessages.rolesAreHigherThanMe({
                                roleIds: Util.mapAndJoin(roleAboveTheBotRole, role => role.id, " | "),
                                highestRoleId: Util.getBotOrHighestRole(guildMe).id
                            })}`,
                            setBotRoles
                        );

                        // Database'ye kaydet
                        registerDatabase.roleIds.bot = roles.map(role => role.id);
                        sendCustomMessage(message, allRegisterMessages.tag(Util.customMessages.registerName({
                            message: guildDatabase.register.customNames.register,
                            name: "Fearless Crazy",
                            guildDatabase,
                            age: "20",
                            isBot: false,
                            defaultObject: {
                                tag: "♫"
                            }
                        })))
                        return await setGuildTag(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.botRoles,
                            setBotRoles
                        );
                    })
            ]);
        }

        /**
         * Sunucunun tagını ayarlar
         * @param {Message} message 
         */
        async function setGuildTag(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setGuildTag"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel)

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.botRoles)
                                return await setBotRoles(message)

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.symbol(Util.customMessages.registerName({
                                    message: guildDatabase.register.customNames.register,
                                    name: "Fearless Crazy",
                                    guildDatabase,
                                    age: "20",
                                    isBot: false,
                                    defaultObject: {
                                        symbol: "|"
                                    }
                                })))
                                return await setGuildSymbol(message)
                        }

                        // Eğer tagın uzunluğu maximum değere ulaştıysa
                        if (message.content.length > Util.MAX.tagLength) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${tagMessages.maxError(Util.MAX.tagLength)}`,
                            setGuildTag
                        );

                        // Database'ye kaydet
                        registerDatabase.tag = message.content.trim();
                        sendCustomMessage(message, allRegisterMessages.symbol(Util.customMessages.registerName({
                            message: guildDatabase.register.customNames.register,
                            name: "Fearless Crazy",
                            guildDatabase,
                            age: "20",
                            isBot: false,
                            defaultObject: {
                                symbol: "|",
                                tag: registerDatabase.tag
                            }
                        })));
                        return await setGuildSymbol(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.tag(Util.customMessages.registerName({
                                message: guildDatabase.register.customNames.register,
                                name: "Fearless Crazy",
                                guildDatabase,
                                age: "20",
                                isBot: false,
                                defaultObject: {
                                    tag: "♫"
                                }
                            })),
                            setGuildTag
                        );
                    })
            ]);
        }

        /**
        * Sunucunun sembolünü ayarlar
        * @param {Message} message 
        */
        async function setGuildSymbol(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setGuildSymbol"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel)

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.tag(Util.customMessages.registerName({
                                    message: guildDatabase.register.customNames.register,
                                    name: "Fearless Crazy",
                                    guildDatabase,
                                    age: "20",
                                    isBot: false,
                                    defaultObject: {
                                        tag: registerDatabase.tag
                                    }
                                })))
                                return await setGuildTag(message)

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                sendCustomMessage(message, allRegisterMessages.guildAddName(Util.customMessages.unregisterName({
                                    message: guildDatabase.register.customNames.guildAdd,
                                    guildDatabase,
                                    name: messages.usersName,
                                    defaultObject: {
                                        tag: registerDatabase.tag
                                    }
                                })));
                                return await setGuildAddName(message);
                        }

                        // Eğer sembolün uzunluğu maximum değere ulaştıysa
                        if (message.content.length > Util.MAX.symbolLength) return await addErrorAndSendMessage(
                            message,
                            `${EMOJIS.no} ${symbolMessages.maxError(Util.MAX.symbolLength)}`,
                            setGuildSymbol
                        );

                        // Database'ye kaydet
                        registerDatabase.symbol = message.content.trim();
                        sendCustomMessage(message, allRegisterMessages.guildAddName(Util.customMessages.unregisterName({
                            message: guildDatabase.register.customNames.guildAdd,
                            guildDatabase,
                            name: messages.usersName,
                            defaultObject: {
                                tag: registerDatabase.tag,
                                symbol: registerDatabase.symbol
                            }
                        })));
                        return await setGuildAddName(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.symbol(Util.customMessages.registerName({
                                message: guildDatabase.register.customNames.register,
                                name: "Fearless Crazy",
                                guildDatabase,
                                age: "20",
                                isBot: false,
                                defaultObject: {
                                    symbol: "|"
                                }
                            })),
                            setGuildSymbol
                        );
                    })
            ]);
        }

        /**
         * Sunucunun özelleştirilmiş giriş ismini ayarlar
         * @param {Message} message 
         */
        async function setGuildAddName(message) {
            await Promise.all([
                // Database'ye kaydet
                saveDatabase(message, "setGuildAddName"),

                // Mesaj atmasını bekle
                channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        switch (setupSwitchs(message.content?.toLocaleLowerCase(language))) {
                            // Eğer kayıt kuru iptal etmek istiyorsa
                            case "cancel":
                                delete guildDatabase.waitMessageCommands.setup;
                                await database.updateGuild(guildId, {
                                    $unset: {
                                        "waitMessageCommands.setup": ""
                                    }
                                });
                                return sendCustomMessage(message, allErrors.cancel)

                            // Eğer önceki ayarlamaya dönmek istiyorsa
                            case "back":
                                sendCustomMessage(message, allRegisterMessages.symbol(Util.customMessages.registerName({
                                    message: guildDatabase.register.customNames.register,
                                    name: "Fearless Crazy",
                                    guildDatabase,
                                    age: "20",
                                    isBot: false,
                                    defaultObject: {
                                        symbol: "|"
                                    }
                                })))
                                return await setGuildSymbol(message)

                            // Eğer bu ayarlamayı geçmek istiyorsa
                            case "skip":
                                registerDatabase.customNames.guildAdd = "<tag> <name>";
                                return await last(message);
                        }

                        // Database'ye kaydet
                        registerDatabase.customNames.guildAdd = message.content.trim();
                        return await last(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        return await addErrorAndSendMessage(
                            message,
                            allRegisterMessages.guildAddName(Util.customMessages.unregisterName({
                                message: guildDatabase.register.customNames.guildAdd,
                                guildDatabase,
                                name: messages.usersName,
                                defaultObject: {
                                    tag: registerDatabase.tag
                                }
                            })),
                            setGuildAddName
                        )
                    })
            ]);
        }

        /**
         * Kayıt verilerini kaydetme ve verileri gösterir
         * @param {Message} message 
         */
        async function last(message) {
            // Database'deki setup verisini sil
            delete guildDatabase.waitMessageCommands.setup;

            const changedGuildData = Util.mergeObjects(registerDatabase, guildDatabase.register, "register", true);
            changedGuildData.$unset["waitMessageCommands.setup"] = "";

            await database.updateGuild(guildId, changedGuildData);

            params.msg = message;

            return Util.maps.prefixCommandIds.get("kayıtbilgi").execute(params);
        }
    },
};