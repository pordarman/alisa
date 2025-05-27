"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "isim-özel",
        en: "customnames"
    },
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "isim-özel",
            "isimözel",
            "özel-isim",
            "özelisimler",
            "özel-isimler",
            "customnames",
            "custom-names",
        ],
        en: [
            "customnames",
            "custom-names",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Düzenlenecek isimleri değiştirmenizi sağlar",
        en: "Allows you to change the names to be edited"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>isim-özel <Seçenekler> <Düzenlenecek yeni isim>",
        en: "<px>customnames <Options> <New name to be edited>"
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
        msgMember,
        args,
        prefix,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                "isim-özel": messages
            },
            permissions: permissionMessages,
            sets: {
                resets: resetSet
            },
            switchs: {
                setCustomNames: switchKey
            }
        } = allMessages[language];

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const guildTag = guildDatabase.register.tag;
        const user = msgMember.user;

        // Girilen değere göre değiştirilecek ismi değiştir
        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {
            // Eğer kayıt sırasında değiştirilecek ismi değiştirmek istiyorsa
            case "register": {
                const changeName = args.slice(1).join(" ");

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    messages.register.enter({
                        prefix,
                        guildTag,
                        userDisplayName: Util.escapeMarkdown(user.displayName)
                    }),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (resetSet.has(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.register == "<tag> <name>") return errorEmbed(messages.register.reset.already);

                    // Database'ye kaydet
                    guildDatabase.register.customNames.register = "<tag> <name>";
                    await database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.register": guildDatabase.register.customNames.register
                        }
                    });

                    return errorEmbed(messages.register.reset.success, "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.register = changeName;

                await Promise.all([
                    database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.register": guildDatabase.register.customNames.register
                        }
                    }),
                    msg.reply(messages.register.success)
                ]);

                return msg.channel.send(
                    Util.escapeMarkdown(
                        Util.customMessages.registerName({
                            message: changeName,
                            name: user.displayName,
                            guildDatabase,
                            age: "20",
                            isBot: false
                        })
                    )
                );
            }

            // Eğer bot kayıt sırasında değiştirilecek ismi değiştirmek istiyorsa
            case "registerbot": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.escapeMarkdown(msg.client.user.displayName);

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    messages.registerbot.enter({
                        prefix,
                        guildTag,
                        userDisplayName: recreateClientName
                    }),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (resetSet.has(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.registerBot == "<tag> <name>") return errorEmbed(messages.registerbot.reset.already);

                    // Database'ye kaydet
                    guildDatabase.register.customNames.registerBot = "<tag> <name>";
                    await database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.registerBot": guildDatabase.register.customNames.registerBot
                        }
                    });

                    return errorEmbed(messages.registerbot.reset.success, "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.registerBot = changeName;

                await Promise.all([
                    database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.registerBot": guildDatabase.register.customNames.registerBot
                        }
                    }),
                    msg.reply(messages.registerbot.success)
                ]);

                return msg.channel.send(
                    Util.escapeMarkdown(
                        Util.customMessages.registerName({
                            message: changeName,
                            name: recreateClientName,
                            guildDatabase,
                            age: null,
                            isBot: true
                        })
                    )
                );
            }

            // Eğer kullanıcı sunucuya girdikten sonraki ismi değiştirmek istiyorsa
            case "login": {
                const changeName = args.slice(1).join(" ");

                const recreateUserName = Util.escapeMarkdown(user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    messages.login.enter({
                        prefix,
                        guildTag,
                        userDisplayName: recreateUserName
                    }),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (resetSet.has(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed(messages.login.reset.already);

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    await database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.guildAdd": guildDatabase.register.customNames.guildAdd
                        }
                    });

                    return errorEmbed(messages.login.reset.success, "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;

                await Promise.all([
                    database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.guildAdd": guildDatabase.register.customNames.guildAdd
                        }
                    }),
                    msg.reply(messages.login.success)
                ]);

                return msg.channel.send(
                    Util.escapeMarkdown(
                        Util.customMessages.unregisterName({
                            message: changeName,
                            name: recreateUserName,
                            guildDatabase,
                        })
                    )
                );
            }

            // Eğer bot sunucuya girdikten sonraki ismi değiştirmek istiyorsa
            case "loginbot": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.escapeMarkdown(msg.client.user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    messages.loginbot.enter({
                        prefix,
                        guildTag,
                        userDisplayName: recreateClientName
                    }),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (resetSet.has(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed(messages.loginbot.reset.already);

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    await database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.guildAdd": guildDatabase.register.customNames.guildAdd
                        }
                    });

                    return errorEmbed(messages.loginbot.reset.success, "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;

                await Promise.all([
                    database.updateGuild(guildId, {
                        $set: {
                            "register.customNames.guildAdd": guildDatabase.register.customNames.guildAdd
                        }
                    }),
                    msg.reply(messages.loginbot.success)
                ]);

                return msg.channel.send(
                    Util.escapeMarkdown(
                        Util.customMessages.unregisterName({
                            message: changeName,
                            name: recreateClientName,
                            guildDatabase,
                        })
                    )
                );
            }

            // Eğer bir şey girmediyse hata döndür
            default:
                return errorEmbed(
                    messages.enter(prefix),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );
        }

    },
};