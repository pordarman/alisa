"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "tagayarla", // Komutun ismi
    id: "tagayarla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "tagayarla",
        "tag-a",
        "settag",
        "tagset",
        "set-tag"
    ],
    description: "Sunucunun tagını ayarlarsınız", // Komutun açıklaması
    category: "Kayıt komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>tagayarla <Tagınız>", // Komutun kullanım şekli
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

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const newTag = args.join(" ");

        // Eğer tagı girmediyse bilgilendirme mesajı gönder
        if (!newTag) return errorEmbed(
            `• Tag ayarlamak için **${prefix}${this.name} <Tagınız>**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn",
            15 * 1000 // Mesajı 15 saniye boyunca göster
        );

        // Eğer tagı sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(newTag.toLocaleLowerCase(language))) {
            // Eğer tag zaten sıfırlanmışsa
            if (!guildDatabase.register.tag) return errorEmbed(`Üyelere ekleyeceğim tag zaten sıfırlanmış durumda`);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.tag = "";
            database.writeFile(guildDatabase, guildId);

            return errorEmbed(`Üyelere ekleyeceğim tag başarıyla sıfırlandı`, "success");
        }

        // Eğer tag uzunluğu sınırı aşıyorsa hata döndür
        if (newTag.length > Util.MAX.tagLength) return errorEmbed(`Tag uzunluğunuz en fazla ${Util.MAX.tagLength} karakter olabilir!`);

        // Eğer tag zaten ayarlanan tagsa
        if (newTag === guildDatabase.register.tag) return errorEmbed("Suncunun tagı zaten yazdığınız tagla aynı");

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
            `Üyelerin isimlerine ekleyeceğim tag başarıyla **${newTag}** olarak ayarlandı\n\n` +
            `**Örnek:**\n` +
            `${exampleName}`,
            "success"
        );

    },
};