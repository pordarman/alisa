"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    channelIds: {
        suggestion: suggestionChannelId
    },
    EMOJIS,
    supportGuildId
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "öneri", // Komutun ismi
    id: "öneri", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "öneri",
        "suggestion"
    ],
    description: "Bot hakkında öneriler yaparsınız", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>öneri <Mesajınız>", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const suggestionMessage = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!suggestionMessage) return errorEmbed(`Lütfen bot hakkındaki önerilerinizi yazınız`);

        const embed = new EmbedBuilder()
            .setTitle("💬 Bir yeni öneri var")
            .addFields(
                {
                    name: "Kullanıcı",
                    value: `**${Util.recreateString(msg.author.displayName)}** - (${authorId})`
                },
                {
                    name: "Öneri mesajı",
                    value: suggestionMessage
                }
            )
            .setColor("#41b6cc")
            .setFooter({
                text: `${msg.client.user.tag} teşekkür eder...`
            });

        // Mesajı destek sunucusunun kanalına gönder
        Util.webhooks.suggestion.send({
            embeds: [
                embed
            ]
        });

        return msg.reply(`💬 **Öneriniz alındı ve sahibime iletildi. Desteğiniz için teşekkürler 💗**`);

    },
};