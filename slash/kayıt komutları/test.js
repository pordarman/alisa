const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "test",
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Botun birisini kayıt ederken vereceği hataları önceden görmenize yardımcı olur"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, sunucudb, alisa, hata, sunucuid, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            
            int.reply({ embeds: [new EmbedBuilder().setDescription(`• Veriler kontrol ediliyor, lütfen biraz bekleyiniz... `).setColor("Orange")], fetchReply: true }).then(async mesaj => {
                let embed = new EmbedBuilder().setTitle("Sanki biraz yapılması gereken şeyler var gibi?").setColor("Blue").setTimestamp()
                    , rolhatalar = []
                    , yetkihatalari = []
                    , kanalhatalari = []
                    , oneriler = []
                    , botrolid = sunucudb.kayıt.bot
                    , kayitsizrolid = sunucudb.kayıt.kayıtsız
                    , yetkilirolid = sunucudb.kayıt.yetkili
                    , digerroller = []
                if (sunucudb.kayıt.ayar) rolhatalar.push("• Kayıt ayarım kapalı durumda, hiçbir kayıt işlemini yapamazsınız!")
                if (!kayitsizrolid) rolhatalar.push("• Kayıtsız üyelere verilecek rol ayarlanmamış!")
                else digerroller.push(kayitsizrolid)
                if (!botrolid) rolhatalar.push("• Botlara verilecek rol ayarlanmamış!")
                else digerroller = [...digerroller, ...botrolid]
                if (sunucudb.kayıt.secenek) {
                    const kayitrolid = sunucudb.kayıt.normal
                    if (!kayitrolid) rolhatalar.push("• Üyelere verilecek rol ayarlanmamış!")
                    else digerroller = [...digerroller, ...kayitrolid]
                } else {
                    const erkekrolid = sunucudb.kayıt.erkek
                    const kızrolid = sunucudb.kayıt.kız
                    if (!erkekrolid) rolhatalar.push("• Erkeklere verilecek rol ayarlanmamış!")
                    else digerroller = [...digerroller, ...erkekrolid]
                    if (!kızrolid) rolhatalar.push("• Kızlara verilecek rol ayarlanmamış!")
                    else digerroller = [...digerroller, ...kızrolid]
                }
                let guildMe = int.guild.members.me
                if (!guildMe.permissions.has("ManageNicknames")) yetkihatalari.push("• Benim isimleri düzenleme yetkim yok")
                if (!guildMe.permissions.has("ManageRoles")) yetkihatalari.push("• Benim rolleri düzenleme yetkim yok")
                if (!yetkilirolid) rolhatalar.push("• Üyeleri kayıt eden yetkili rolü ayarlanmamış!")
                else {
                    if (guild.roles.cache.get(kayitsizrolid)?.position >= guildMe.roles.highest.position) rolhatalar.push("• Kayıtsız rolünün sırası benim rolümün sırasından yüksek olduğu için onların isimlerini değiştiremem")
                    const yuksekroluyari = digerroller.filter(a => guild.roles.cache.get(a).position >= guildMe.roles.highest.position)
                    if (yuksekroluyari.length) rolhatalar.push(`• [${yuksekroluyari.map(a => "<@&" + a + ">").join(" | ")}] adlı roller benim rolümün sırasından yüksek olduğu için bu rolleri başkalarına veremem`)
                }
                const kayitkanal = sunucudb.kayıt.kanal
                const gunluk = sunucudb.kayıt.günlük
                const log = sunucudb.kayıt.log
                const fields = []
                if (!kayitkanal) kanalhatalari.push("• Kayıtların yapılacağı kanal ayarlanmamış!")
                else await guild.channels.cache.get(kayitkanal)?.send("Deneme").then(a => a.delete()).catch(() => rolhatalar.push("• Kayıt kanalına mesaj atabilme yetkim yok!"))
                if (!guildMe.permissions.has("Administrator")) oneriler.push("• Botun düzgün çalışması için bana yönetici yetkisi verdiğinizden emin olunuz")
                if (!gunluk) oneriler.push("• Kayıt günlük kanalı ayarlanmamış")
                else await guild.channels.cache.get(gunluk)?.send("Deneme").then(a => a.delete()).catch(() => rolhatalar.push("• Kayıt günlük kanalına mesaj atabilme yetkim yok!"))
                if (!log) oneriler.push("• Kayıt log kanalı ayarlanmamış")
                else await guild.channels.cache.get(log)?.send("Deneme").then(a => a.delete()).catch(() => rolhatalar.push("• Kayıt log kanalına mesaj atabilme yetkim yok!"))
                if (rolhatalar.length) fields.push({ name: `${ayarlar.emoji.rol} ROL HATALARI`, value: rolhatalar.join("\n") })
                if (yetkihatalari.length) fields.push({ name: "🧰 YETKİ HATALARI", value: yetkihatalari.join("\n") })
                if (kanalhatalari.length) fields.push({ name: `${ayarlar.emoji.kanal} KANAL HATALARI`, value: kanalhatalari.join("\n") })
                if (oneriler.length) fields.push({ name: "💬 YAPILMASI ÖNERİLEN", value: oneriler.join("\n") })
                if (!fields.length) return mesaj.edit({ embeds: [embed.setTitle(`${ayarlar.emoji.cildir} İşte buuu!!!`).setDescription(`Bot bu sunucuda kusursuz çalışıyor, kayıt işlemlerini gönül rahatlığıyla yapabilirsiniz!`)] }).catch(err => { })
                embed.addFields(...fields)
                mesaj.edit({ embeds: [embed] }).catch(err => { })
            }).catch(err => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}