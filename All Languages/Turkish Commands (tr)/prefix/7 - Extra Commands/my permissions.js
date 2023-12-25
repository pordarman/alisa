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
    name: "yetkiler", // Komutun ismi
    id: "yetkiler", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yetkilerim",
        "yetkiler",
        "permissions",
        "permission"
    ],
    description: "Etiketlediğiniz kişinin izinlerini gösterir", // Komutun açıklaması
    category: "Ekstra komutlar", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yetkiler [@kişi veya Kişi ID'si]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        msgMember,
        args,
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
                .setDescription(`• <@${member.id}> adlı kişi bütün yetkilere sahip!`);
            return msg.reply({
                embeds: [
                    embed
                ]
            });
        }

        const allPermissions = {
            CreateInstantInvite: "Davet oluşturma",
            KickMembers: "Üyeleri atma",
            BanMembers: "Üyeleri banlama",
            ManageChannels: "Kanalları yönetme",
            ManageGuild: "Sunucuyu yönetme",
            ViewAuditLog: "Denetim kaydını görüntüleme",
            SendTTSMessages: "Sesli mesaj gönderme",
            ManageMessages: "Mesajları yönetme",
            EmbedLinks: "Gömülü bağlantı gönderme",
            AttachFiles: "Dosya gönderme",
            ReadMessageHistory: "Mesaj geçmişini görüntüleme",
            MentionEveryone: "@everyone ve @here atabilme",
            ViewGuildInsights: "Sunucunun istatistiklerini görüntüleme",
            MuteMembers: "Üyeleri susturma",
            DeafenMembers: "Üyeleri sağırlaştırma",
            MoveMembers: "Üyeleri taşıma",
            ChangeNickname: "Kullanıcı adını değiştirme",
            ManageNicknames: "Kullanıcı adlarını yönetme",
            ManageRoles: "Rolleri yönetme",
            ManageWebhooks: "Webhookları yönetme",
            ManageEmojisAndStickers: "Emoji ve sticklerleri yönetme",
            ManageEvents: "Etkinlikleri yönetme",
            ManageThreads: "Başlıkları yönetme",
            CreatePublicThreads: "Herkese açık başlık oluşturma",
            ModerateMembers: "Üyelere zaman aşımı uygulama",
        }

        const memberPermissions = member.permissions;

        // Eğer kişide o yetki varsa "yes" emojisini yoksa "no" emojisini döndürür
        function checkPermission(permission) {
            return `${memberPermissions.has(permission) ? yesEmoji : noEmoji} ${allPermissions[permission]}`;
        }

        embed.addFields(
            {
                name: "SUNUCU İZİNLERİ",
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
                name: "KANAL İZİNLERİ",
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
                name: "KİŞİ İZİNLERİ",
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