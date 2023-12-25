"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "deletemessage", // Komutun ismi
    id: "sil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "deletemessage",
        "delete",
    ],
    description: "Deletes messages in the channel", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>deletemessage <Number of messages to delete>", // Komutun kullanım şekli
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
        msgMember,
        guildMe,
        authorId,
        args,
        prefix,
        errorEmbed,
    }) {

        // Eğer kişide "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed("ManageMessages", "memberPermissionError");

        // Eğer botta "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageMessages")) return errorEmbed("ManageMessages", "botPermissionError");

        let deleteCount = Number(args[0]);

        // Eğer girdiği sayı geçerli bir sayı değilse hata döndür
        if (isNaN(deleteCount)) return errorEmbed(
            `Please enter a valid __number__\n\n` +
            `**Example**\n` +
            `• ${prefix}${this.name} 15\n` +
            `• ${prefix}${this.name} 500`
        );


        if (deleteCount == 0) return errorEmbed(`How can I delete 0 messages, my dear? :)`);

        // Eğer girdiği sayı 1000'den fazlaysa hata döndür
        if (deleteCount > Util.MAX.messageDeleteCount) return errorEmbed(`The number value you enter must be less than __${Util.MAX.messageDeleteCount}__!`);

        // Kullanıcının attığı mesajı da sileceği için değeri 1 arttırıyoruz
        deleteCount += 1;

        let deletedMessagesCount = 0;

        // Discord en fazla 100 tane mesaj silmemize izin verdiği için fonksiyon oluşturuyoruz ve bunu sürekli çalıştırıyoruz
        return (async function deleteMessages(count) {

            // Eğer girilen değer 0 ise döngüyü bitir
            if (count == 0) return Util.waitAndDeleteMessage(
                await msg.reply(
                    `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ messages deleted successfully!`
                ),
                8 * 1000 // Mesajı 8 saniye sonra göster
            );

            // Mesajları silmeye başla
            await msg.channel.bulkDelete(count, true).then(async messages => {
                const deletedMessagesCount = messages.size;

                deleteCount -= deletedMessagesCount;

                // Eğer silinecek mesaj sayısına ulaşıldıysa
                if (deleteCount == 0) return Util.waitAndDeleteMessage(
                    await msg.reply(
                        `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ messages deleted successfully!`
                    ),
                    8 * 1000 // Mesajı 8 saniye sonra göster
                );

                // Eğer fonksiyona girilen sayı ile silinen mesaj sayısı farklıysa döngüyü bitir
                if (count != deletedMessagesCount) return Util.waitAndDeleteMessage(
                    await msg.reply(
                        `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ messages were deleted successfully, but I do not have permission to delete previous messages :(`
                    ),
                    8 * 1000 // Mesajı 8 saniye sonra göster
                );

                // Döngüyü devam ettir
                return await deleteMessages(Math.min(deleteCount, Util.MAX.discordDeleteCount));
            })

        })(Math.min(deleteCount, Util.MAX.discordDeleteCount));
    },
};