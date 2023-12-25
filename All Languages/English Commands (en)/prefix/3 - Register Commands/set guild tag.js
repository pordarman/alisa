"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "settag", // Komutun ismi
    id: "tagayarla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "settag",
        "tagset",
        "set-tag"
    ],
    description: "You set the tag of the server", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>settag <Your tag>", // Komutun kullanım şekli
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
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const newTag = args.join(" ");

        // Eğer tagı girmediyse bilgilendirme mesajı gönder
        if (!newTag) return errorEmbed(
            `• To set a tag, you can write **${prefix}${this.name} <Your Tag>**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn",
            15 * 1000 // Mesajı 15 saniye boyunca göster
        );

        // Eğer tagı sıfırlamak istiyorsa
        if (newTag.toLocaleLowerCase(language) == "reset") {
            // Eğer tag zaten sıfırlanmışsa
            if (!guildDatabase.register.tag) return errorEmbed(`The tag I will add to members has already been reset`);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.tag = "";
            database.writeFile(guildDatabase, guildId);

            return errorEmbed(`The tag I will add to members has been successfully reset`, "success");
        }

        // Eğer tag uzunluğu sınırı aşıyorsa hata döndür
        if (newTag.length > Util.MAX.tagLength) return errorEmbed(`Your tag length can be maximum ${Util.MAX.tagLength} characters!`);

        // Eğer tag zaten ayarlanan tagsa
        if (newTag === guildDatabase.register.tag) return errorEmbed("The server's tag is the same as the tag you wrote");

        // Tagı kaydet ve Database'ye kaydet
        guildDatabase.register.tag = newTag;
        database.writeFile(guildDatabase, guildId);

        // Botun tagı nasıl kullandığını göstermek için örnek göster
        const exampleName = Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            memberName: "Fearless Crazy",
            guildDatabase,
            inputAge: ["20"],
            isBot: false
        });

        return errorEmbed(
            `The tag I will add to the members' names has been successfully set to **${newTag}**\n\n` +
            `**Example:**\n` +
            `${exampleName}`,
            "success"
        );

    },
};