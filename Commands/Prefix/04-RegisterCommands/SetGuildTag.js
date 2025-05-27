"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "tagayarla",
        en: "settag"
    },
    id: "tagayarla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "tagayarla",
            "tag-a",
            "settag",
            "tagset",
            "set-tag"
        ],
        en: [
            "settag",
            "tagset",
            "set-tag"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun tagını ayarlarsınız",
        en: "You set the tag of the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Kayıt komutları",
        en: "Register commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>tagayarla <Tagınız>",
        en: "<px>settag <Your tag>"
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
                tagayarla: messages
            },
            permissions: permissionMessages,
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const newTag = args.join(" ");

        // Eğer tagı girmediyse bilgilendirme mesajı gönder
        if (!newTag) return errorEmbed(
            messages.enter(prefix),
            "warn",
            30 * 1000 // Mesajı 30 saniye boyunca göster
        );

        // Eğer tagı sıfırlamak istiyorsa
        if (resetSet.has(newTag.toLocaleLowerCase(language))) {
            // Eğer tag zaten sıfırlanmışsa
            if (!guildDatabase.register.tag) return errorEmbed(messages.alreadyReset);

            // Tagı sıfırla ve Database'ye kaydet
            guildDatabase.register.tag = "";
            await database.updateGuild(guildId, {
                $set: {
                    "register.tag": ""
                }
            });

            return errorEmbed(messages.successReset, "success");
        }

        // Eğer tag uzunluğu sınırı aşıyorsa hata döndür
        if (newTag.length > Util.MAX.tagLength) return errorEmbed(messages.maxError(Util.MAX.tagLength));

        // Eğer tag zaten ayarlanan tagsa
        if (newTag === guildDatabase.register.tag) return errorEmbed(messages.sameTag);

        // Tagı kaydet ve Database'ye kaydet
        guildDatabase.register.tag = newTag;
        await database.updateGuild(guildId, {
            $set: {
                "register.tag": guildDatabase.register.tag
            }
        });

        // Botun tagı nasıl kullandığını göstermek için örnek göster
        const exampleName = Util.customMessages.registerName({
            message: guildDatabase.register.customNames.register,
            name: "Fearless Crazy",
            guildDatabase,
            age: "20",
            isBot: false
        });

        return errorEmbed(
            messages.success({
                tag: newTag,
                example: exampleName
            }),
            "success"
        );

    },
};