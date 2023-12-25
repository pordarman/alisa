"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "customnames", // Komutun ismi
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "customnames",
        "custom-names",
    ],
    description: "Allows you to change the names to be edited", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>customnames <Options> <New name to be edited>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const guildTag = guildDatabase.register.tag;
        const user = msgMember.user;

        // Girilen değere göre değiştirilecek ismi değiştir
        switch (args[0]?.toLocaleLowerCase(language)) {
            // Eğer kayıt sırasında değiştirilecek ismi değiştirmek istiyorsa
            case "registry":
            case "register": {
                const changeName = args.slice(1).join(" ");

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `You can make the name of the registered person more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}${this.name} register reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Adds the name you entered - ( ${Util.recreateString(user.displayName)} )\n` +
                    `**• <age>** => If you entered the age, it adds the age, if not, it does not add anything - ( 20 )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} register <tag> <name> [<age>]\n` +
                    `• ${prefix}${this.name} register ♫ <name> | <age> <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (changeName.toLocaleLowerCase(language) == "reset") {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.register == "<tag> <name>") return errorEmbed("The user's name to be edited during registration has already been reset");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.register = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("The user's name to be edited during registration has been successfully reset!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.register = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "The user's name to be edited during registration has been successfully updated!\n\n" +
                    "**It will look like this**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.registerName({
                            message: changeName,
                            memberName: user.displayName,
                            guildDatabase,
                            inputAge: ["20"],
                            isBot: false
                        })
                    )
                );
            }


            // Eğer bot kayıt sırasında değiştirilecek ismi değiştirmek istiyorsa
            case "registerbot":
            case "botregister": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.recreateString(msg.client.user.displayName);

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `You can make the registered __bot's__ name more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}${this.name} registerbot reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Adds the name you entered - ( ${recreateClientName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} registerbot <tag> <name>\n` +
                    `• ${prefix}${this.name} registerbot ♫ <name> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (changeName.toLocaleLowerCase(language) == "reset") {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.registerBot == "<tag> <name>") return errorEmbed("The bot's name to be edited during registration has already been reset");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.registerBot = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("The bot's name to be edited during registration has been successfully reset!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.registerBot = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "The bot's name to be edited during registration has been successfully updated!\n\n" +
                    "**It will look like this**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.registerName({
                            message: changeName,
                            memberName: recreateClientName,
                            guildDatabase,
                            inputAge: null,
                            isBot: true
                        })
                    )
                );
            }

            // Eğer kullanıcı sunucuya girdikten sonraki ismi değiştirmek istiyorsa
            case "guildadd":
            case "login": {
                const changeName = args.slice(1).join(" ");

                const recreateUserName = Util.recreateString(user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `You can make the name of the person entering the server more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}${this.name} login reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Writes the user's name - ( ${recreateUserName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} login <tag> <name>\n` +
                    `• ${prefix}${this.name} login ♫ <name> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (changeName.toLocaleLowerCase(language) == "reset") {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed("The user's name to be edited when entering the server has already been reset");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("The user's name to be edited when entering the server has been successfully reset!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "The user's name to be edited when entering the server has been successfully updated!\n\n" +
                    "**It will look like this**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.guildAddMessage({
                            message: changeName,
                            memberName: recreateUserName,
                            guildDatabase,
                        })
                    )
                );
            }

            case "guildaddbot":
            case "botguildadd":
            case "loginbot": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.recreateString(msg.client.user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `You can make the name of the __bot that enters the server more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}${this.name} loginbot reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Writes the user's name - ( ${recreateClientName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} loginbot <tag> <name>\n` +
                    `• ${prefix}${this.name} loginbot ♫ <name> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (changeName.toLocaleLowerCase(language) == "reset") {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed("The bot's name to be edited when it enters the server has already been reset");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("The bot's name to be edited when it enters the server has been successfully reset!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "The name of the bot when it enters the server has been successfully updated!\n\n" +
                    "**It will look like this**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.guildAddMessage({
                            message: changeName,
                            memberName: recreateClientName,
                            guildDatabase,
                        })
                    )
                );
            }

            // Eğer bir şey girmediyse hata döndür
            default:
                return errorEmbed(
                    `• To edit the new user's name, enter **${prefix}${this.name} login**\n` +
                    `• To edit someone's name after registering **${prefix}${this.name} register**\n\n` +
                    `• To edit the name of the new __bot__ **${prefix}${this.name} loginbot**\n` +
                    `• To edit the name of a __bot__ after registering it, you can type **${prefix}${this.name} registerbot**`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );
        }

    },
};