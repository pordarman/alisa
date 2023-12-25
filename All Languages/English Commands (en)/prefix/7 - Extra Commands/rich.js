"use strict";
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "booster", // Komutun ismi
    id: "zengin", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "booster"
    ],
    description: "Allows you to change your name if you have boosted the server", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>booster <New Name>", // Komutun kullanım şekli
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

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMe.permissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        // Eğer kişide "Kullanıcı Adlarını Yönet" yetkisi yoksa veya sunucuya boost basmamışsa hata döndür
        if (!msgMember.premiumSinceTimestamp && !msgMember.permissions.has("ChangeNickname")) return errorEmbed("**either** you should boost the server **or** Change Username", "memberPermissionError");

        // Eğer komutu sunucu sahibi kullandıysa hata döndür
        if (msgMember.id === guild.ownerId) return errorEmbed(`I can't change the name of the server owner :(`);

        // Eğer kullanıcının rolü botun rolünün üstündeyse hata döndür
        if (msgMember.roles.highest.position >= guildMe.roles.highest.position) return errorEmbed(`I can't change your name because your role's rank is higher than my role's rank`);

        const newName = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();
        if (!newName) return errorEmbed(`Please write your new name`);

        // Eğer isminin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (newName.length > 32) return errorEmbed(`Server name cannot exceed 32 characters! Please reduce the number of characters nad try again`);

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
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            })

    },
};