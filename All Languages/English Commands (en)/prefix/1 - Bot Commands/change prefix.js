"use strict";
const {
    prefix: defaultPrefix
} = require("../../../../settings.json");
const database = require("../../../../Helpers/Database");

module.exports = {
    name: "prefix", // Komutun ismi
    id: "prefix", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "prefix",
        "setprefix",
        "set-prefix",
    ],
    description: "Changes server-specific prefix", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>prefix <New prefix>", // Komutun kullanım şekli
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
        args,
        prefix,
        guildId,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const newPrefix = args[0]?.toLocaleLowerCase(language);

        // Eğer yeni prefixi yazmadıysa bilgilendirme mesajı gönder
        if (!newPrefix) return errorEmbed(
            `Please write new prefix\n\n` +
            `**Example:**\n` +
            `• ${prefix}prefix a!` +
            `• ${prefix}prefix reset (resets prefix to default value **(${defaultPrefix})**)`,
            "warn"
        );

        // Eğer değiştirmeye çalıştığı prefix şimdiki prefixle aynıysa
        if (newPrefix === defaultPrefix) return errorEmbed(`The prefix of the bot is already the same as the prefix you are trying to change, you stupid thing :)`);

        // Eğer prefixi sıfırlamaya çalışıyorsa
        if ([defaultPrefix, "reset"].includes(newPrefix)) {
            guildDatabase.prefix = defaultPrefix;
            database.writeFile(guildDatabase, guildId);
            return errorEmbed(
                `Your prefix has been successfully reset to default value **(${defaultPrefix})**!`,
                "success",
                null,
                {
                    fields: [
                        {
                            name: "Example",
                            value: `\`\`\`css\n` +
                                `${defaultPrefix}help\n` +
                                `${defaultPrefix}prefix\n` +
                                `${defaultPrefix}support\n` +
                                `@${msg.client.user.tag} help\n\`\`\``
                        }
                    ]
                }
            );
        }

        // Prefixin uzunluğu 5'den uzunsa hata döndür
        if (newPrefix.length > 5) return errorEmbed(`Your prefix length cannot be longer than 5!`);

        guildDatabase.prefix = newPrefix;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Your prefix has been successfully changed to **${newPrefix}**!`,
            "success",
            null,
            {
                fields: [
                    {
                        name: "Example",
                        value: `\`\`\`css\n` +
                            `${newPrefix}help\n` +
                            `${newPrefix}prefix\n` +
                            `${newPrefix}support\n` +
                            `@${msg.client.user.tag} help\n\`\`\``
                    }
                ]
            }
        );
    },
};