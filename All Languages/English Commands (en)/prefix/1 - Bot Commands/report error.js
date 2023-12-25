"use strict";
const {
    EmbedBuilder
} = require("discord.js");
const {
    channelIds: {
        bug: bugChannelId
    },
    supportGuildId
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "error", // Komutun ismi
    id: "hata", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "error"
    ],
    description: "You report a bug in the bot", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>error <Error message>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        authorId,
        errorEmbed,
    }) {

        const bugMessage = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!bugMessage) return errorEmbed(`Please briefly summarize the error you found`);

        const embed = new EmbedBuilder()
            .setTitle("📢 Bir yeni hata var")
            .addFields(
                {
                    name: "Kullanıcı",
                    value: `**${Util.recreateString(msg.author.displayName)}** - (${authorId})`
                },
                {
                    name: "Hata mesajı",
                    value: bugMessage
                }
            )
            .setColor("#41b6cc")
            .setFooter({
                text: `${msg.client.user.tag} teşekkür eder...`
            });

        // Mesajı destek sunucusunun kanalına gönder
        Util.webhooks.reportBug.send({
            embeds: [
                embed
            ]
        });

        return msg.reply(`📢 **Your error message has been received and forwarded to my owner. Thank you for your support 💗**`);

    },
};