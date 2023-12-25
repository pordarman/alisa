"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "sil", // Komutun ismi
    id: "sil", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sil",
        "delete",
        "mesajlarısil",
        "deletemessage"
    ],
    description: "Kanaldaki mesajları siler", // Komutun açıklaması
    category: "Moderasyon komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sil <Silinecek mesaj sayısı>", // Komutun kullanım şekli
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

        // Eğer kişide "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed("Mesajları Yönet", "memberPermissionError");

        // Eğer botta "Mesajları Yönet" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("ManageMessages")) return errorEmbed("Mesajları Yönet", "botPermissionError");

        let deleteCount = Number(args[0]);

        // Eğer girdiği sayı geçerli bir sayı değilse hata döndür
        if (isNaN(deleteCount)) return errorEmbed(
            `Lütfen geçerli bir __sayı__ giriniz\n\n` +
            `**Örnek**\n` +
            `• ${prefix}sil 15\n` +
            `• ${prefix}sil 500`
        );


        if (deleteCount == 0) return errorEmbed(`0 tane mesajı nasıl siliyim akıllım :)`);

        // Eğer girdiği sayı 1000'den fazlaysa hata döndür
        if (deleteCount > Util.MAX.messageDeleteCount) return errorEmbed(`Girdiğiniz sayı değeri __${Util.MAX.messageDeleteCount}__ sayısından küçük olmalıdır!`);

        // Kullanıcının attığı mesajı da sileceği için değeri 1 arttırıyoruz
        deleteCount += 1;

        let deletedMessagesCount = 0;

        // Discord en fazla 100 tane mesaj silmemize izin verdiği için fonksiyon oluşturuyoruz ve bunu sürekli çalıştırıyoruz
        return (async function deleteMessages(count) {

            // Eğer girilen değer 0 ise döngüyü bitir
            if (count == 0) return Util.waitAndDeleteMessage(
                await msg.reply(
                    `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ adet mesaj başarıyla silindi!`
                ),
                8 * 1000 // Mesajı 8 saniye boyunca göster
            );

            // Mesajları silmeye başla
            await msg.channel.bulkDelete(count, true).then(async messages => {
                const deletedMessagesCount = messages.size;

                deleteCount -= deletedMessagesCount;

                // Eğer silinecek mesaj sayısına ulaşıldıysa
                if (deleteCount == 0) return Util.waitAndDeleteMessage(
                    await msg.reply(
                        `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ adet mesaj başarıyla silindi!`
                    ),
                    8 * 1000 // Mesajı 8 saniye boyunca göster
                );

                // Eğer fonksiyona girilen sayı ile silinen mesaj sayısı farklıysa döngüyü bitir
                if (count != deletedMessagesCount) return Util.waitAndDeleteMessage(
                    await msg.reply(
                        `• <@${authorId}>, __**${deletedMessagesCount - 1}**__ adet mesaj başarıyla silindi fakat daha önceki mesajları silmeye iznim yok :(`
                    ),
                    8 * 1000 // Mesajı 8 saniye boyunca göster
                );

                // Döngüyü devam ettir
                return await deleteMessages(Math.min(deleteCount, Util.MAX.discordDeleteCount));
            })

        })(Math.min(deleteCount, Util.MAX.discordDeleteCount));

    },
};