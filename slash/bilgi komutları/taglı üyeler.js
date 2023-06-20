const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  name: "taglı üyeler",
  data: new SlashCommandBuilder()
    .setName("taglıüyeler")
    .setDescription("Sunucudaki taglı üyeleri gösterir"),
  /**
   * 
   * @param {ChatInputCommandInteraction} int  
   * @param {Function} hata 
   */
  async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
    try {
      let tagroldb = int.client.tagrolDatabase(sunucuid, sunucudb.kayıt.tag)
        , tag = tagroldb.tag || (sunucudb.kayıt.tag ? sunucudb.kayıt.tag.slice(0, -1) : undefined)
        , dis = tagroldb.dis || sunucudb.kayıt.dis
      if (!tag && !dis) return hata("Şeyyy.. Bu sunucuda herhangi bir tag ayarlı değil :(")
      let sıra = 0
        , taglıUyeler = (await int.client.getMembers(int)).filter((member) => !member.user.bot && (tag ? member.user.username.includes(tag) : false) || (dis ? member.user.discriminator == dis : false)).sort((a, b) => (tagroldb.kisi[b.id] || 0) - (tagroldb.kisi[a.id] || 0)).map(a => {
          let aldıgıTaglar = []
            , tarihi = tagroldb.kisi[a.id]
          if (a.user.username.includes(tag)) aldıgıTaglar.push(tag)
          if (a.user.discriminator == dis) aldıgıTaglar.push(`#${dis}`)
          sıra += 1
          return `• \`#${sıra}\` <@${a.id}> **- ( ${aldıgıTaglar.join(" - ")} ) | ${tarihi ? `<t:${(tarihi / 1000).toFixed(0)}:F>` : "Tarih bilinmiyor ❓"}**`
        })
        , length = taglıUyeler.length
      if (!length) return hata("Şeyyy.. Bu sunucuda hiç kimse taglı değil :(")
      let sayfa = Math.ceil(length / 15)
        , pp = guild.iconURL()
        , embed = new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: pp })
          .setDescription(`**• Bu sunucuda toplamda __${length}__ tane taglı üye bulunuyor 🎉**\n\n${taglıUyeler.slice(0, 15).join("\n")}`)
          .setThumbnail(pp)
          .setColor("Random")
          .setFooter({ text: `Sayfa 1/${sayfa}` })
      if (sayfa == 1) return int.reply({ embeds: [embed] }).catch(err => { })
      let düğmesağ = new ButtonBuilder()
        .setStyle(1)
        .setEmoji(ayarlar.emoji.sagok)
        .setCustomId("NOT_sağok")
        , düğmesil = new ButtonBuilder()
          .setStyle(4)
          .setEmoji(ayarlar.emoji.sil)
          .setCustomId("NOT_sil")
        , düğmesol = new ButtonBuilder()
          .setStyle(1)
          .setEmoji(ayarlar.emoji.solok)
          .setCustomId("NOT_solok")
          .setDisabled(true)
        , düğmesaghizli = new ButtonBuilder()
          .setStyle(1)
          .setEmoji(ayarlar.emoji.sagokhizli)
          .setCustomId("NOT_saghizli")
        , düğmesolhizli = new ButtonBuilder()
          .setStyle(1)
          .setEmoji(ayarlar.emoji.solokhizli)
          .setCustomId("NOT_solhizli")
          .setDisabled(true)
        , düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
      int.reply({ embeds: [embed], components: [düğme], fetchReply: true }).then(a => {
        const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === int.user.id
        const clin = a.createMessageComponentCollector({ filter: filter, time: 120 * 1000 })
        let sayfasayısı = 1
        clin.on("collect", async oklar => {
          const id = oklar.customId
          if (id == "NOT_sil") return a.delete()
          if (["NOT_sağok", "NOT_saghizli"].includes(id)) {
            düğmesol.setDisabled(false)
            düğmesolhizli.setDisabled(false)
            if (sayfasayısı == sayfa) return;
            if (id === "NOT_sağok") sayfasayısı++;
            else sayfasayısı += 10
            if (sayfasayısı > sayfa) sayfasayısı = sayfa
            if (sayfasayısı == sayfa) {
              düğmesağ.setDisabled(true)
              düğmesaghizli.setDisabled(true)
            }
          } else {
            düğmesağ.setDisabled(false)
            düğmesaghizli.setDisabled(false)
            if (sayfasayısı == 1) return;
            if (id === "NOT_solok") sayfasayısı--;
            else sayfasayısı -= 10
            if (sayfasayısı < 1) sayfasayısı = 1
            if (sayfasayısı == 1) {
              düğmesol.setDisabled(true)
              düğmesolhizli.setDisabled(true)
            }
          }
          embed.setDescription(`**• Bu sunucuda toplamda __${length}__ tane taglı üye bulunuyor 🎉**\n\n${taglıUyeler.slice((sayfasayısı * 15 - 15), (sayfasayısı * 15)).join("\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
          a.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)] }).catch(err => { })
        })
        clin.on("end", async () => {
          düğmesağ.setDisabled(true).setStyle(2)
          düğmesol.setDisabled(true).setStyle(2)
          düğmesil.setDisabled(true).setStyle(2)
          düğmesaghizli.setDisabled(true).setStyle(2)
          düğmesolhizli.setDisabled(true).setStyle(2)
          const düğmeeditnew = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
          a.edit({ content: "Bu mesaj artık aktif değildir", components: [düğmeeditnew] }).catch(err => { })
        })
      }).catch(err => { })
    } catch (e) {
      hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
      int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}