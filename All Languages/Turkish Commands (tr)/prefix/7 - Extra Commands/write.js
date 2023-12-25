"use strict";

module.exports = {
    name: "yazdır", // Komutun ismi
    id: "yazdır", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yazdır",
        "write"
    ],
    description: "Bota istediğiniz yazıyı yazdırırsınız", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yazdır <Mesajınız>", // Komutun kullanım şekli
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
        errorEmbed,
    }) {

        const writeMessage = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!writeMessage) return errorEmbed(
            `Lütfen yazmamı istediğiniz mesajı yazınız\n\n` +
            `**• Heyy eğer bir mesajı alıntılamamı istiyorsanız __komutu kullanırken mesajı alıntılaman__ yeterlii. Aşağıya bir tane görsel bıraktım oraya bi göz at bence :3**`,
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