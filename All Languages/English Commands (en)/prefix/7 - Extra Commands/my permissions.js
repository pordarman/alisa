"use strict";
const {
    EMOJIS: {
        yes: yesEmoji,
        no: noEmoji
    }
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "permission", // Komutun ismi
    id: "yetkiler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "permissions",
        "permission"
    ],
    description: "Shows the permissions of the person you tagged", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>permission [@user or User ID]", // Komutun kullanım şekli
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


        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi yetkilerini kontrol et
        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]) || msgMember;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: member.user.displayName,
                iconURL: member.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(member.displayHexColor ?? "#9e02e2")

        // Eğer kullanıcı bütün yetkilere sahipse
        if (member.permissions.has("Administrator")) {
            embed
                .setDescription(`• <@${member.id}> has all permissions!`);
            return msg.reply({
                embeds: [
                    embed
                ]
            });
        }

        const allPermissions = {
            CreateInstantInvite: "Create instant invite",
            KickMembers: "Kick members",
            BanMembers: "Ban members",
            ManageChannels: "Manage channels",
            ManageGuild: "Manage guild",
            ViewAuditLog: "View audit log",
            SendTTSMessages: "Send TTS messages",
            ManageMessages: "Manage messages",
            EmbedLinks: "Embed links",
            AttachFiles: "Attach files",
            ReadMessageHistory: "Read message history",
            MentionEveryone: "@everyone and @here",
            ViewGuildInsights: "View guild insights",
            ManageMessages: "Manage messages",
            MuteMembers: "Mute members",
            DeafenMembers: "Deafen members",
            MoveMembers: "Move members",
            ChangeNickname: "Change nickname",
            ManageNicknames: "Manage nicknames",
            ManageRoles: "Manage roles",
            ManageWebhooks: "Manage webhooks",
            ManageEmojisAndStickers: "Manage emojis and stickers",
            ManageEvents: "Manage events",
            ManageThreads: "Manage threads",
            CreatePublicThreads: "Create public threads",
            ModerateMembers: "Moderate members",
        }

        const memberPermissions = member.permissions;
        // Eğer kişide o yetki varsa "yes" emojisini yoksa "no" emojisini döndürür
        function checkPermission(permission) {
            return `${memberPermissions.has(permission) ? yesEmoji : noEmoji} ${allPermissions[permission]}`;
        }

        embed.addFields(
            {
                name: "GUILD PERMISSIONS",
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
                name: "CHANNEL PERMISSIONS",
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
                name: "MEMBER PERMISSIONS",
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