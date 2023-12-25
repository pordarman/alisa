"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS: {
        yes
    }
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "afk", // Komutun ismi
    id: "afk", // Komutun ID'si
    cooldown: 2, // Komutun bekleme süresi
    aliases: [
        "afk"
    ], // Komutun diğer çağırma isimleri
    description: "Enters AFK mode", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>afk [Reason]", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        const reason = msg.content.slice(
            msg.content.search(
                new RegExp(`(?<=${this.aliases.join("|")})`)
            )
        ).trim();

        // Database'ye kaydet
        guildDatabase.afk[authorId] = {
            timestamp: Date.now(),
            reason
        }
        database.writeFile(guildDatabase, guildId);

        // Eğer kullanıcının ismini değiştirebiliyorsa isminin başına "[AFK]" yazdır
        if (
            msgMember.displayName.length <= 26 && // Discord en fazla 32 karakterli isimlere izin verdiği için isim uzunluğu en fazla 26 olmalı ki ismini değiştirebilelim
            !msgMember.nickname.startsWith("[AFK]") &&
            guildMe.permissions.has("ChangeNickname") &&
            authorId != guild.ownerId &&
            msgMember.roles.highest.position < guildMe.roles.highest.position
        ) msgMember.setNickname(`[AFK] ${msgMember.displayName}`).catch(() => { });

        return msg.react(yes)
    },
};