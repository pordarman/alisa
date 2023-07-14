const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 5,
    name: "tagrol kişi bilgi",
    aliases: ["tag-bilgi"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let tags = guildDatabase.kayıt.tag
            , tagroldb = msg.client.tagrolDatabase(guildId, tags)
            , tag = tagroldb.tag || (tags ? tags.slice(0, -1) : undefined)
            , dis = tagroldb.dis || guildDatabase.kayıt.dis
            if (!tag && !dis) return hata("Şeyyy.. Bu sunucuda herhangi bir tag ayarlı değil :(")
            const kisi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg) || msgMember
            if (kisi.user.bot) return hata("Botların tag duruma bakamazsın şapşik şey seni :(")
            let ismindeTagVarMi = kisi.user.username.includes(tag)
            , disVarMi = kisi.user.discriminator == dis
            , taglar = []
            , pp = kisi.displayAvatarURL()
            if (ismindeTagVarMi) taglar.push(tag)
            if (disVarMi) taglar.push(`#${dis}`)
            const embed = new EmbedBuilder()
                .setAuthor({ name: kisi.user.tag, iconURL: pp })
                .setColor("Random")
                .setTimestamp()
                .setThumbnail(pp)
            if (taglar.length) embed.setDescription(`🏷️ **Tag durumu:**  Taglı ${ayarlar.emoji.p} - ( ${taglar.join(" - ")} )\n\n📅 **Tagı aldığı tarih:**  ${tagroldb.kisi[kisi.id] ? `<t:${(tagroldb.kisi[kisi.id] / 1000).toFixed(0)}:F> - <t:${(tagroldb.kisi[kisi.id] / 1000).toFixed(0)}:R>` : "Bilinmiyor ❓❓"}`)
            else embed.setDescription("🏷️ **Tag durumu:**  Taglı değil ❗")
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


