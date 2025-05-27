"use strict";
const database = require("../../../Helpers/Database.js");
const Time = require("../../../Helpers/Time");
const {
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "özel",
        en: "custom"
    },
    id: "özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "özel",
            "özelmesaj",
            "özelkayıtmesaj",
            "özel-mesaj",
            "özel-kayıt-mesaj",
            "custom",
            "customregister",
            "customregistermessage",
            "custom-register",
            "custom-register-message",
        ],
        en: [
            "custom",
            "customregister",
            "customregistermessage",
            "custom-register",
            "custom-register-message",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Giriş mesajını özelleştirebilmenizi sağlar",
        en: "Lets you customize the login message"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>özel",
        en: "<px>custom"
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
                özel: messages
            },
            permissions: permissionMessages,
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
                    delete guildDatabase.waitMessageCommands.customLogin;
                    await database.updateGuild(guildId, {
                        $unset: {
                            "waitMessageCommands.customLogin": ""
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
                            if (!guildDatabase.register.customLogin.content) return message.reply(messages.resets.already);

                            // Database'ye kaydet
                            guildDatabase.register.customLogin = {
                                content: "",
                                image: "",
                                isEmbed: false,
                            }
                            await database.updateGuild(guildId, {
                                $set: {
                                    "register.customLogin": guildDatabase.register.customLogin
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
                            guildDatabase.register.customLogin = {
                                content: newString,
                                image,
                                isEmbed,
                            };
                            await database.updateGuild(guildId, {
                                $set: {
                                    "register.customLogin": guildDatabase.register.customLogin
                                }
                            });

                            return message.reply(messages.success);
                        }
                    }

                    // Eğer işlemi sıfırladıysa
                })
                // Eğer mesaj atmadıysa
                .catch(async () => {
                    msg.reply(otherMessages.timeIsUp(authorId));

                    delete guildDatabase.waitMessageCommands.customLogin;
                    await database.updateGuild(guildId, {
                        $unset: {
                            "waitMessageCommands.customLogin": ""
                        }
                    });
                });
        }

        // Eğer bot mesaj bekliyorken yeniden başlamışsa hiç kontrol etmeden fonksiyonu çalıştır
        if (extras) return await waitMessage();

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        // Eğer bu komut şu anda çalışıyorsa
        if (guildDatabase.waitMessageCommands.customLogin) return errorEmbed(messages.another);

        const NOW_TIME = Date.now();

        // Eğer bot yeniden başlarsa gerekli verileri database'ye yazdır
        guildDatabase.waitMessageCommands.customLogin = {
            commandName: this.name[language],
            channelId: msg.channelId,
            messageId: msg.id,
            authorId,
            timestamp: NOW_TIME
        };

        const createdTimestamp = msg.author.createdTimestamp;
        const createdTimestampSecond = Util.msToSecond(createdTimestamp);

        const securityMessages = otherMessages.events.guildMemberAdd.security;
        const TWO_WEEKS = 1000 * 60 * 60 * 24 * 7 * 2;
        const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
        // Eğer kullanıcı hesabını son 2 hafta içinde açmışsa
        const security = createdTimestamp > (NOW_TIME - TWO_WEEKS) ?
            `${securityMessages.unsafe} ${EMOJIS.unsafe}` :
            // Eğer son 1 ay içinde açmışsa
            createdTimestamp > (NOW_TIME - ONE_MONTH) ?
                `${securityMessages.suspicious} ${EMOJIS.suspicious}` :
                // Eğer 1 aydan daha da önce açmışsa
                `${securityMessages.safe} ${EMOJIS.safe}`;

        const registerAuthRoleId = guildDatabase.register.roleIds.registerAuth;

        const embed = new EmbedBuilder()
            .setTitle(messages.embed.title)
            .setDescription(
                messages.embed.description({
                    guildName: guild.name,
                    registerAuthRoleId,
                    authorId,
                    authorDisplayName: Util.escapeMarkdown(msg.author.displayName),
                    memberCount: Util.toHumanize(guild.memberCount, language),
                    memberCountEmojis: Util.stringToEmojis(guild.memberCount),
                    createdTimestampSecond,
                    createdTimestampString: Time.toDateString(msg.author.createdTimestamp, language),
                    security
                })
            )
            .setImage("https://i.hizliresim.com/hjv5aum.png")
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
                    "waitMessageCommands.customLogin": guildDatabase.waitMessageCommands.customLogin
                }
            }),
            waitMessage()
        ]);
    },
};