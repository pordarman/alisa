"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");

module.exports = {
    name: "zengin", // Komutun ismi
    id: "zengin", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "zengin",
        "booster"
    ],
    description: "Eğer sunucuya boost bastıysanız isminizi değiştirmenizi sağlar", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>zengin <Yeni isim>", // Komutun kullanım şekli
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
        guild,
        errorEmbed,
    }) {

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Kullanıcı Adlarını Yönet", "botPermissionError");

        // Eğer kişide "Kullanıcı Adlarını Yönet" yetkisi yoksa veya sunucuya boost basmamışsa hata döndür
        if (!msgMember.premiumSinceTimestamp && !msgMember.permissions.has("ChangeNickname")) return errorEmbed("**ya** sunucuya boost basmalısın **ya da** Kullanıcı Adını Değiştir", "memberPermissionError");

        // Eğer komutu sunucu sahibi kullandıysa hata döndür
        if (msgMember.id === guild.ownerId) return errorEmbed(`Sunucu sahibinin ismini değiştiremem :(`);

        // Eğer kullanıcının rolü botun rolünün üstündeyse hata döndür
        if (msgMember.roles.highest.position >= guildMe.roles.highest.position) return errorEmbed(`Sizin rolünüzün sırası benim rolümün sırasından yüksek olduğu için sizin isminizi değiştiremem`);

        const newName = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!newName) return errorEmbed(`Lütfen yeni isminizi yazınız`);

        // Eğer isminin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (newName.length > 32) return errorEmbed(`Sunucu ismi 32 karakterden fazla olamaz! Lütfen karakter sayısını düşürünüz ve tekrar deneyiniz`);

        // İsmini düzenle
        await msgMember.setNickname(newName)
            // Eğer düzenlendiyse mesaja tepki ekle
            .then(() => {
                msg.react(EMOJIS.yes)
            })
            // Eğer hata oluştuysa
            .catch(err => {
                console.log(err)
                return msg.reply(
                    `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};