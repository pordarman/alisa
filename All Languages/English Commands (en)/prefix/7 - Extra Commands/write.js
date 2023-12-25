"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "write", // Komutun ismi
    id: "yazdır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "write"
    ],
    description: "You can print any text you want to the bot", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>write <Your message>", // Komutun kullanım şekli
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
        language,
    }) {

        const writeMessage = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!writeMessage) return errorEmbed(
            `Please write the message you want me to write\n\n` +
            `**• Heyy, if you want me to quote a message, just __quote the message while using the command__. I left an image below, take a look at it:3**`,
            "error",
            15 * 1000, // Mesajı 15 saniye boyunca göster
            {
                image: "https://i.hizliresim.com/j44bees.png"
            }
        );

        // Kişinin yazdığı mesajı sil ve yazıyı yazdır
        msg.delete()
        const messageReferenceId = msg.reference?.messageId;
        const channel = msg.channel;

        // Mesaj atarken etiketlerin hiçbirine bildirim gitmemesi için bütün bildirmeleri kapat
        const messageObject = {
            content: writeMessage,
            allowedMentions: {
                repliedUser: false,
                users: [],
                roles: []
            }
        }

        // Eğer bir mesajı alıntılayarak yazmamışsa kanala mesaj at
        if (!messageReferenceId) return channel.send(messageObject);

        const messageReference = channel.messages.cache.get(messageReferenceId) || await channel.messages.fetch(messageReferenceId).catch(() => { });

        // Eğer mesajı bulamadıysa kanala mesaj at
        return messageReference ?
            messageReference.reply(messageObject) :
            channel.send(messageObject);

    },
};