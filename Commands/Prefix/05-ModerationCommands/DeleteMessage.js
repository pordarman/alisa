"use strict";
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const {
    MessageFlags
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "sil",
        en: "deletemessage"
    },
    id: "sil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sil",
            "delete",
            "mesajlarısil",
            "deletemessage"
        ],
        en: [
            "deletemessage",
            "messagedelete",
            "message-delete",
            "messagedel",
            "delete",
            "del",
            "clear",
            "messageclear",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kanaldaki mesajları siler",
        en: "Deletes messages in the channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Moderasyon komutları",
        en: "Moderation commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sil <Silinecek mesaj sayısı>",
        en: "<px>deletemessage <Number of messages to delete>"
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
        guildMePermissions,
        msgMember,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                sil: messages
            },
            permissions: permissionMessages
        } = allMessages[language];

        // Eğer kişide "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed(permissionMessages.manageMessages, "memberPermissionError");

        // Eğer botta "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("ManageMessages")) return errorEmbed(permissionMessages.manageMessages, "botPermissionError");

        let deleteCount = Number(args[0]);

        // Eğer girdiği sayı geçerli bir sayı değilse hata döndür
        if (isNaN(deleteCount)) return errorEmbed(
            messages.enter(prefix)
        );

        if (deleteCount == 0) return errorEmbed(messages.zeroError);

        // Eğer girdiği sayı 1000'den fazlaysa hata döndür
        if (deleteCount > Util.MAX.messageDeleteCount) return errorEmbed(messages.maxError(Util.MAX.messageDeleteCount));

        let replyOrSend;

        if (Util.isMessage(msg)) {
            // Eğer mesaj bir Message objesi ise silinecek mesajların sayısını 1 arttır
            deleteCount++;
            replyOrSend = msg.reply.bind(msg);
        } else {
            // Eğer mesaj bir Interaction objesi ise kullanıcıya geri dönüş yap
            msg.reply({
                content: messages.deleting,
                flags: MessageFlags.Ephemeral
            });
            replyOrSend = msg.channel.send.bind(msg.channel);
        }

        let totalDeletedMessagesCount = 0;

        // Discord en fazla 100 tane mesaj silmemize izin verdiği için fonksiyon oluşturuyoruz ve bunu sürekli çalıştırıyoruz
        return (async function deleteMessages(count) {

            // Eğer girilen değer 0 ise döngüyü bitir
            if (count == 0) return Util.waitAndDeleteMessage(
                replyOrSend(
                    messages.successDelete({
                        authorId,
                        deleteCount: totalDeletedMessagesCount - 1
                    })
                ),
                8 * 1000 // Mesajı 8 saniye sonra göster
            );

            // Mesajları silmeye başla
            msg.channel.bulkDelete(count, true).then(async discordMessages => {
                const deletedMessagesCount = discordMessages.size;

                deleteCount -= deletedMessagesCount;
                totalDeletedMessagesCount += deletedMessagesCount;

                // Eğer silinecek mesaj sayısına ulaşıldıysa
                if (deleteCount == 0) return Util.waitAndDeleteMessage(
                    replyOrSend(
                        messages.successDelete({
                            authorId,
                            deleteCount: totalDeletedMessagesCount - 1
                        })
                    ),
                    8 * 1000 // Mesajı 8 saniye sonra göster
                );

                // Eğer fonksiyona girilen sayı ile silinen mesaj sayısı farklıysa döngüyü bitir
                if (count != deletedMessagesCount) return Util.waitAndDeleteMessage(
                    replyOrSend(
                        messages.successButError({
                            authorId,
                            deleteCount: totalDeletedMessagesCount - 1
                        })
                    ),
                    8 * 1000 // Mesajı 8 saniye sonra göster
                );

                // Döngüyü devam ettir
                return await deleteMessages(Math.min(deleteCount, Util.MAX.discordDeleteCount));
            })
                // Eğer bir hata oluşursa
                .catch(() => {
                    return Util.waitAndDeleteMessage(
                        replyOrSend(
                            messages.successButError({
                                authorId,
                                deleteCount: totalDeletedMessagesCount - 1
                            })
                        ),
                        8 * 1000 // Mesajı 8 saniye sonra göster
                    );
                })

        })(Math.min(deleteCount, Util.MAX.discordDeleteCount));
    },
};