"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder, AttachmentBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "günlüközel",
        en: "customafterreg"
    },
    id: "günlüközel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "günlüközel",
            "günlüközelmesaj",
            "afterregistermessage",
            "afterregister",
        ],
        en: [
            "customafterreg",
            "customafterregister",
            "afterregistermessage",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt sonrası mesajını özelleştirebilmenizi sağlar",
        en: "Allows you to customize the post-registration message"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>günlüközel",
        en: "<px>customafterreg"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guildId,
        guild,
        msgMember,
        authorId,
        language,
        errorEmbed,
        extras
    }) {

        const {
            commands: {
                "günlüközel": messages
            },
            permissions: permissionMessages,
            registers: registerMessages,
            others: otherMessages,
            switchs: {
                cancelOrReset: switchKey
            }
        } = allMessages[language];

        // Bu fonksiyonu bot yeniden başlatıldıktan sonra da kullanacağımız için bir fonksiyon şeklinde yapıyoruz
        async function waitMessage() {
            // Mesaj atmasını bekle
            msg.channel?.awaitMessages({
                filter: message => message.author.id === authorId && message.content?.trim()?.length > 0,
                max: 1,
                time: 1000 * 60 * 16, // 16 dakika
                errors: ["time"]
            })
                // Eğer mesaj attıysa
                .then(async discordMessages => {
                    delete guildDatabase.waitMessageCommands.customAfterRegister;
                    await database.updateGuild(guildId, {
                        $unset: {
                            "waitMessageCommands.customAfterRegister": ""
                        }
                    });

                    const message = discordMessages.first();
                    // Mesajın başındaki ve sonundaki boşlukları kaldır
                    message.content = message.content.trim();

                    switch (switchKey(message.content?.toLocaleLowerCase(language))) {
                        // Eğer işlemi iptal ettiyse
                        case "cancel":
                            return message.reply(messages.cancel);

                        // Eğer ayarlanan veriyi sıfırlamak istiyorsa
                        case "reset": {
                            // Eğer zaten sıfırlanmışsa
                            if (!guildDatabase.register.customAfterRegister.content) return message.reply(messages.resets.already);

                            // Database'ye kaydet
                            guildDatabase.register.customAfterRegister = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            };
                            await database.updateGuild(guildId, {
                                $set: {
                                    "register.customAfterRegister": guildDatabase.register.customAfterRegister
                                }
                            });

                            return message.reply(messages.resets.success);
                        }

                        // Eğer bir şeyler ayarlamak istiyorsa
                        default: {

                            // Mesajın kutulu mu kutusuz mu olacağını kontrol etmek için yeni bir string oluşturacağız
                            // Ve ikisi arasında karakter farkı varsa "kutulu", yoksa "kutusuz" olduğunu ayarlayacağız
                            let newString = message.content.replace(/<\/?(unboxed|kutusuz)>/g, "");
                            const isEmbed = message.content.length == newString.length;
                            const maxLength = isEmbed ? Util.MAX.customMessageLength.embed : Util.MAX.customMessageLength.message;

                            // Eğer mesajda çok fazla karakter varsa
                            if (message.content.length > maxLength) return message.reply(
                                messages.tooMuchCharacter(maxLength)
                            );

                            // Mesajdan resmi çek
                            let image = message.attachments.find(({ contentType }) => contentType?.startsWith("image/"))?.url;

                            // Eğer resim yoksa URL'yi çekmeye çalış
                            if (!image) {
                                image = message.content.match(Util.regex.fetchURL)?.[0];

                                // Eğer URL'yi çektiyse mesajdan URL'yi kaldır
                                if (image) {
                                    newString = newString.replace(image, "");
                                }
                            }

                            // Mesajın başındaki ve sonundaki \n karakterlerini kaldır
                            newString = newString.trim();

                            // Database'ye kaydet
                            guildDatabase.register.customAfterRegister = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            await database.updateGuild(guildId, {
                                $set: {
                                    "register.customAfterRegister": guildDatabase.register.customAfterRegister
                                }
                            });

                            message.reply(messages.success)


                            const messageContent = Util.customMessages.afterRegisterMessage({
                                message: newString,
                                language,
                                memberId: clientUser.id,
                                recreateMemberName: recreateClientName,
                                givenRolesString: messages.givenRoles,
                                memberCount: guild.memberCount,
                                authorId,
                                recreateAuthorName,
                                guildTag,
                                toHumanizeRegisterCount: "888"
                            });

                            const allAfterRegisterMessages = otherMessages.afterRegister.member

                            return msg.reply(
                                isEmbed ?
                                    // Eğer mesajı embed olarak ayarlamışlarsa
                                    {
                                        content: Util.random(allAfterRegisterMessages).replace("<m>", `<@${clientUser.id}>`),
                                        embeds: [
                                            new EmbedBuilder()
                                                .setTitle(`${registerMessages.embedAfterRegister.title} ${recreateClientName} ${EMOJIS.hi}`)
                                                .setDescription(messageContent)
                                                .setThumbnail(msg.client.user.displayAvatarURL())
                                                .setImage(image || null)
                                                .setColor("Random")
                                                .setTimestamp()
                                        ]
                                    } :
                                    // Eğer kutusuz olarak ayarlamışlarsa
                                    {
                                        content: messageContent,
                                        files: image ?
                                            [new AttachmentBuilder(image)] :
                                            [],
                                        allowedMentions: {
                                            roles: [],
                                            users: []
                                        }
                                    }
                            )
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(async () => {
                    msg.reply(otherMessages.timeIsUp(authorId));

                    delete guildDatabase.waitMessageCommands.customAfterRegister;
                    await database.updateGuild(guildId, {
                        $unset: {
                            "waitMessageCommands.customAfterRegister": ""
                        }
                    });
                });
        }

        const guildTag = guildDatabase.register.tag;
        const clientUser = msg.client.user;
        const recreateClientName = Util.escapeMarkdown(clientUser.displayName);
        const recreateAuthorName = Util.escapeMarkdown(msg.author.displayName);

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customAfterRegister) return errorEmbed(messages.another);

        const NOW_TIME = Date.now();

        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customAfterRegister = {
            commandName: this.name[language],
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };

        const embed = new EmbedBuilder()
            .setTitle(messages.embed.title)
            .setDescription(
                messages.embed.description({
                    clientUserId: clientUser.id,
                    recreateClientName,
                    guildTag,
                    memberCount: Util.toHumanize(guild.memberCount, language),
                    memberCountEmojis: Util.stringToEmojis(guild.memberCount),
                    authorId,
                    recreateAuthorName
                })
            )
            .setImage("https://i.hizliresim.com/dbe56m0.png")
            .setColor("Blue")
            .setFooter({
                text: messages.embed.footer,
            });

        msg.reply({
            embeds: [
                embed
            ]
        });
        return await Promise.all([
            database.updateGuild(guildId, {
                $set: {
                    "waitMessageCommands.customAfterRegister": guildDatabase.waitMessageCommands.customAfterRegister
                }
            }),
            waitMessage()
        ])
    },
};