"use strict";
const allMessages = require("../../../Helpers/Localizations/Index.js");
const {
    MessageFlags
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kilit",
        en: "lock"
    },
    id: "kilit", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kilit",
            "kanalkilit",
            "kilitle",
            "kanalkilitle",
            "lockchannel",
            "lock",
            "lockc",
            "lockch",
        ],
        en: [
            "lock",
            "lockchannel",
            "lockc",
            "lockch",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Kanalı kilitler",
        en: "Locks the channel"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kilit",
        en: "<px>lock"
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
        guildId,
        guildMePermissions,
        guild,
        msgMember,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                kilit: messages
            },
            permissions: permissionMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        // Eğer kişide "Kanalı Yönet" yetkisi yoksa
        if (!msgMember.permissions.has("ManageChannels")) return errorEmbed(permissionMessages.manageChannels, "memberPermissionError");

        // Eğer botun "Kanalı Yönet" yetkisi yoksa
        if (!guildMePermissions.has("ManageChannels")) return errorEmbed(permissionMessages.manageChannels, "botPermissionError");

        // Eğer kanal zaten kilitliyse
        if (!msg.channel.permissionsFor(guild.roles.everyone).has("SendMessages")) return errorEmbed(messages.already);

        msg.channel.permissionOverwrites.edit(guildId, {
            SendMessages: false
        })
            .then(() => {
                return msg.channel.send(messages.success(msg.channelId));
            })
            .catch(err => {
                return msg.reply({
                    content: unknownErrorMessages.unknownError(err),
                    flags: MessageFlags.Ephemeral
                })
            });

    },
};