"use strict";
const Time = require("../../../Helpers/Time.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "jailson",
        en: "lastjail"
    },
    id: "jailson", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "jailson",
            "jail-son",
            "jaillast"
        ], en: [
            "lastjail",
            "jaillast"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Sunucunun son Jail'e atılanları gösterir",
        en: "Shows the server's last jail time"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Jail komutları",
        en: "Jail commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>jailson [@kişi veya Kişi ID'si]",
        en: "<px>lastjail [@user or User ID]"
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
        guild,
        msgMember,
        args,
        language,
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.jail.authRoleId;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının "Yönetici" yetkisinin olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]);

        let lastJails = guildDatabase.jail.last;

        // Eğer bir kişiyi etiketlemişse son kayıtları sadece onun yaptığı kayıtları göster
        if (user) {
            lastJails = lastJails.filter(({ memberId: userId }) => userId == user.id);
        }

        const length = lastJails.length;

        const {
            commands: {
                jailson: messages
            }
        } = allMessages[language];

        // Eğer kullanıcı daha önceden hiç kayıt etmemişse hata döndür
        if (!length) return errorEmbed(
            user ?
                messages.cantShow.user :
                messages.cantShow.guild
        );

        const LENGTH_TO_HUMANIZE = Util.toHumanize(length, language);

        let authorName;
        let image;
        // Eğer kişiyi etiketlemişse
        if (user) {
            authorName = user.displayName;
            image = user.displayAvatarURL();
        } else {
            authorName = guild.name;
            image = guild.iconURL();
        }

        return createMessageArrows({
            msg,
            array: lastJails,
            async arrayValuesFunc({
                result: {
                    authorId,
                    isJailed,
                    isTempJailed,
                    duration,
                    timestamp,
                    reason
                },
                length,
                index
            }) {
                return messages.embed.description({
                    length,
                    index,
                    isTempJailed,
                    isJailed,
                    authorId,
                    user,
                    timestamp: Util.msToSecond(timestamp),
                    reason,
                    duration: Time.duration(duration, language)
                })
            },
            embed: {
                author: {
                    name: authorName,
                    iconURL: image
                },
                description: messages.embed.title({
                    text: user ? messages.total.user(user.id) : messages.total.guild,
                    length: LENGTH_TO_HUMANIZE
                })
            },
            forwardAndBackwardCount: 20,
            pageJoin: "\n\n",
            language
        });
    },
};