const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
const rastgeleKod = require("../../rastgele kod")
module.exports = {
    name: "premium",
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Botun premium sistemi hakkında bilgiler verir")
        .addSubcommand(subcommand => subcommand.setName("kullan").setDescription("Botun size verdiği premium kodunu giriniz").addStringOption(inp => inp.setName("kod").setDescription("Kodu giriniz").setRequired(true)).addStringOption(inp => inp.setName("id").setDescription("Sunucu ID'si giriniz").setRequired(false)))
        .addSubcommand(subcommand => subcommand.setName("değiştir").setDescription("Girdiğiniz premium kodunu başka bir sunucuya aktarmanızı sağlar").addStringOption(inp => inp.setName("kod").setDescription("Kodu giriniz").setRequired(true)).addStringOption(inp => inp.setName("id").setDescription("Sunucu ID'sini giriniz").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("özellik").setDescription("Premium özelliklerini gösterir"))
        .addSubcommand(subcommand => subcommand.setName("fiyat").setDescription("Premium fiyat bilgisini gösterir"))
        .addSubcommand(subcommand => subcommand.setName("süre").setDescription("Premium'unuzun bitmesine kalan süreyi gösterir")),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            let prefix = guildDatabase.prefix || ayarlar.prefix
            switch (int.options.getSubcommand(false)) {
                case "kullan": {
                    let kod = int.options.getString("kod", false)
                        , dosya = db.buldosya("premium", "diğerleri")
                    if (!kod) return hata(`Lütfen yetkililerden aldığınız premium komutu giriniz\n\n**Örnek**\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)}`)
                    let kodVarMı = Object.entries(dosya).find(a => a[1].code == kod)
                    if (!kodVarMı) return hata(`**${kod}** koduna karşılık gelen premium kodunu bulamadım!\n\n• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[destek sunucuma](${ayarlar.discord})__ gelip yetkililerden destek alabilirsiniz`)
                    if (kodVarMı[1].author != int.user.id) return hata(`Bu premium kodunu yalnızca satın alan kişi (<@${kodVarMı[1].author}>) kullanabilir`)
                    if (kodVarMı[1].isUse) return hata(`**${kod}** koduna karşılık gelen premium kodunda zaten bir sunucu ( ${(await int.client.getGuild(kodVarMı[0]))?.name || kodVarMı[0]} ) bulunuyor${kodVarMı[1].isDemo ? "" : `\n\n• Eğer premiumunuzu başka bir sunucuya aktarmak için **${prefix}pre değiştir** yazarak premiumunuzu başka bir sunucuya aktarabilirsiniz`}`)
                    let guildId = int.options.getString("id", false) || guildId
                    if (dosya[guildId]) return hata(`Şeyyy... ${await int.client.getGuildNameOrId(guildId)} sunucuda zaten bir premium bulunuyor şapşik şey seni :(`)
                    if (kodVarMı[1].isDemo) {
                        if (kodVarMı[1].guild == guildId) {
                            if (dosya.g.includes(guildId)) return hata(`${await int.client.getGuildNameOrId(guildId)} sunucu daha önceden ${int.client.user.username}'nın deneme sürümünü kullanmış :((`)
                        } else return hata(`Bu premium kodunu sadece **${(await int.client.getGuild(kodVarMı[1].guild))?.name || `${kodVarMı[1].guild}** ID'ye sahip**`} **sunucu kullanabilir şapşik şey seni :(`)
                    }
                    let isFinite = kodVarMı[1].expiresTimestamp
                    dosya[guildId] = { ...kodVarMı[1], expiresTimestamp: isFinite ? (Date.now() + isFinite) : undefined, isUse: true }
                    delete dosya[kodVarMı[0]]
                    dosya.g.push(guildId)
                    db.yazdosya(dosya, "premium", "diğerleri")
                    let dosyaDatabase = db.bul(guildId, "premium database", "diğerleri")
                    if (dosyaDatabase) {
                        let guildDatabase = int.client.guildDatabase(guildId)
                            , tagroldb = int.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
                        guildDatabase.kayıt.yassinir = dosyaDatabase.kayıt.yassinir
                        tagroldb.mesaje = dosyaDatabase.tagrol.mesaje
                        tagroldb.mesajk = dosyaDatabase.tagrol.mesajk
                        tagroldb.dmesaje = dosyaDatabase.tagrol.dmesaje
                        tagroldb.dmesajk = dosyaDatabase.tagrol.dmesajk
                        db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                        db.yazdosya(guildDatabase, guildId)
                        db.sil(guildId, "premium database", "diğerleri")
                    }
                    if (isFinite) {
                        Time.setTimeout(async () => {
                            let dosya = db.buldosya("premium", "diğerleri")
                                , veri = Object.entries(dosya).find(a => a[1].code == kod)
                            delete dosya[veri[0]]
                            dosya[veri[0] + " - " + Date.now()] = veri[1]
                            db.yazdosya(dosya, "premium", "diğerleri")
                            let sunucuAdı = (await int.client.getGuild(veri[0]))?.name
                                , kisi = await int.client.fetchUserForce(veri[1].author)
                            kisi.send(`• Heyy bakıyorum ki **${sunucuAdı || `${veri[0]}** ID'ye sahip**`} **sunucunun premiumu bitmiş gibi görünüyor :(\n\n• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n• ${ayarlar.discord}`).catch(err => { })
                                ; (await int.client.fetchUserForce(ayarlar.sahip)).send(`**> PREMİUM BİLGİLENDİRME**\n\n• **${sunucuAdı || "❓ Bilinmeyen sunucu"} - (${veri[0]})** sunucunun premium'u bitmiştir.\n• **Satın alan kişi:** <@${kisi.id}> - ${kisi.tag}\n• **Kullandığı süre:** ${Time.duration(veri[1].totalTime)}`).catch(err => { })
                            let guildDatabase = int.client.guildDatabase(veri[0])
                                , tagroldb = int.client.tagrolDatabase(veri[0], guildDatabase.kayıt.tag)
                                , object = { kayıt: { yassinir: guildDatabase.kayıt.yassinir }, premium: guildDatabase.premium, tagrol: { dmesaje: tagroldb.dmesaje, dmesajk: tagroldb.dmesajk, mesaje: tagroldb.mesaje, mesajk: tagroldb.mesajk } }
                            guildDatabase.premium = {}
                            delete guildDatabase.kayıt.yassinir
                            delete tagroldb.dmesaje
                            delete tagroldb.dmesajk
                            delete tagroldb.mesaje
                            delete tagroldb.mesajk
                            db.yaz(veri[0], tagroldb, "tag rol", "diğerleri")
                            db.yazdosya(guildDatabase, veri[0])
                            db.yaz(veri[0], object, "premium database", "diğerleri")
                        }, kodVarMı[1].expiresTimestamp)
                    }
                    return hata(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await int.client.getGuildNameOrId(guildId)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "b")
                }
                case "değiştir": {
                    let kod = int.options.get("kod", true)
                        , dosya = db.buldosya("premium", "diğerleri")
                    if (!kod) return hata(`Lütfen yetkililerden aldığınız premium komutu giriniz\n\n**Örnek**\n• ${prefix}pre değiştir ${rastgeleKod(8, dosya)} <guildId>`)
                    let kodVarMı = Object.entries(dosya).find(a => a[1].code == kod)
                    if (!kodVarMı) return hata(`**${kod}** koduna karşılık gelen premium kodunu bulamadım!\n\n• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[destek sunucuma](${ayarlar.discord})__ gelip yetkililerden destek alabilirsiniz`)
                    if (kodVarMı[1].author != int.user.id) return hata(`Bu premium kodunu yalnızca satın alan kişi (<@${kodVarMı[1].author}>) kullanabilir`)
                    if (isNaN(+kodVarMı[0])) return hata(`**${kod}** koduna karşılık gelen premium kodunda zaten herhangi bir sunucu tanımlanmamış!\n\n• Eğer premium kodunu kullanmak isterseniz **${prefix}pre kullan <kod> <guildId>** şeklinde yazabilirsiniz\n\n**Örnek**\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)}\n\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)} ${guildId}`)
                    if (kodVarMı[1].isDemo) return hata(`Premium deneme sürümünü başka bir sunucuya aktaramazsın şapşik şey seni :((`)
                    let guildId = int.options.getString("id")
                    if (!guildId) return hata("Lütfen premium özelliğini aktaracağınız sunucunun ID'sini giriniz")
                    if (kodVarMı[0] == guildId) return hata(`Girdiğiniz premium kodu zaten ${await int.client.getGuildNameOrId(guildId)} sunucuda kullanılıyor`)
                    if (dosya[guildId]) return hata(`Şeyyy... **${(await int.client.getGuild(kodVarMı[1].guild))?.name || `${kodVarMı[1].guild}** ID'ye sahip**`} **sunucuda zaten bir premium bulunuyor şapşik şey seni :(`)
                    dosya[guildId] = { ...kodVarMı[1], isUse: true }
                    delete dosya[kodVarMı[0]]
                    dosya.g.push(guildId)
                    let guildDatabase = int.client.guildDatabase(kodVarMı[0])
                        , tagroldb = int.client.tagrolDatabase(kodVarMı[0], guildDatabase.kayıt.tag)
                        , object = { kayıt: { yassinir: guildDatabase.kayıt.yassinir }, premium: guildDatabase.premium, tagrol: { dmesaje: tagroldb.dmesaje, dmesajk: tagroldb.dmesajk, mesaje: tagroldb.mesaje, mesajk: tagroldb.mesajk } }
                    guildDatabase.premium = {}
                    delete guildDatabase.kayıt.yassinir
                    delete tagroldb.dmesaje
                    delete tagroldb.dmesajk
                    delete tagroldb.mesaje
                    delete tagroldb.mesajk
                    db.yaz(kodVarMı[0], tagroldb, "tag rol", "diğerleri")
                    db.yazdosya(guildDatabase, kodVarMı[0])
                    db.yaz(kodVarMı[0], object, "premium database", "diğerleri")
                    db.yazdosya(dosya, "premium", "diğerleri")
                    let dosyaDatabase = db.bul(guildId, "premium database", "diğerleri")
                    if (dosyaDatabase) {
                        let guildDatabase = int.client.guildDatabase(guildId)
                            , tagroldb = int.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
                        guildDatabase.kayıt.yassinir = dosyaDatabase.kayıt.yassinir
                        guildId.premium = dosyaDatabase.premium
                        tagroldb.mesaje = dosyaDatabase.tagrol.mesaje
                        tagroldb.mesajk = dosyaDatabase.tagrol.mesajk
                        tagroldb.dmesaje = dosyaDatabase.tagrol.dmesaje
                        tagroldb.dmesajk = dosyaDatabase.tagrol.dmesajk
                        db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                        db.yazdosya(guildDatabase, guildId)
                        db.sil(guildId, "premium database", "diğerleri")
                    }
                    return hata(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await int.client.getGuildNameOrId(guildId)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "b")
                }
                case "özellik": {
                    let pp = int.client.user.displayAvatarURL()
                    return int.reply({ embeds: [new EmbedBuilder().setAuthor({ name: int.client.user.username, iconURL: pp }).setDescription(`• *Botun premium sistemi özellikleri*`).setColor("#9e02e2").setTimestamp().setThumbnail(pp)] }).catch(err => { })
                }
                case "fiyat": {
                    let pre = db.bul(guildId, "premium", "diğerleri")
                        , pp = int.client.user.displayAvatarURL()
                    return int.reply({ embeds: [new EmbedBuilder().setAuthor({ name: int.client.user.username, iconURL: pp }).setDescription(`*Botun premium fiyatlandırma bilgileri*`).setColor("#9e02e2").setTimestamp().setThumbnail(pp)] }).catch(err => { })
                }
                case "süre": {
                    let pre = db.bul(guildId, "premium", "diğerleri")
                    if (!pre) return hata(`Bu sunucuya tanımlanmış herhangi bir premium bulunmuyor :(`)
                    let s = pre.expiresTimestamp
                    if (!s) return int.reply({ content: `• Bu sunucudaki premium **ASLA** bitmeyecektir oleyy!! 🎉` }).catch(err => { })
                    let st = (s / 1000).toFixed(0)
                    return int.reply({ content: `• Bu sunucudaki premium **<t:${st}:F> - <t:${st}:R>** tarihinde sona erecektir\n• Yani __${Time.duration({ ms: s, toNow: true, skipZeros: true })}__ sonra bitecektir` }).catch(err => { })
                }
            }
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
