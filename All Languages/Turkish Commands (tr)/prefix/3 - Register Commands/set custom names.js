"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "isim-özel", // Komutun ismi
    id: "isim-özel", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "isim-özel",
        "isimözel",
        "özel-isim",
        "özelisimler",
        "özel-isimler",
        "customnames",
        "custom-names",
    ],
    description: "Düzenlenecek isimleri değiştirmenizi sağlar", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>isim-özel <Seçenekler> <Düzenlenecek yeni isim>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Eğer kullanıcıda "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const guildTag = guildDatabase.register.tag;
        const user = msgMember.user;

        // Girilen değere göre değiştirilecek ismi değiştir
        switch (args[0]?.toLocaleLowerCase(language)) {
            // Eğer kayıt sırasında değiştirilecek ismi değiştirmek istiyorsa
            case "kayıt":
            case "register": {
                const changeName = args.slice(1).join(" ");

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `Buradaki değişkenleri kullanarak kayıt edilen kişinin ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}${this.name} kayıt sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Girdiğiniz ismi ekler - ( ${Util.recreateString(user.displayName)} )\n` +
                    `**• <yaş>** => Eğer yaşını girdiyseniz yaşını ekler, girmediyseniz hiçbir şey eklemez - ( 20 )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kayıt <tag> <isim> [<yaş>]\n` +
                    `• ${prefix}${this.name} kayıt ♫ <isim> | <yaş> <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (["sıfırla", "sifirla"].includes(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.register == "<tag> <name>") return errorEmbed("Kullanıcının kayıt sırasında düzenlenecek ismi zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.register = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Kullanıcının kayıt sırasında düzenlenecek ismi başarıyla sıfırlandı!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.register = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "Kullanıcının kayıt sırasında düzenlenecek ismi başarıyla güncellendi!\n\n" +
                    "**Şöyle gözükecek**"
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
            case "kayıtbot":
            case "botkayıt":
            case "registerbot":
            case "botregister": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.recreateString(msg.client.user.displayName);

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `Buradaki değişkenleri kullanarak kayıt edilen __botun__ ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}${this.name} kayıtbot sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Girdiğiniz ismi ekler - ( ${recreateClientName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kayıtkayıt <tag> <isim>\n` +
                    `• ${prefix}${this.name} kayıtkayıt ♫ <isim> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (["sıfırla", "sifirla"].includes(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.registerBot == "<tag> <name>") return errorEmbed("Botun kayıt sırasında düzenlenecek ismi zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.registerBot = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Botun kayıt sırasında düzenlenecek ismi başarıyla sıfırlandı!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.registerBot = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "Botun kayıt sırasında düzenlenecek ismi başarıyla güncellendi!\n\n" +
                    "**Şöyle gözükecek**"
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
            case "giriş":
            case "giris":
            case "guildadd": {
                const changeName = args.slice(1).join(" ");

                const recreateUserName = Util.recreateString(user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `Buradaki değişkenleri kullanarak sunucuya giren kişinin ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}${this.name} giriş sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Kullanıcının ismini yazar - ( ${recreateUserName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} giriş <tag> <isim>\n` +
                    `• ${prefix}${this.name} giriş ♫ <isim> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (["sıfırla", "sifirla"].includes(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed("Kullanıcının sunucuya girdiğinde düzenlenecek ismi zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Kullanıcının sunucuya girdiğinde düzenlenecek ismi başarıyla sıfırlandı!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "Kullanıcının sunucuya girdiğinde düzenlenecek ismi başarıyla güncellendi!\n\n" +
                    "**Şöyle gözükecek**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.unregisterName({
                            message: changeName,
                            guildDatabase,
                            name: msgMember.displayName
                        })
                    )
                );
            }

            case "girişbot":
            case "botgiriş":
            case "girisbot":
            case "botgiris":
            case "guildaddbot":
            case "botguildadd": {
                const changeName = args.slice(1).join(" ");

                const recreateClientName = Util.recreateString(msg.client.user.displayName)

                // Eğer bir şey girmediyse bilgilendirme mesajı gönder
                if (!changeName) return errorEmbed(
                    `Buradaki değişkenleri kullanarak sunucuya giren __botun__ ismini daha güzel bir hale getirebilirsin :)\n` +
                    `• Eğer sıfırlamak istiyorsanız **${prefix}${this.name} girişbot sıfırla** yazabilirsiniz\n\n` +
                    `**Değişkenler**\n` +
                    `**• <tag>** => Sunucunun tagını ekler - ( ${guildTag || "Tag yok"} )\n` +
                    `**• <isim>** => Kullanıcının ismini yazar - ( ${recreateClientName} )\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} girişbot <tag> <isim>\n` +
                    `• ${prefix}${this.name} girişbot ♫ <isim> | <tag>`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Eğer sıfırlamak istiyorsa
                if (["sıfırla", "sifirla"].includes(changeName.toLocaleLowerCase(language))) {
                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.register.customNames.guildAdd == "<tag> <name>") return errorEmbed("Botun sunucuya girdiğinde düzenlenecek ismi zaten sıfırlanmış durumda");

                    // Database'ye kaydet
                    guildDatabase.register.customNames.guildAdd = "<tag> <name>";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("Botun sunucuya girdiğinde düzenlenecek ismi başarıyla sıfırlandı!", "success");
                }

                // Database'ye kaydet
                guildDatabase.register.customNames.guildAdd = changeName;
                database.writeFile(guildDatabase, guildId);

                await msg.reply(
                    "Botun sunucuya girdiğinde düzenlenecek ismi başarıyla güncellendi!\n\n" +
                    "**Şöyle gözükecek**"
                );

                return msg.channel.send(
                    Util.recreateString(
                        Util.customMessages.unregisterName({
                            message: changeName,
                            guildDatabase,
                            name: guildMe.displayName
                        })
                    )
                );
            }

            // Eğer bir şey girmediyse hata döndür
            default:
                return errorEmbed(
                    `• Yeni gelen kullanıcının ismini düzenlemek için **${prefix}${this.name} giriş**\n` +
                    `• Birisini kayıt ettikten sonraki ismini düzenlemek için **${prefix}${this.name} kayıt**\n\n` +
                    `• Yeni gelen __botun__ ismini düzenlemek için **${prefix}${this.name} girişbot**\n` +
                    `• Bir __botu__ kayıt ettikten sonraki ismini düzenlemek için **${prefix}${this.name} kayıtbot** yazabilirsiniz`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );
        }

    },
};