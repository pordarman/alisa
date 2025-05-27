"use strict";
const database = require("../../../Helpers/Database.js");
const {
    Message
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "otocevap",
        en: "autoresponse"
    },
    id: "otocevap", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "otocevap",
            "otomesaj",
            "autoresponse",
            "autoresponder",
        ],
        en: [
            "autoresponse",
            "autoresponder",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya özel oto cevap komutu ayarlarsınız",
        en: "You set a server-specific auto-response command"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Premium komutları",
        en: "Premium commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>otocevap",
        en: "<px>otocevap"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: true, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guildId,
        msgMember,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
        extras
    }) {

        const {
            commands: {
                otocevap: messages
            },
            permissions: permissionMessages,
            others: otherMessages,
            switchs: {
                autoResponse: switchKey
            },
            sets: {
                autoResponse: removeSet
            }
        } = allMessages[language];

        // Eğer Bot, kurma sırasında yeniden başlatılırsa kesinti vermemesi için tanımlamaları en başta yapıyoruz
        let autoResponse = {};
        const objName = `${guildId}.${authorId}`;
        const filter = message => message.author.id == authorId && message.content?.trim()?.length > 0;
        const timeout = 30 * 1000; // Mesaj atması için 30 saniye bekle

        // Database'ye kaydetme fonksiyonu
        async function saveDatabase(message, functionName) {
            guildDatabase.waitMessageCommands.autoResponse[objName] = {
                commandName: this.name[language],
                messageId: message.id,
                channelId: message.channelId,
                functionName,
                autoResponseData: autoResponse,
                timestamp: Date.now()
            };
            await database.updateGuild(guildId, {
                $set: {
                    [`waitMessageCommands.autoResponse.${objName}`]: guildDatabase.waitMessageCommands.autoResponse[objName]
                }
            });
        }

        /**
         * Tetikleyici mesajı ayarlama
         * @param {Message} message 
         */
        async function setTriggerMessage(message) {
            await Promise.all([
                // Veriyi kaydet
                saveDatabase(message, "setTriggerMessage"),

                // Mesaj atmasını bekle
                message.channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        // Veriyi kaydet ve sonraki fonksiyona geç
                        autoResponse.triggerMessage = message.content;
                        message.reply(messages.sendMessage);
                        return await setSendMessage(message);
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        message.reply(otherMessages.timeIsUp(authorId));

                        delete guildDatabase.waitMessageCommands.autoResponse[objName];
                        await database.updateGuild(guildId, {
                            $unset: {
                                [`waitMessageCommands.autoResponse.${objName}`]: ""
                            }
                        });
                    })
            ]);
        }

        /**
        * Tetikleyici mesajı atan kullanıcıya atılacak mesajı ayarlama
        * @param {Message} message 
        */
        async function setSendMessage(message) {
            await Promise.all([
                // Veriyi kaydet
                saveDatabase(message, "setSendMessage"),

                // Mesaj atmasını bekle
                message.channel?.awaitMessages({
                    filter,
                    max: 1,
                    time: timeout,
                    errors: ["time"]
                })
                    // Eğer mesaj attıysa
                    .then(async discordMessages => {
                        const message = discordMessages.first();

                        // Veriyi database'ye kaydet
                        guildDatabase.autoResponse[autoResponse.triggerMessage] = {
                            content: message.content,
                            timestamp: Date.now()
                        };
                        delete guildDatabase.waitMessageCommands.autoResponse[objName];
                        await database.updateGuild(guildId, {
                            $set: {
                                [`autoResponse.${autoResponse.triggerMessage}`]: guildDatabase.autoResponse[autoResponse.triggerMessage]
                            },
                            $unset: {
                                [`waitMessageCommands.autoResponse.${objName}`]: ""
                            }
                        });

                        return errorEmbed(
                            messages.success.description,
                            "success",
                            undefined,
                            {
                                fields: [
                                    {
                                        name: "\u200b",
                                        value: "\u200b",
                                        inline: false
                                    },
                                    {
                                        name: messages.success.send,
                                        value: autoResponse.triggerMessage,
                                        inline: false
                                    },
                                    {
                                        name: messages.success.trigger,
                                        value: message.content,
                                        inline: false
                                    }
                                ]
                            }
                        );
                    })
                    // Eğer mesaj atmadıysa
                    .catch(async () => {
                        message.reply(otherMessages.timeIsUp(authorId));

                        delete guildDatabase.waitMessageCommands.autoResponse[objName];
                        await database.updateGuild(guildId, {
                            $unset: {
                                [`waitMessageCommands.autoResponse.${objName}`]: ""
                            }
                        });
                    })
            ]);
        }

        // Eğer Bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır 
        if (extras) {
            const {
                functionName,
                autoResponseData
            } = extras;
            autoResponse = autoResponseData;

            return {
                async setTriggerMessage() {
                    msg.reply(
                        messages.restart.description + messages.restart.trigger
                    )
                    return setTriggerMessage(msg);
                },
                async setSendMessage() {
                    msg.reply(
                        messages.restart.description + messages.restart.send
                    )
                    return setSendMessage(msg);
                }
            }[functionName](msg);
        };

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {
            // Eğer otocevap ayarlamak istiyorsa
            case "add": {
                msg.reply(
                    messages.set.trigger
                );
                return setTriggerMessage(msg);
            };

            // Eğer ayarlanan otocevabı kaldırmak istiyorsa
            case "remove": {

                const removeArr = [...removeSet];

                // Çıkarılacak mesajı seç
                const message = msg.content.slice(
                    msg.content.search(
                        new RegExp(`(?<=${removeArr.join("|")})`, "i")
                    )
                ).trim();

                // Eğer bir mesaj girmemişse
                if (!message) return errorEmbed(
                    messages.remove.trigger(prefix),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer mesaj otocevap verisinde yoksa hata döndür
                if (!(message in guildDatabase.autoResponse)) return errorEmbed(messages.remove.noData);

                // Database'ye kaydet
                delete guildDatabase.autoResponse[message];
                await database.updateGuild(guildId, {
                    $unset: {
                        [`autoResponse.${message}`]: ""
                    }
                });

                return errorEmbed(messages.remove.success(message), "success");
            }

            // Eğer otocevap listesini göstermek istiyorsa
            case "list": {

                const allAutoResponseDatas = Object.entries(guildDatabase.autoResponse);
                const length = allAutoResponseDatas.length;

                // Eğer hiç veri yoksa
                if (length === 0) return errorEmbed(messages.list.noData);

                const MAX_LENGTH = 75;

                const clientAvatar = msg.client.user.displayAvatarURL();

                return createMessageArrows({
                    msg,
                    array: allAutoResponseDatas,
                    async arrayValuesFunc({
                        result: [triggerMessage, {
                            content,
                            timestamp
                        }],
                    }) {
                        // Milisaniyeyi saniyeye çevirme
                        timestamp = Util.msToSecond(timestamp);

                        return `• ${Util.truncatedString(triggerMessage, MAX_LENGTH)}\n` +
                            `• ${Util.truncatedString(content, MAX_LENGTH)}\n` +
                            `• **${messages.timestamp}:** <t:${timestamp}:F> - <t:${timestamp}:R>`
                    },
                    embed: {
                        author: {
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        },
                        description: messages.list.description(length),
                        thumbnail: clientAvatar,
                    },
                    pageJoin: "\n\n",
                    VALUES_PER_PAGE: 5,
                    language
                });
            }

            // Eğer geçerli bir seçenek girmediyse
            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye
                )
        }

    },
};