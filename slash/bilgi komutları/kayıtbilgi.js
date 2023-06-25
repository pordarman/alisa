const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "bilgi",
    data: new SlashCommandBuilder()
        .setName("kayıtbilgi")
        .setDescription("Kayıt ayarlarını gösterir"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let yetkilirolid = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (yetkilirolid) {
                if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            } else if (!intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            
            let seçenek
                , yazıı
                , özel = guildDatabase.kayıt.özel ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
                , gözel = guildDatabase.kayıt.gözel ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
                , botrolid = guildDatabase.kayıt.bot
                , kayıtsizrolid = guildDatabase.kayıt.kayıtsız
                , kayıtkanalid = guildDatabase.kayıt.kanal
                , logkanalid = guildDatabase.kayıt.günlük
                , logKanalid = guildDatabase.kayıt.log
                , tag = guildDatabase.kayıt.tag, kayıttag = []
                , kayıtsembol = guildDatabase.kayıt.sembol
                , kayıtotoisim = guildDatabase.kayıt.isimler.giris
                , botrolü = botrolid ? botrolid.map(a => "<@&" + a + ">").join(" | ") : "Rol ayarlanmamış ❗"
                , discordlogo = guild.iconURL()
                , arol = kayıtsizrolid ? '<@&' + kayıtsizrolid + '>' : "Rol ayarlanmamış ❗"
                , yetkili = yetkilirolid ? '<@&' + yetkilirolid + '>' : "Rol ayarlanmamış ❗"
                , kayıt_kanal = kayıtkanalid ? "<#" + kayıtkanalid + '>' : "Kanal ayarlanmamış ❗"
                , kayıt_günlük = logkanalid ? '<#' + logkanalid + '>' : "Kanal ayarlanmamış ❗"
                , kayıt_log = logKanalid ? '<#' + logKanalid + '>' : "Kanal ayarlanmamış ❗"
                , ayar = guildDatabase.kayıt.ayar ? `Kayıt yapamazsınız ${ayarlar.emoji.kapali}` : `Kayıt yapabilirsiniz ${ayarlar.emoji.acik}`
                , otoduzeltme = guildDatabase.kayıt.otoduzeltme ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                , yaszorunlu = guildDatabase.kayıt.yaszorunlu ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                , bototo = guildDatabase.kayıt.bototo ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                , sembol = kayıtsembol || "Sembol ayarlanmamış ❗"
                , otoisim = kayıtotoisim ? kayıtotoisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, int.user.username) : "Ayarlanmamış ❗"
            if (guildDatabase.kayıt.secenek) {
                let kayıtrolid = guildDatabase.kayıt.normal
                    , kayıtrolü = kayıtrolid ? kayıtrolid.map(a => "<@&" + a + ">").join(" | ") : "Rol ayarlanmamış ❗"
                seçenek = "Normal kayıt 👤"
                yazıı = `**• Üyelere verilecek olan rol(ler):**  ${kayıtrolü}`
            } else {
                let kızrolid = guildDatabase.kayıt.kız
                    , erkekrolid = guildDatabase.kayıt.erkek
                    , kız = kızrolid ? kızrolid.map(a => "<@&" + a + ">").join(" | ") : "Rol ayarlanmamış ❗"
                    , erkek = erkekrolid ? erkekrolid.map(a => "<@&" + a + ">").join(" | ") : "Rol ayarlanmamış ❗"
                seçenek = "Cinsiyete göre kayıt 👫"
                yazıı = `**• Erkeklere verilecek olan rol(ler):**  ${erkek}\n**• Kızlara verilecek olan rol(ler):**  ${kız}`
            }
            if (tag) kayıttag.push(tag.slice(0, -1))
            if (guildDatabase.kayıt.dis) kayıttag.push(`#${guildDatabase.kayıt.dis}`)
            let kayıtisim
                , kayıtisimler = guildDatabase.kayıt.isimler.kayıt
                , tagımız = kayıttag.join(" - ") || "Tag ayarlanmamış ❗"
            if (kayıtisimler) kayıtisim = kayıtisimler.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, "Ali " + guildDatabase.kayıt.sembol + "İhsan").replace(/<yaş>/g, "19")
            else kayıtisim = `${tag || ""}Ali ${guildDatabase.kayıt.sembol || ""}19`
            const embed = new EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: discordlogo })
                .setThumbnail(discordlogo)
                .setDescription('**• Kayıt ayarım:**  ' + ayar + '\n**• Kayıt türü:**  ' + seçenek)
                .addFields(
                    {
                        name: `${ayarlar.emoji.rol} ROLLER`,
                        value: [
                            yazıı,
                            `**• Botlara verilecek olan rol:**  ${botrolü}`,
                            `**• Üyeleri kayıt eden yetkili:**  ${yetkili}`,
                            `**• Üyeleri kayıt ettikten sonra alınacak rol:**  ${arol}`
                        ].join("\n")
                    },
                    {
                        name: `${ayarlar.emoji.kanal} KANALLAR`,
                        value: [
                            `**• Kayıt kanalı:**  ${kayıt_kanal}`,
                            `**• Kayıt günlük kanalı:**  ${kayıt_günlük}`,
                            `**• Kayıt log kanalı:**  ${kayıt_log}`
                        ].join("\n")
                    },
                    {
                        name: '✏️ DİĞERLERİ',
                        value: [
                            `**• Sunucuya özel tag:**  ${tagımız}`,
                            `**• İsimlerin arasına koyulacak sembol:**  ${sembol}`,
                            `**• Botları otomatik kayıt etme:**  ${bototo}`,
                            `**• İsimleri otomatik düzeltme:**  ${otoduzeltme}`,
                            `**• Yaş zorunluluğu:**  ${yaszorunlu}`,
                            `**• Özelleştirilmiş giriş mesajı:**  ${özel}`,
                            `**• Özelleştirilmiş günlük mesajı:**  ${gözel}`,
                            `**• Oto isim:**  ${otoisim}`,
                            `\n**Birisini kayıt ettikten sonra şöyle gözükecek**\n└> ${kayıtisim}`
                        ].join("\n")
                    })
                .setColor('Blue')
                .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: int.client.user.displayAvatarURL() })
                .setTimestamp()
            int.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}