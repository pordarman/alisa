const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 15,
  name: "yardım",
  aliases: ["help", "yardım", "yardim"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      let pp = msg.author.displayAvatarURL()
        , id = msg.author.id
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
        , [commands] = msg.client.allCommands(sunucudb)
        , embed = new EmbedBuilder()
          .setAuthor({ name: msg.client.user.username, iconURL: msg.client.user.displayAvatarURL() })
          .setDescription(`**${ayarlar.emoji.tum} Tüm komutlar (${commands.length})\n\n${ayarlar.emoji.bot} Botun ana komutları (${commands.filter(a => a.type == "bot").length})\n${ayarlar.emoji.kayit} Botun kayıt komutları (${commands.filter(a => a.type == "kayıt").length})\n${ayarlar.emoji.tagrol} Botun tagrol komutları (${commands.filter(a => a.type == "tagrol").length})\n${ayarlar.emoji.mod} Botun moderasyon komutları (${commands.filter(a => a.type == "mod").length})\n${ayarlar.emoji.jail} Botun jail komutları (${commands.filter(a => a.type == "jail").length})\n${ayarlar.emoji.bilgi} Botun bilgi komutları (${commands.filter(a => a.type == "bilgi").length})\n${ayarlar.emoji.ekstra} Botun ekstra komutları (${commands.filter(a => a.type == "ekstra").length})\n\n${ayarlar.emoji.pre} Botun premium komutları (${commands.filter(a => a.type == "pre").length})\n\n🚀 Bağlantılarım\n[ [Beni davet et](${ayarlar.davet}) | [Oy ver](https://top.gg/bot/${msg.client.user.id}/vote) | [Destek sunucum](${ayarlar.discord}) ]**`)
          .setThumbnail(pp)
          .setColor('#0099ff')
          .setTimestamp()
      msg.reply({ embeds: [embed], components: [dugme, dugme3, dugme2] }).catch(err => { console.log(err) })
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
