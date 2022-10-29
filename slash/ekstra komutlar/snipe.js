const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "snipe",
    data: new SlashCommandBuilder()
        .setName("snipe")
        .setDescription("Kanalda silinen son mesajı gösterir")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(false)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            if (!int.member.permissions.has("ManageMessages")) return hata("Mesajları Yönet", "yetki")
            let snipe = db.bul(int.channelId, "snipe", "diğerleri")
            if (!snipe) return hata('Bu kanalda daha önceden hiç mesaj silinmemiş')
            let kisi = int.options.getUser("üye", false)
                , sahip
            if (kisi) {
                snipe = snipe[kisi.id]
                if (!snipe) return hata("Etiketlediğiniz kişi bu kanalda daha önceden hiç mesaj silmemiş")
                sahip = kisi.id
            } else {
                sahip = snipe.son
                snipe = snipe[snipe.son]
            }
            let içerik = snipe.i || "> *Mesaj bilinmiyor???*"
            if (içerik.length > 1024) içerik = içerik.slice(0, 1020) + " ..."
            const embed = new EmbedBuilder()
                .setDescription(`• **Mesajın sahibi:**  <@${snipe.sa}>\n\nMesajın yazılma zamanı **<t:${(snipe.z / 1000).toFixed(0)}:R>**\nMesajın silinme zamanı **<t:${(snipe.s / 1000).toFixed(0)}:R>**`)
                .addFields(
                    {
                        name: 'Mesajın içeriği',
                        value: içerik
                    }
                )
                .setColor('#980d9e')
                .setTimestamp()
                .setImage(snipe.resim)
            let uye = await int.client.fetchUserForce(snipe.sa)
            if (uye) embed.setAuthor({ name: uye.tag, iconURL: uye.displayAvatarURL() })
            else embed.setAuthor({ name: "Deleted User#0000", iconURL: "https://cdn.discordapp.com/embed/avatars/1.png" })
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}