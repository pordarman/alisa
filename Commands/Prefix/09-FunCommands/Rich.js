"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const {
    RESTJSONErrorCodes,
    MessageFlags,
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "zengin",
        en: "booster"
    },
    id: "zengin", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "zengin",
            "booster"
        ],
        en: [
            "booster"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Eğer sunucuya boost bastıysanız isminizi değiştirmenizi sağlar",
        en: "Allows you to change your name if you have boosted the server"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Eğlence komutları",
        en: "Fun commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>zengin <Yeni isim>",
        en: "<px>booster <New Name>"
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
        authorId,
        guildMe,
        guildMePermissions,
        guild,
        args,
        msgMember,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                zengin: messages
            },
            permissions: permissionMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        // Eğer botta "Kullanıcı Adlarını Yönet" yetkisi yoksa hata döndür
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed(permissionMessages.manageNicknames, "botPermissionError");

        // Eğer kişide "Kullanıcı Adlarını Yönet" yetkisi yoksa veya sunucuya boost basmamışsa hata döndür
        if (!msgMember.premiumSinceTimestamp && !msgMember.permissions.has("ChangeNickname")) return errorEmbed(permissionMessages.rich, "memberPermissionError");

        // Eğer komutu sunucu sahibi kullandıysa hata döndür
        if (msgMember.id === guild.ownerId) return errorEmbed(messages.owner);

        // Eğer kullanıcının rolü botun rolünün üstündeyse hata döndür
        if (msgMember.roles.highest.position >= guildMe.roles.highest.position) return errorEmbed(messages.higherRole);

        const newName = args.join(" ")
        if (!newName) return errorEmbed(messages.enter);

        // Eğer isminin uzunluğu 32 karakteri geçiyorsa hata döndür
        if (newName.length > 32) return errorEmbed(messages.longName);

        // İsmini düzenle
        msgMember.setNickname(newName)
            // Eğer düzenlendiyse mesaja tepki ekle
            .then(() => {
                Util.isMessage(msg) ?
                    // Eğer mesaj bir Message objesi ise
                    msg.react(EMOJIS.yes) :
                    // Eğer mesaj bir Interaction objesi ise
                    msg.reply({
                        content: messages.success(newName),
                        flags: MessageFlags.Ephemeral
                    });
            })
            // Eğer hata oluştuysa
            .catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeName({
                        memberId: authorId,
                        highestRoleId: Util.getBotOrHighestRole(guildMe).id
                    }),
                    allowedMentions: {
                        users: [],
                        roles: []
                    },
                    flags: MessageFlags.Ephemeral
                });

                console.error(err);
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                });
            })

    },
};