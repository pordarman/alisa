const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  name: "yetkilerim",
  data: new SlashCommandBuilder()
    .setName("yetkilerim")
    .setDescription("Bir üyenin sunucudaki bütün yetkilerini gösterir")
    .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(false)),
  /**
   * 
   * @param {ChatInputCommandInteraction} int  
   * @param {Function} hata
   */
  async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
    try {
        const member = int.options.getMember("üye", false) || int.member
        const p = ayarlar.emoji.p
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL() })
            .setTimestamp()
            .setColor(member.displayHexColor ?? "#9e02e2")
        if (member.permissions.has("Administrator")) return int.reply({ embeds: [embed.setDescription(`**• <@${member.id}> adlı kişi yönetici yetkisine sahip olduğu için bütün yetkilere sahip!**`).addFields({ name: 'SUNUCU İZİNLERİ', value: `**${p} Davet oluşturma\n\n${p} Sunucuyu yönetme\n\n${p} Rolleri yönetme\n\n${p} Kanalları yönetme\n\n${p} Emoji ve sticklerleri yönetme\n\n${p} Etkinlikleri yönetme\n\n${p} Webhookları yönetme\n\n${p} Denetim kaydını görüntüleme\n\n${p} Sunucunun istatistiklerini görüntüleme**`, inline: true }, { name: 'KANAL İZİNLERİ', value: `**${p} Dosya gönderme\n\n${p} Gömülü bağlantı gönderme\n\n${p} Mesaj geçmişini görüntüleme\n\n${p} @everyone ve @here atabilme\n\n${p} Sesli mesaj gönderme\n\n${p} Mesajları yönetme\n\n${p} Herkese açık başlık oluşturma\n\n${p} Başlıkları yönetme**`, inline: true }, { name: 'KİŞİ İZİNLERİ', value: `**${p} Kullanıcı adını değiştirme\n\n${p} Kullanıcı adlarını yönetme\n\n${p} Üyeleri taşıma\n\n${p} Üyeleri susturma\n\n${p} Üyeleri sağırlaştırma\n\n${p} Üyelere zaman aşımı uygulama\n\n${p} Üyeleri atma\n\n${p} Üyeleri banlama**`, inline: true })] }).catch(err => { })
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
        const hasFunction = (permission) => (member.permissions.has(permission) ? `${p} ` : `${ayarlar.emoji.np} `) + allPermissions[permission]
        int.reply({ embeds: [embed.addFields({ name: 'SUNUCU İZİNLERİ', value: `**${hasFunction("CreateInstantInvite")}\n\n${hasFunction("ManageGuild")}\n\n${hasFunction("ManageRoles")}\n\n${hasFunction("ManageChannels")}\n\n${hasFunction("ManageEmojisAndStickers")}\n\n${hasFunction("ManageEvents")}\n\n${hasFunction("ManageNicknames")}\n\n${hasFunction("ManageWebhooks")}\n\n${hasFunction("ViewAuditLog")}\n\n${hasFunction("ViewGuildInsights")}**`, inline: true }, { name: 'KANAL İZİNLERİ', value: `**${hasFunction("AttachFiles")}\n\n${hasFunction("EmbedLinks")}\n\n${hasFunction("ReadMessageHistory")}\n\n${hasFunction("MentionEveryone")}\n\n${hasFunction("SendTTSMessages")}\n\n${hasFunction("ManageMessages")}\n\n${hasFunction("CreatePublicThreads")}\n\n${hasFunction("ManageThreads")}**`, inline: true }, { name: 'KİŞİ İZİNLERİ', value: `**${hasFunction("ChangeNickname")}\n\n${hasFunction("MoveMembers")}\n\n${hasFunction("MuteMembers")}\n\n${hasFunction("DeafenMembers")}\n\n${hasFunction("ModerateMembers")}\n\n${hasFunction("KickMembers")}\n\n${hasFunction("BanMembers")}**`, inline: true })] }).catch(err => { })
    } catch (e) {
      hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
      int.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}