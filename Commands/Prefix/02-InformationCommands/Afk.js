"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS: {
        yes
    }
} = require("../../../settings.json");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const Util = require("../../../Helpers/Util.js");
const {
    MessageFlags
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "afk",
        en: "afk"
    },
    id: "afk", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "afk"
        ],
        en: [
            "afk"
        ]
    },
    description: { // Komutun açıklaması
        tr: "AFK moduna girersiniz",
        en: "Enters AFK mode"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>afk [Sebep]",
        en: "<px>afk [Reason]"
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
        guildDatabase,
        guildId,
        guildMe,
        guildMePermissions,
        guild,
        msgMember,
        authorId,
        language,
        prefix,
    }) {

        const reason = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);

        // Database'ye kaydet
        const afkObject = {
            timestamp: Date.now(),
            reason
        };
        guildDatabase.afk[authorId] = afkObject;
        await database.updateGuild(guildId, {
            $set: {
                [`afk.${authorId}`]: afkObject
            }
        });

        // Eğer kullanıcının ismini değiştirebiliyorsa isminin başına "[AFK]" yazdır
        if (
            msgMember.displayName.length <= 26 && // Discord en fazla 32 karakterli isimlere izin verdiği için isim uzunluğu en fazla 26 olmalı ki ismini değiştirebilelim
            !msgMember.nickname?.startsWith("[AFK]") &&
            guildMePermissions.has("ChangeNickname") &&
            authorId != guild.ownerId &&
            msgMember.roles.highest.position < guildMe.roles.highest.position
        ) msgMember.setNickname(`[AFK] ${msgMember.displayName}`).catch(() => { });

        return Util.isMessage(msg) ?
            // Eğer mesaj bir Message objesi ise
            msg.react(yes) :
            // Eğer mesaj bir Interaction objesi ise
            msg.reply({
                content: allMessages[language].commands.afk.success,
                flags: MessageFlags.Ephemeral
            });
    },
};