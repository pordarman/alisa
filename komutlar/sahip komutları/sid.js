const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  name: "sid",
  aliases: ["sid"],
  owner: true,
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {
      const join = args.join(" ")
      if (!join) return msg.react("❌").catch(err => { })
      let shardFind = await msg.client.shard.broadcastEval(async (c, join) => {
        const { EmbedBuilder } = require("discord.js")
        const sunucu = c.guilds.cache.find(a => a.id === join || a.name.replace(/ +/g, " ") === join || a.name.replace(/ +/g, " ").includes(join))
        if (sunucu) {
          const uye = await c.getMembers({ guild: sunucu })
          const discordlogo = sunucu.iconURL()
          const embed = new EmbedBuilder()
            .setTitle('Sunucu bulundu')
            .setDescription(`Girdiğin ID **${sunucu.name}** adlı sunucuya ait`)
            .addFields(
              {
                name: 'Bilgileri',
                value: `📝 **Sunucu adı:**  ${sunucu.name}\n🆔 **Sunucu ID'si:**  ${sunucu.id}\n📅 **Sunucunun kurulma zamanı**  <t:${(sunucu.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(sunucu.createdTimestamp / 1000).toFixed(0)}:R>\n👥 **Kişi sayısı:**  ${sunucu.memberCount} (${uye.filter(a => !a.user.bot).size} Üye, ${uye.filter(a => a.user.bot === true).size} Bot)\n🎞️ **Kanal sayısı:**  ${sunucu.channels.cache.size} (<:kanal:859395005071622174> ${sunucu.channels.cache.filter(a => a.type !== 2 && a.type !== 4).size} ║ <:seskanal:864276533920661544> ${sunucu.channels.cache.filter(a => a.type === 2).size} ║ <:kategori:864582323500613649> ${sunucu.channels.cache.filter(a => a.type === 4).size})\n<:rol:859397279421300736> **Rol sayısı:**  ${sunucu.roles.cache.size}\n👑 **Sunucu sahibi:** <@${sunucu.ownerId}> | ${uye.cache.get(sunucu.ownerId)?.user?.tag || "Deleted User#0000"}`
              }
            )
            .setThumbnail(discordlogo)
            .setColor('Blue')
            .setTimestamp()
          return embed
        }
        const kanal = c.channels.cache.find(a => a.id === join || a.name?.replace(/ +/g, " ") === join || a.name?.replace(/ +/g, " ")?.includes(join))
        if (kanal) {
          const discordlogo = kanal.guild.iconURL()
          const tip = {
            "0": "Yazı kanalı <:kanal:859395005071622174>",
            "2": "Ses kanalı <:seskanal:864276533920661544>",
            "4": "Kategori <:kategori:864582323500613649>",
            "5": "Haber kanalı <:kanal:859395005071622174>"
          }[String(kanal.type)]
          const embed = new EmbedBuilder()
            .setTitle('Kanal bulundu')
            .setDescription(`Girdiğin ID ${kanal} adlı kanala ait`)
            .addFields(
              {
                name: "BİLGİLERİ",
                value: `📝 **Kanalın adı:**  ${kanal.name}\n🆔 **Kanalın ID'si:**  ${kanal.id}\n❓ **Kanalın tipi:**  ${tip}\n📅 **Kanalın oluşturulma tarihi:**  <t:${(kanal.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(kanal.createdTimestamp / 1000).toFixed(0)}:R>\n💻 **Kanalın bulunduğu sunucu:**  ${kanal.guild.name} - (${kanal.guildId})\n👑 **Sunucu sahibi:**  <@${kanal.guild.ownerId}> | ${(await kanal.guild.fetchOwner())?.user?.tag || "Deleted User#0000"}`
              }
            )
            .setColor('Blue')
            .setThumbnail(discordlogo)
            .setTimestamp()
          return embed
        }
        let kişi = c.users.cache.find(a => a.tag.replace(/ +/g, " ") === join || a.username.replace(/ +/g, " ") === join || a.username.replace(/ +/g, " ").includes(join))
        if (kişi) {
          await kişi.fetch(true)
          let kişininbanneri = kişi.bannerURL()
          const kişininfotografı = kişi.displayAvatarURL()
          const embed = new EmbedBuilder()
            .setTitle('Kullanıcı bulundu')
            .setDescription(`Girdiğin ID ${kişi} adlı kişiye ait`)
            .addFields(
              {
                name: 'BİLGİLERİ',
                value: `📝 **Kullanıcı adı:**  ${kişi.tag}\n🆔 **ID'si:**  ${kişi.id}\n${kişi.bot ? "🤖 **Bot mu:**  Bot" : "👤 **Bot mu:**  İnsan "}\n📅 **Hesabı oluşturma zamanı:**  <t:${(kişi.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(kişi.createdTimestamp / 1000).toFixed(0)}:R>${kişininbanneri ? "\n\n**Banner**" : ""}`
              }
            )
            .setThumbnail(kişininfotografı)
            .setImage(kişininbanneri)
            .setColor('Blue')
            .setTimestamp()
          return embed
        }
        let rol
        c.guilds.cache.some(a => {
          rol = a.roles.cache.get(join.replace(/[<@&>]/g, ""))
          if (rol) return true
        })
        if (rol) {
          const a = rol.managed ? 'Bot 🤖' : "İnsan 👤"
          const b = rol.hoist ? "👤 **Bu rol diğer üyelerden ayrı mı:**  Evet" : "🫂 **Bu rol diğer üyelerden ayrı mı:**  Hayır"
          const c = rol.members.size ? (rol.members.map(a => '<@' + a.id + '>').slice(0, 40).join(' | ') + (`${rol.members.size > 40 ? `+${rol.members.size - 40} daha...` : ""}`)) : "Kimse bu role sahip değil.."
          const embed = new EmbedBuilder()
            .setTitle("Rol bulundu")
            .setDescription("Yazdığın ID **" + rol.name + "** adlı role ait")
            .addFields(
              {
                name: "BİLGİLERİ",
                value: `📝 **Adı:**  ${rol.name}\n🆔 **ID'si:**  ${rol.id}\n🖌️ **Rolün rengi:**  ${rol.hexColor}\n📅 **Rolün oluşturulma tarihi:**  <t:${(rol.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(rol.createdTimestamp / 1000).toFixed(0)}:R>\n❓ **Rol kim tarafından oluşturulmuş:**  ${a}\n<:rol:859397279421300736> **Rolden bahsedilebilir mi:**  ${rol.mentionable ? "Evet" : "Hayır"}\n${b}\n📍 **Rolün sunucudaki sırası:**  ${rol.position}/${rol.guild.roles.cache.size}\n💻 **Kanalın bulunduğu sunucu:**  ${rol.guild.name} - (${rol.guildId})\n👑 **Sunucu sahibi:**  <@${rol.guild.ownerId}> | ${(await rol.guild.fetchOwner())?.user?.tag || "Deleted User#0000"}`
              },
              {
                name: '👥 BU ROLE SAHİP KULLANICILAR (' + rol.members.size + ')',
                value: c
              }
            )
            .setColor(rol.hexColor ?? "#9e02e2")
            .setThumbnail('https://www.colorhexa.com/' + rol.hexColor.slice(1) + '.png')
            .setTimestamp()
          return embed
        }
      }, { context: join })
      let embeds = shardFind.find(a => a != null)
      if (embeds) return msg.reply({ embeds: [embeds] }).catch(err => { })
      let kişi = await msg.client.fetchUser(join)
      if (kişi) {
        await kişi.fetch(true)
        let kişininbanneri = kişi.bannerURL()
        const kişininfotografı = kişi.displayAvatarURL()
        const embed = new EmbedBuilder()
          .setTitle('Kullanıcı bulundu')
          .setDescription(`Girdiğin ID ${kişi} adlı kişiye ait`)
          .addFields(
            {
              name: 'BİLGİLERİ',
              value: `📝 **Kullanıcı adı:**  ${kişi.tag}\n🆔 **ID'si:**  ${kişi.id}\n${kişi.bot ? "🤖 **Bot mu:**  Bot" : "👤 **Bot mu:**  İnsan "}\n📅 **Hesabı oluşturma zamanı:**  <t:${(kişi.createdTimestamp / 1000).toFixed(0)}:F> - <t:${(kişi.createdTimestamp / 1000).toFixed(0)}:R>${kişininbanneri ? "\n\n**Banner**" : ""}`
            }
          )
          .setThumbnail(kişininfotografı)
          .setImage(kişininbanneri)
          .setColor('Blue')
          .setTimestamp()
        return msg.reply({ embeds: [embed] }).catch(err => { })
      }
      return msg.reply(`**${msg.content.slice((prefix.length + 4))}** ile ilgili hiçbir şey bulamadım`).catch(err => { })
    } catch (e) {
      msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
      console.log(e)
    }
  }
}
