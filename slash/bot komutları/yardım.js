const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yardım",
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Botun yardım menüsü"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {
            let pp = int.member.displayAvatarURL()
                , id = int.user.id
                , selectMenu = new SelectMenuBuilder()
                    .setCustomId(id)
                    .setPlaceholder('Bir şey seçilmedi...')
                    .addOptions([
                        {
                            label: 'Tüm komutlar',
                            description: 'Botun tüm komutlarını gösterir',
                            value: "tüm_komutlar" + id,
                            emoji: ayarlar.emoji.tum
                        },
                        {
                            label: 'Bot komutları',
                            description: 'Botun ana komutlarını gösterir',
                            value: "bbot_komutları" + id,
                            emoji: ayarlar.emoji.bot
                        },
                        {
                            label: 'Kayıt komutları',
                            description: 'Botun kayıt komutlarını gösterir',
                            value: "kayıt_komutları" + id,
                            emoji: ayarlar.emoji.kayit
                        },
                        {
                            label: 'Tagrol komutları',
                            description: 'Tagrol komutlarını gösterir',
                            value: "tagrol_komutlari" + id,
                            emoji: ayarlar.emoji.tagrol
                        },
                        {
                            label: 'Moderasyon komutları',
                            description: 'Moderasyon komutlarını gösterir',
                            value: "moderasyon_komutlari" + id,
                            emoji: ayarlar.emoji.mod
                        },
                        {
                            label: 'Jail komutları',
                            description: 'Jail komutlarını gösterir',
                            value: "jail_komutlari" + id,
                            emoji: ayarlar.emoji.jail
                        },
                        {
                            label: 'Bilgi komutları',
                            description: 'Botun bilgi komutlarını gösterir',
                            value: "bilgi_komutlari" + id,
                            emoji: ayarlar.emoji.bilgi
                        },
                        {
                            label: 'Ekstra komutlar',
                            description: 'Botun ekstra komutlarını gösterir',
                            value: "ekstra_komutlar" + id,
                            emoji: ayarlar.emoji.ekstra
                        },
                        {
                            label: 'Premium komutlarını',
                            description: 'Botun premium komutlarını gösterir',
                            value: "premium_komutlari" + id,
                            emoji: ayarlar.emoji.pre
                        },
                    ])
                , dugmeTumKomutlar = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.tum)
                    .setCustomId("tüm_komutlar" + id)
                , dugmeBotKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.bot)
                    .setCustomId("bbot_komutları" + id)
                , dugmeKayitKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.kayit)
                    .setCustomId("kayıt_komutları" + id)
                , dugmeTagrolKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.tagrol)
                    .setCustomId("tagrol_komutlari" + id)
                , dugmeModerasyonKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.mod)
                    .setCustomId("moderasyon_komutlari" + id)
                , dugmeJailKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.jail)
                    .setCustomId("jail_komutlari" + id)
                , dugmeBilgiKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.bilgi)
                    .setCustomId("bilgi_komutlari" + id)
                , dugmeEkstraKomutlar = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.ekstra)
                    .setCustomId("ekstra_komutlar" + id)
                , dugmePremiumKomutlari = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.pre)
                    .setCustomId("premium_komutlari" + id)
                , dugme = new ActionRowBuilder().addComponents(dugmeTumKomutlar).addComponents(dugmeBotKomutlari).addComponents(dugmeKayitKomutlari).addComponents(dugmeTagrolKomutlari).addComponents(dugmeModerasyonKomutlari)
                , dugme3 = new ActionRowBuilder().addComponents(dugmeJailKomutlari).addComponents(dugmeBilgiKomutlari).addComponents(dugmeEkstraKomutlar).addComponents(dugmePremiumKomutlari)
                , dugme2 = new ActionRowBuilder().addComponents(selectMenu)
                , commands = int.client.allCommands(sunucudb)[0]
                , embed = new EmbedBuilder()
                    .setAuthor({ name: int.client.user.username, iconURL: int.client.user.displayAvatarURL() })
                    .setDescription(`**${ayarlar.emoji.tum} Tüm komutlar (${commands.length})\n\n${ayarlar.emoji.bot} Botun ana komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.bot)).length})\n${ayarlar.emoji.kayit} Botun kayıt komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.kayit)).length})\n${ayarlar.emoji.tagrol} Botun tagrol komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.tagrol)).length})\n${ayarlar.emoji.mod} Botun moderasyon komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.mod)).length})\n${ayarlar.emoji.jail} Botun jail komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.jail)).length})\n${ayarlar.emoji.bilgi} Botun bilgi komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.bilgi)).length})\n${ayarlar.emoji.ekstra} Botun ekstra komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.ekstra)).length})\n\n${ayarlar.emoji.pre} Botun premium komutları (${commands.filter(a => a.startsWith(ayarlar.emoji.pre)).length})\n\n🚀 Bağlantılarım\n[ [Beni davet et](${ayarlar.davet}) | [Oy ver](https://top.gg/bot/${int.client.user.id}/vote) | [Destek sunucum](${ayarlar.discord}) ]**`)
                    .setThumbnail(pp)
                    .setColor('#0099ff')
                    .setTimestamp()
            int.reply({ embeds: [embed], components: [dugme, dugme3, dugme2] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}