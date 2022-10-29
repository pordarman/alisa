const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "bilgi",
    data: new SlashCommandBuilder()
        .setName("bilgi")
        .setDescription("Bir üyenin hesap bilgilerini gösterir")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            const üye = int.options.getMember("üye", false) || int.member
            await üye.fetch(true)
            let sunucuad = üye.nickname || "Sunucudaki adı yok"
                , tümroller = üye.roles.cache.filter(a => a.id !== sunucuid)
                , kişininbanneri = üye.user.bannerURL()
                , kişininfotografı = üye.displayAvatarURL()
                , botmu = üye.user.bot ? `🤖 **Üye bot mu:**  Bot` : `👤 **Üye bot mu:**  Bot değil`
                , aa = tümroller.map(a => `<@&${a.id}>`).slice(0, 25).join(" | ") + (tümroller.size > 25 ? ` +${tümroller.size - 25} daha...` : "")
                , sunucubilgileri = [
                    `📆 **Sunucuya katılma tarihi:**  <t:${(üye.joinedTimestamp / 1000).toFixed(0)}:F> - <t:${(üye.joinedTimestamp / 1000).toFixed(0)}:R>`
                ]
            if (üye.premiumSinceTimestamp) sunucubilgileri.push(`${ayarlar.emoji.boost1} **Sunucuya boost bastığı tarih:**  <t:${(üye.premiumSinceTimestamp / 1000).toFixed(0)}:F> - <t:${(üye.premiumSinceTimestamp / 1000).toFixed(0)}:R>`)
            sunucubilgileri = [...sunucubilgileri, `💎 **Sunucudaki en yüksek rolü:**  <@&${üye.roles.highest.id}>`, `✏️ **Sunucudaki adı:**  ${sunucuad}`]
            if (üye.voice.channelId) sunucubilgileri.push(`🔊 **Şu anda bulunduğu kanal:**  <#${üye.voice.channelId}>`)
            const embed = new EmbedBuilder()
                .setAuthor({ name: üye.user.tag, iconURL: kişininfotografı })
                .setThumbnail(kişininfotografı)
                .setImage(kişininbanneri)
                .setColor(üye.displayHexColor ?? "#9e02e2")
                .addFields(
                    {
                        name: 'TEMEL BİLGİLERİ', value: [
                            `🆔 **Üyenin ID'si:**  ${üye.user.id}`,
                            botmu,
                            `📅 **Hesabı oluşturma tarihi:**  <t:${(üye.user.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(üye.user.createdTimestamp / 1000).toFixed(0)}:R>`
                        ].join("\n")
                    },
                    {
                        name: 'SUNUCU BİLGİLERİ',
                        value: sunucubilgileri.join("\n")
                    },
                    {
                        name: `${ayarlar.emoji.rol} ROLLERİ (${tümroller.size})`,
                        value: (aa || "• Burada gösterilecek hiçbir şey yok...")
                    }
                )
                .setTimestamp()
            int.reply({ embeds: [embed] }).catch(() => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}