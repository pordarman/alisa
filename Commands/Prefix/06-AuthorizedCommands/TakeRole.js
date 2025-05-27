"use strict";
const {
    EMOJIS: {
        yes
    }
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const {
    RESTJSONErrorCodes,
    MessageFlags
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "rolal",
        en: "takerole"
    },
    id: "rolal", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "rolal",
            "rol-al",
            "takerole",
            "rolüal",
            "rolü-al",
        ],
        en: [
            "takerole",
            "take-role"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Belirtilen kişiden belirtilen rolü alır",
        en: "Takes the specified role from the specified person"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>rolal <@kişi veya Kişi ID'si> <@roller veya Rollerin ID'si>",
        en: "<px>takerole <@user or User ID> <@roles or Role IDs>"
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
        alisa,
        msg,
        guildDatabase,
        guildId,
        guildMe,
        guildMePermissions,
        guild,
        msgMember,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
        isOwner,
        premium
    }) {

        const {
            commands: {
                rolal: messages
            },
            permissions: permissionMessages,
            roles: roleMessages,
            missingDatas: missingDatasMessages,
            members: memberMessages,
            unknownErrors: unknownErrorMessages
        } = allMessages[language];

        // Yetkileri kontrol et
        if (!msgMember.permissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "memberPermissionError");
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed(permissionMessages.manageRoles, "botPermissionError");

        const content = args.join(" ");
        const member = msg.mentions.members.first() || await Util.fetchMember(msg.guild, content);

        if (!member) return errorEmbed(
            member === null ?
                missingDatasMessages.wrongId :
                missingDatasMessages.tag
        );

        const memberId = member.id;

        // Eğer kendinden rol alınmaya çalışıyorsa hata döndür
        if (memberId == authorId) return errorEmbed(memberMessages.cantUseOn.yourself);

        const roles = Util.fetchRoles(msg);

        // Eğer rol belirtilmemişse hata döndür
        if (roles.size == 0) return errorEmbed(messages.noRole);

        // Kişide olmayan rolleri filtrele
        const memberRoles = new Set(member["_roles"]);
        const newRoles = [];
        roles.forEach(role => {
            if (memberRoles.has(role.id)) newRoles.push(role);
        });

        // Eğer kişiden alınacak rol yoksa hata döndür
        if (newRoles.length == 0) return errorEmbed(messages.noRoleToTake);

        // Eğer rollerin arasında booster rolü varsa hata döndür
        if (newRoles.some(role => role.tags?.premiumSubscriberRole)) return errorEmbed(roleMessages.boosterRole);

        // Eğer rollerin içinde bot rolü varsa hata döndür
        if (newRoles.some(role => role.managed)) return errorEmbed(roleMessages.botRole);

        // Eğer rollerinin pozisyonu komutu kullanan kişinin rollerinden yüksekse hata döndür
        const highestRole = msgMember.roles.highest;
        if (newRoles.some(role => role.position >= highestRole.position)) return errorEmbed(memberMessages.memberIsHigherThanYou(memberId));

        // Eğer rolllerinin pozisyonu botun rollerinden yüksekse hata döndür
        const rolesAboveFromMe = newRoles.filter(role => role.position >= guildMe.roles.highest.position);
        if (rolesAboveFromMe.length != 0) return errorEmbed(roleMessages.rolesAreHigherThanMe({
            roleIds: Util.mapAndJoin(rolesAboveFromMe, role => `<@&${role.id}>`, " | "),
            highestRoleId: Util.getBotOrHighestRole(guildMe).id
        }));

        // Kişinin rollerini güncelle
        member.roles.remove(newRoles)
            // Başarılı mesajını gönder
            .then(() => msg.react(yes).catch(() => { }))
            // Hata döndür
            .catch((err) => {
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: memberMessages.memberIsHigherThanMeRole({
                        memberId,
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
            });

    },
};