const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "sunucu bilgi",
    data: new SlashCommandBuilder()
        .setName("sbilgi")
        .setDescription("Sunucunun genel bilgilerini gösterir"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let discordlogo = guild.iconURL()
                , urller = [(discordlogo != "https://i.hizliresim.com/fpvkxry.png" ? discordlogo : null), guild.bannerURL(), guild.splashURL(), guild.discoverySplashURL()]
                , kanallar = guild.channels.cache
                , yazıKanalSayı = kanallar.filter(a => a.type === 0).size
                , sesKanalSayı = kanallar.filter(a => a.type === 2).size
                , kategoriKanalSayı = kanallar.filter(a => a.type === 4).size
                , üyeler = await int.client.getMembers(int)
                , emojiler = guild.emojis.cache, everyoneHariçDigerRoller = guild.roles.cache.filter(a => a.id !== guild.id)
                , temelBilgi = [`🆔 **Sunucunun ID'si:**  ${guild.id}`, `📅 **Sunucunun kuruluş tarihi:**  <t:${(guild.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>`, `🔔 **Sunucunun varsayılan mesaj bildirimleri:**  ${guild.defaultMessageNotifications == "ALL_MESSAGES" ? "Bütün mesajlar 📬" : "Sadece etiketler ${ayarlar.emoji.rol}"}`]
            await guild.fetchVanityData().then(res => temelBilgi.push(`✉️ **Sunucunun özel daveti:**  https://discord.gg/${res.code} - (${res.uses})`)).catch(err => { })
            if (guild.afkChannel) temelBilgi.push(`🔇 **AFK kanalı:**  <#${guild.afkChannelId}> (${Time.duration({ ms: guild.afkTimeout * 1000, skipZeros: true })})`)
            if (guild.rulesChannel) temelBilgi.push(`${ayarlar.emoji.kurallar} **Kurallar kanalı:**  <#${guild.rulesChannelId}>`)
            temelBilgi.push(`👑 **Sunucunun sahibi:**  <@${guild.ownerId}> - (${guild.ownerId})`)
            const embed = new EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: discordlogo })
                .addFields(
                    {
                        name: 'TEMEL BİLGİLER',
                        value: temelBilgi.join("\n")
                    },
                    {
                        name: 'KANALLAR (' + kanallar.size + ')',
                        value: [
                            `${ayarlar.emoji.kanal} **Yazı kanalı:**  ${yazıKanalSayı}`,
                            `${ayarlar.emoji.ses} **Ses kanalı:**  ${sesKanalSayı}`,
                            `🖇️ **Kategori:**  ${kategoriKanalSayı}`,
                            `🎞️ **Diğer kanallar:**  ${kanallar.size - (yazıKanalSayı + sesKanalSayı + kategoriKanalSayı)}`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        name: 'ÜYELER (' + guild.memberCount + ')',
                        value: [
                            `👥 **Üye sayısı:**  ${üyeler.filter(a => !a.user.bot).size}`,
                            `🤖 **Bot sayısı:**  ${üyeler.filter(a => a.user.bot === true).size}`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        name: 'EMOJİ BİLGİLERİ (' + emojiler.size + ')',
                        value: [
                            `${ayarlar.emoji.haraketsiz} **Haraketsiz emoji sayısı:**  ${emojiler.filter(a => !a.animated).size}`,
                            `${ayarlar.emoji.haraketli} **Haraketli emoji sayısı:**  ${emojiler.filter(a => a.animated === true).size}`
                        ].join("\n")
                    },
                    {
                        name: "BOOST BİLGİLERİ",
                        value: [
                            `${ayarlar.emoji.boost2} **Boost basan kişi sayısı:**  ${üyeler.filter(a => a.premiumSinceTimestamp).size}`,
                            `${ayarlar.emoji.boost1} **Basılan boost sayısı:**  ${guild.premiumSubscriptionCount}`,
                            `${ayarlar.emoji.boost3} **Boost leveli:**  ${guild.premiumTier} level`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        name: "FOTOĞRAFLAR",
                        value: [
                            `🖥️ **Pp:**  ${urller[0] ? `[ [URL] ](${urller[0]})` : "~~[URL]~~"}`,
                            `🖼️ **Banner:**  ${urller[1] ? `[ [URL] ](${urller[1]})` : "~~[URL]~~"}`,
                            `💌 **Davet arka planı:**  ${urller[2] ? `[ [URL] ](${urller[2]})` : "~~[URL]~~"}`,
                            `📡 **Keşfet arka planı:**  ${urller[3] ? `[ [URL] ](${urller[3]})` : "~~[URL]~~"}`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        name: `${ayarlar.emoji.rol} ROLLER (${everyoneHariçDigerRoller.size})`,
                        value: everyoneHariçDigerRoller.sort((a, b) => b.position - a.position).map(a => `<@&${a.id}>`).slice(0, 20).join(" | ") + (everyoneHariçDigerRoller.size > 20 ? `+${everyoneHariçDigerRoller.size - 20} rol daha...` : "")
                    })
                .setThumbnail(discordlogo)
                .setColor('Blue')
                .setTimestamp()
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}