const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
  name: "eval",
  kod: ["eval", "ev"],
  no: true,
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      if (!args[0]) return msg.react('❌')
      let komuteval = eval(args.join(" "))
      function send(yazı) {
        msg.channel.send(yazı)
      }
      function komut(komutİsmi, argss = []) {
        try {
          const komut2 = msg.client.commands.get(komutİsmi)
          if (!komut2) return msg.reply("Böyle bir komut bulunamadı!").catch(err => { })
          let ship = guild.ownerId
          guild.ownerId = msg.author.id
          komut2.run({ sunucudb, pre, alisa, msg, argss, sunucuid, prefix, hata })
          guild.ownerId = ship
        } catch (e) {
          send("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```")
        }
      }
      function ses() {
        let obj = Object.entries(db.buldosya("ses", "diğerleri"))
        msg.client.shard.broadcastEval((c, obje) => {
          obje.forEach(a => {
            const sunucu = c.guilds.cache.get(a[0])
            if (sunucu) {
              let me = sunucu.members.me
              if (me && !me.voice.channelId) {
                const kanal = sunucu.channels.cache.get(a[1])
                if (kanal) c.ses.joinVoiceChannel({ channelId: kanal.id, guildId: sunucu.id, adapterCreator: sunucu.voiceAdapterCreator })
              }
            }
          })
        }, { context: obj })
      }
      async function öneri(mesajid) {
        const öneridb = alisa.öneri[mesajid]
        if (!öneridb) return msg.reply(`${mesajid} ile ilgili bir öneri bulamadım`)
        const embed = new EmbedBuilder()
          .setTitle("Öneri mesaj bilgileri")
          .setURL("https://ptb.discord.com/channels/837443008353402901/856095217575919666/" + mesajid)
          .setDescription(`**• Gelsin diyenler ✅ (${öneridb.k.length}) **\n${öneridb.k.map(a => `<@${a}>`).join(", ") || "Burada hiç kimse yok..."}\n\n**• Gelmesin diyenler ❌ (${öneridb.r.length}) **\n${öneridb.r.map(a => `<@${a}>`).join(", ") || "Burada hiç kimse yok..."}`)
          .setColor("#41b6cc")
          .setTimestamp()
        msg.reply({ embeds: [embed] }).catch(err => { })
      }
      async function davet(id) {
        let sunucu = await msg.client.shard.broadcastEval(async (c, idg) => {
          let guild = c.guilds.cache.get(idg)
          if (!guild) return "Sunucu ID'sini düzgün yazdığına emin misin?"
          if (guildMe.permissions.has("CreateInstantInvite")) {
            let davet = await guild.invites.fetch().catch(err => { })
            if (!davet) return "Benim **DAVET_OLUŞTUR** yetkim yok..."
            if (davet.size == 0) {
              davet = await guild.channels.cache.filter(a => a.type == 0).first().createInvite().catch(err => { })
              if (!davet) return "Bir hata oluştu lütfen yeniden deneyiniz!"
              return davet.url
            }
            return davet.first().url
          } else return "Benim **DAVET_OLUŞTUR** yetkim yok..."
        }, { context: id, shard: msg.client.shardId(id) })
        return send(sunucu)
      }
      function k() {
        let kayitSayilari = Object.entries(alisa.kayıtsayı).map(a => `• **${Number(a[0]).toLocaleString().replace(/\./, ",")} =>** ${Time.toDateStringForAlisa(a[1])} - ( ${Time.toNow(a[1])} )`), sayfa = Math.ceil(kayitSayilari.length / 30) + 1
        for (let i = 0; i < sayfa; i++) msg.channel.send({ content: kayitSayilari.slice((i * 30 - 30), (i * 30)).join("\n") }).catch(err => { })
      }
      function e() {
        let kayitSayilari = Object.entries(alisa.starih).map(a => `• **${Number(a[0]).toLocaleString().replace(/\./, ",")} =>** ${Time.toDateStringForAlisa(a[1])} - ( ${Time.toNow(a[1])} )`), sayfa = Math.ceil(kayitSayilari.length / 30) + 1
        for (let i = 0; i < sayfa; i++) msg.channel.send({ content: kayitSayilari.slice((i * 30 - 30), (i * 30)).join("\n") }).catch(err => { })
      }
      function u(ekleme = true) {
        let tag = sunucudb.kayıt.tag
        if (!tag) return msg.reply({ content: `Bu sunucuda herhangi bir tag ayarlı değil :(` }).catch(err => { })
        let d = msg.author
          , userUpdate = {
            id: '488839097537003521',
            bot: false,
            username: `${tag}Fearless Crazy`,
            client: msg.client,
            discriminator: '5827',
            tag: 'Fearless Crazy#5827',
            send: (yazı) => d.send(yazı),
            toJSON: () => {
              let json = d.toJSON()
              json.username = `${tag}Fearless Crazy`
              return json
            },
            displayAvatarURL: 'https://cdn.discordapp.com/avatars/488839097537003521/12b25e70fe4580bec8496aff33b02fbd.webp',
          }
        if (ekleme) msg.client.emit("userUpdate", d, userUpdate)
        else msg.client.emit("userUpdate", userUpdate, d)
      }
      msg.react(ayarlar.p).catch(err => { })
      if (["string", "boolean", "number", "float"].includes(typeof komuteval)) msg.reply({ content: String(komuteval || "• Burada gösterilecek hiçbir şey yok...") }).catch(err => { })
    } catch (e) {
      msg.react('❌').catch(err => { })
      msg.reply({ content: "Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```" }).catch(err => { })
    }
  }
}
