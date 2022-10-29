const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 30,
    name: "yt bilgi",
    kod: "yt-bilgi",
    no: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        // try {
        //     if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
        //     let yt = msg.client.s(sunucuid, sunucudb.kayıt.tag).yasaklitag
        //         , yapılacaklar = { ban: "Banlanacak", kick: "Atılacak", rol: `Rol verilecek - (${yt.rol ? `<@&${yt.rol}>` : "__Rol ayarlanmamış__"})` }
        //         , ayar = yt.ayar ? `Kapalı ${ayarlar.emoji.kapali}` : `Açık ${ayarlar.emoji.acik}`
        //         , dme = yt.taglar ? yt.taglar.join(" - ") : []
        //         , secenek = yt.secenek ? `Butonla` : "Otomatik"
        //         , neYapacak = yapılacaklar[yt.do] || "Hiçbir şey yapılmayacak"
        //         , kanal = yt.kanal ? "<#" + yt.kanal + '>' : "Kanal ayarlanmamış ❗"
        //         , log = yt.log ? "<#" + yt.log + '>' : "Kanal ayarlanmamış ❗"
        //         , discordlogo = guild.iconURL()
        //         , embed = new EmbedBuilder()
        //             .setAuthor({ name: guild.name, iconURL: discordlogo })
        //             .setThumbnail(discordlogo)
        //             .setDescription([
        //                 `🎚️**Yasaklı tag ayarım:**  ${ayar}`,
        //                 `🏷️**Yasaklı taglar: (${dme.length})**  ${dme || "• Burada gösterilecek hiçbir şey yok..."}`,
        //                 `❓ **Yasaklı taga sahip birisi geldiğinde : (${dme.length})**  ${dme || "• Burada gösterilecek hiçbir şey yok..."}`,
        //                 `\n${ayarlar.emoji.kanal} **Yasaklı tag'a sahip üyeleri gösteren kanal:**  ${kanal}`,
        //                 `📁 **Yasaklı tag log'ların atılacağı kanal:**  ${log}`,
        //                 `\n📥 **Birisi tag aldıktan sonra atılacak mesaj:**  ${mesaje}`,
        //                 `📤 **Birisi tag'ı bıraktıktan sonra atılacak mesaj:**  ${mesajk}`,
        //                 `\n👤📥 **Birisi tag aldıktan sonra dm'den atılacak mesaj:**  ${dme}`,
        //                 `👤📤 **Birisi tag'ı bıraktıktan sonra dm'den atılacak mesaj:**  ${dmk}`
        //             ].join("\n"))
        //             .setColor("DarkPurple")
        //             .setFooter({ text: `${msg.client.user.username} Tagrol sistemi`, iconURL: msg.client.user.displayAvatarURL() })
        //             .setTimestamp()
        //     msg.reply({ embeds: [embed] }).catch(err => { })
        // } catch (e) {
        //     msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
        //     msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
        //     console.log(e)
        // }
    }
}
