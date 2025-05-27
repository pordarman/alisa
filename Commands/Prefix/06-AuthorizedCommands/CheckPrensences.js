"use strict";
const {
    ActivityType
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "kontrol",
        en: "check"
    },
    id: "kontrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kontrol",
            "durumkontrol",
            "durumlarıkontrol",
            "kontrolet",
            "check",
        ],
        en: [
            "check",
            "checkstatus",
            "checkstatuses",
            "checkpresence",
            "checkpresences",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Kişilerin durumlarını kontrol eder ve belirli durumda olanları listeler",
        en: "Checks the statuses of people and lists those in certain status"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kontrol <Aranacak durum>",
        en: "<px>check <Status to search>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guild,
        msgMember,
        args,
        authorId,
        prefix,
        language,
        errorEmbed,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed(allMessages[language].permissions.administrator, "memberPermissionError");

        const searchStatus = args.join(" ").toLocaleLowerCase(language);
        if (!searchStatus) return errorEmbed(
            `• Lütfen aranacak durumu belirtin\n\n` +
            `• **Örnek:**\n` +
            `• ${prefix}kontrol [oyun/izliyor/dinliyor/reklam/link]\n` +
            `• ${prefix}kontrol Aranacak durum`,
        );

        const [message, members] = await Promise.all([
            msg.reply("• Kişilerin durumları kontrol ediliyor..."),
            Util.getMembers(guild)
        ]);

        const membersWithStatus = [];

        for (const member of members.values()) {
            if (member.presence) {
                for (let i = 0; i < member.presence.activities.length; i++) {
                    const text = member.presence.activities[i].type === ActivityType.Custom ? member.presence.activities[i].state : member.presence.activities[i].name;

                    const matchesText = Util.highlightSearchText(text || "", searchStatus);
                    if (matchesText) {
                        membersWithStatus.push([member, matchesText]);
                        break;
                    }
                }

            }
        }

        const guildIcon = guild.iconURL();

        return createMessageArrows({
            msg: message,
            array: membersWithStatus,
            async arrayValuesFunc({
                result: [member, presence],
                length,
                index
            }) {
                return `• \`#${length - index}\` **${member.user.tag} - (${member.id})** - ${presence}`;
            },
            authorId,
            embed: {
                author: {
                    name: guild.name,
                    iconURL: guildIcon
                },
                description: `• Aranan durum: **${searchStatus}**\n` +
                    `• Bulunan kişi sayısı: **${membersWithStatus.length}**`,
                thumbnail: guildIcon,
            },
            VALUES_PER_PAGE: 20,
            language,
            arrowTimeout: 1000 * 60 * 10 // 10 dakika
        });
    },
};