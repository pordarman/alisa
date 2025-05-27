"use strict";
const allMessages = require("../../../Helpers/Localizations/Index.js");
const Util = require("../../../Helpers/Util.js");
const {
    MessageFlags
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yazdır",
        en: "write"
    },
    id: "yazdır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yaz",
            "yazdır",
            "write"
        ],
        en: [
            "write"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bota istediğiniz yazıyı yazdırırsınız",
        en: "You can print any text you want to the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Eğlence komutları",
        en: "Fun commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yazdır <Mesajınız>",
        en: "<px>write <Your message>"
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
        language,
        errorEmbed,
        prefix,
    }) {

        const {
            commands: {
                yazdır: messages
            }
        } = allMessages[language];

        const writeMessage = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);
        if (!writeMessage) return errorEmbed(
            messages.enter,
            "warn",
            30 * 1000, // Mesajı 30 saniye boyunca göster
            {
                image: "https://i.hizliresim.com/j44bees.png"
            }
        );

        if (Util.isMessage(msg)) {
            // Eğer mesaj bir Message objesi ise
            msg.delete();
        } else {
            // Eğer mesaj bir Interaction objesi ise
            msg.reply({
                content: messages.success,
                flags: MessageFlags.Ephemeral
            });
        }

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