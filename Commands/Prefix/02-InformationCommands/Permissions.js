"use strict";
const {
    EMOJIS: {
        yes: yesEmoji,
        no: noEmoji
    }
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yetkiler",
        en: "permission"
    },
    id: "yetkiler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yetkilerim",
            "yetkiler",
            "permissions",
            "permission"
        ],
        en: [
            "permissions",
            "permission"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Etiketlediğiniz kişinin veya rolün izinlerini gösterir",
        en: "Shows the permissions of the person or role you tagged"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yetkiler [@kişi veya Kişi ID'si]",
        en: "<px>permission [@user or User ID]"
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
        guild,
        msgMember,
        args,
        language,
    }) {

        const {
            commands: {
                yetkiler: messages
            }
        } = allMessages[language];

        // Rolü etiketlemişse önce rolü kontrol et
        let isMemberOrRole;
        let memberOrRole = msg.mentions.roles.first() || Util.fetchRole(msg);

        if (memberOrRole) {
            isMemberOrRole = "role";
        }
        // Eğer rolü etiketlememişse kişiyi kontrol et
        else {
            memberOrRole = msg.mentions.members.first() || await Util.fetchMember(msg.guild, args[0]) || msgMember;
            isMemberOrRole = "member";
        }

        const embed = new EmbedBuilder()
            .setAuthor(
                isMemberOrRole == "member" ?
                    {
                        name: memberOrRole.user.displayName,
                        iconURL: memberOrRole.displayAvatarURL()
                    } :
                    {
                        name: memberOrRole.name,
                        iconURL: memberOrRole.iconURL() || guild.iconURL()
                    }
            )
            .setTimestamp()
            .setColor(memberOrRole.displayHexColor ?? "#9e02e2")

        // Eğer kullanıcı bütün yetkilere sahipse
        if (memberOrRole.permissions.has("Administrator")) {
            embed
                .setDescription(messages[isMemberOrRole == "member" ? "hasAllPermissions" : "hasAllPermissionsRole"](memberOrRole.id));
            return msg.reply({
                embeds: [
                    embed
                ]
            });
        }

        const allPermissions = messages.permissionsData;

        const memberPermissions = memberOrRole.permissions;
        // Eğer kişide o yetki varsa "yes" emojisini yoksa "no" emojisini döndürür
        function checkPermission(permission) {
            return `${memberPermissions.has(permission) ? yesEmoji : noEmoji} ${allPermissions[permission]}`;
        }

        embed.addFields(
            {
                name: messages.titles.guildPermissions,
                value: `**${checkPermission("CreateInstantInvite")}\n\n` +
                    `${checkPermission("ManageGuild")}\n\n` +
                    `${checkPermission("ManageRoles")}\n\n` +
                    `${checkPermission("ManageChannels")}\n\n` +
                    `${checkPermission("ManageEmojisAndStickers")}\n\n` +
                    `${checkPermission("ManageEvents")}\n\n` +
                    `${checkPermission("ManageNicknames")}\n\n` +
                    `${checkPermission("ManageWebhooks")}\n\n` +
                    `${checkPermission("ViewAuditLog")}\n\n` +
                    `${checkPermission("ViewGuildInsights")}**`,
                inline: true
            },
            {
                name: messages.titles.channelPermissions,
                value: `**${checkPermission("AttachFiles")}\n\n` +
                    `${checkPermission("EmbedLinks")}\n\n` +
                    `${checkPermission("ReadMessageHistory")}\n\n` +
                    `${checkPermission("MentionEveryone")}\n\n` +
                    `${checkPermission("SendTTSMessages")}\n\n` +
                    `${checkPermission("ManageMessages")}\n\n` +
                    `${checkPermission("CreatePublicThreads")}\n\n` +
                    `${checkPermission("ManageThreads")}**`,
                inline: true
            },
            {
                name: messages.titles.memberPermissions,
                value: `**${checkPermission("ChangeNickname")}\n\n` +
                    `${checkPermission("MoveMembers")}\n\n` +
                    `${checkPermission("MuteMembers")}\n\n` +
                    `${checkPermission("DeafenMembers")}\n\n` +
                    `${checkPermission("ModerateMembers")}\n\n` +
                    `${checkPermission("KickMembers")}\n\n` +
                    `${checkPermission("BanMembers")}**`,
                inline: true
            }
        )
        return msg.reply({
            embeds: [
                embed
            ]
        });

    },
};