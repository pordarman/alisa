"use strict";
const {
    prefix: defaultPrefix
} = require("../../../settings.json");
const database = require("../../../Helpers/Database.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "prefix",
        en: "prefix"
    },
    id: "prefix", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "prefix",
            "prefixayarla",
            "prefix-ayarla",
            "setprefix",
            "set-prefix",
            "px"
        ],
        en: [
            "prefix",
            "setprefix",
            "set-prefix",
            "px"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucuya özel prefixi değiştirir",
        en: "Changes server-specific prefix"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>prefix <Yeni prefix>",
        en: "<px>prefix <New prefix>"
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
        errorEmbed
    }) {

        const {
            commands: {
                prefix: messages
            },
            permissions: permissionMessages,
            sets: {
                resets: resetSet
            }
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(permissionMessages.administrator, "memberPermissionError");

        const newPrefix = args[0]?.toLocaleLowerCase(language);

        // Eğer yeni prefixi yazmadıysa bilgilendirme mesajı gönder
        if (!newPrefix) return errorEmbed(
            messages.enter(prefix),
            "warn"
        );

        // Eğer değiştirmeye çalıştığı prefix şimdiki prefixle aynıysa
        if (newPrefix === prefix) return errorEmbed(messages.samePrefix);

        resetSet.add(defaultPrefix)

        // Eğer prefixi sıfırlamaya çalışıyorsa
        if (resetSet.has(newPrefix)) {
            guildDatabase.prefix = defaultPrefix;
            await database.updateGuild(guildId, {
                $set: {
                    prefix: defaultPrefix
                }
            });
            return errorEmbed(
                messages.embed.description(defaultPrefix),
                "success",
                undefined,
                {
                    fields: [
                        {
                            name: messages.embed.field.name,
                            value: messages.embed.field.value({
                                newPrefix,
                                userTag: msg.client.user.tag
                            }),
                            inline: false
                        }
                    ]
                }
            );
        }

        // Prefixin uzunluğu 5'den uzunsa hata döndür
        if (newPrefix.length > 5) return errorEmbed(messages.noLongerThan5);

        guildDatabase.prefix = newPrefix;
        await database.updateGuild(guildId, {
            $set: {
                prefix: newPrefix
            }
        });
        return errorEmbed(
            messages.embed.description(newPrefix),
            "success",
            undefined,
            {
                fields: [
                    {
                        name: messages.embed.field.name,
                        value: messages.embed.field.value({
                            newPrefix,
                            userTag: msg.client.user.tag
                        }),
                        inline: false
                    }
                ]
            }
        );
    },
};