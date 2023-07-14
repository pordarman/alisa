const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
const rastgeleKod = require("../../rastgele kod")
module.exports = {
    name: "premium",
    aliases: ["premium", "pre"],
    cooldown: 3,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        let seçenekler = [
            `**• ${prefix}pre kullan <kod> =>** Bir yetkilinin verdiği premium kodu kullanmanızı sağlar`,
            `**• ${prefix}pre değiştir <guildId> =>** Bir sunucunun premium özelliklerini başka bir sunucuya aktarmayı sağlar`,
            `**• ${prefix}pre süre =>** Bu sunucunun kanal premium süresini gösterir`,
            `**• ${prefix}pre özellikler =>** Premium'a özel olan özellikleri görmenizi sağlar`,
            `**• ${prefix}pre fiyat =>** Premium'un fiyatlarını görmenizi sağlar`
        ]
            , ship = ayarlar.sahipler.includes(msg.author.id)
        if (ship) seçenekler.push(`\n**• ${prefix}pre oluştur <kişiId> =>** Etiketlediğiniz kişiye özel bir premium ekler`, `**• ${prefix}pre uzat <kod> =>** Girdiğiniz kodun premium süresini uzatır`, `**• ${prefix}pre sunucular =>** Premium alan ve almış olan bütün kişileri ve sunucuları gösterir`, `**• ${prefix}pre sil =>** Bir sunucunun premium'unu silersiniz`)
        if (!args[0]) return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
        switch (args[0]) {
            case "kullan":
            case "use": {
                let kod = args[1]
                    , dosya = db.buldosya("premium", "diğerleri")
                if (!kod) return hata(`Lütfen yetkililerden aldığınız premium komutu giriniz\n\n**Örnek**\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)}`)
                let kodVarMı = Object.entries(dosya).find(a => a[1].code == kod)
                if (!kodVarMı) return hata(`**${kod}** koduna karşılık gelen premium kodunu bulamadım!\n\n• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[destek sunucuma](${ayarlar.discord})__ gelip yetkililerden destek alabilirsiniz`)
                if (kodVarMı[1].author != msg.author.id) return hata(`Bu premium kodunu yalnızca satın alan kişi (<@${kodVarMı[1].author}>) kullanabilir`)
                if (kodVarMı[1].isUse) return hata(`**${kod}** koduna karşılık gelen premium kodunda zaten bir sunucu ( ${(await msg.client.getGuild(kodVarMı[0]))?.name || kodVarMı[0]} ) bulunuyor${kodVarMı[1].isDemo ? "" : `\n\n• Eğer premiumunuzu başka bir sunucuya aktarmak için **${prefix}pre değiştir** yazarak premiumunuzu başka bir sunucuya aktarabilirsiniz`}`)
                let guildId = args[2] || guild.id
                if (dosya[guildId]) return hata(`Şeyyy... ${await msg.client.getGuildNameOrId(guildId)} sunucuda zaten bir premium bulunuyor şapşik şey seni :(`)
                if (kodVarMı[1].isDemo) {
                    if (kodVarMı[1].guild == guildId) {
                        if (dosya.g.includes(guildId)) return hata(`${await msg.client.getGuildNameOrId(guildId)} sunucu daha önceden ${msg.client.user.username}'nın deneme sürümünü kullanmış :((`)
                    } else return hata(`Bu premium kodunu sadece **${(await msg.client.getGuild(kodVarMı[1].guild))?.name || `${kodVarMı[1].guild}** ID'ye sahip**`} **sunucu kullanabilir şapşik şey seni :(`)
                }
                let isFinite = kodVarMı[1].expiresTimestamp
                if (isFinite) {
                    Time.setTimeout(async () => {
                        let dosya = db.buldosya("premium", "diğerleri")
                            , veri = Object.entries(dosya).find(a => a[1].code == kod)
                        delete dosya[veri[0]]
                        dosya[veri[0] + " - " + Date.now()] = veri[1]
                        db.yazdosya(dosya, "premium", "diğerleri")
                        let sunucuAdı = (await msg.client.getGuild(veri[0]))?.name
                            , kisi = await msg.client.fetchUserForce(veri[1].author)
                        kisi.send(`• Heyy bakıyorum ki **${sunucuAdı || `${veri[0]}** ID'ye sahip**`} **sunucunun premiumu bitmiş gibi görünüyor :(\n\n• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n• ${ayarlar.discord}`).catch(err => { })
                            ; (await msg.client.fetchUserForce(ayarlar.sahip)).send(`**> PREMİUM BİLGİLENDİRME**\n\n• **${sunucuAdı || "❓ Bilinmeyen sunucu"} - (${veri[0]})** sunucunun premium'u bitmiştir.\n• **Satın alan kişi:** <@${kisi.id}> - ${kisi.tag}\n• **Kullandığı süre:** ${Time.duration(veri[1].totalTime)}`).catch(err => { })
                        let guildDatabase = msg.client.guildDatabase(veri[0])
                            , tagroldb = msg.client.tagrolDatabase(veri[0], guildDatabase.kayıt.tag)
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
                hata(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await msg.client.getGuildNameOrId(guildId)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "b")
                dosya[guildId] = { ...kodVarMı[1], expiresTimestamp: isFinite ? (Date.now() + isFinite) : undefined, isUse: true }
                delete dosya[kodVarMı[0]]
                dosya.g.push(guildId)
                db.yazdosya(dosya, "premium", "diğerleri")
                let dosyaDatabase = db.bul(guildId, "premium database", "diğerleri")
                if (dosyaDatabase) {
                    let guildDatabase = msg.client.guildDatabase(guildId)
                        , tagroldb = msg.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
                    guildDatabase.kayıt.yassinir = dosyaDatabase.kayıt.yassinir
                    
                    tagroldb.mesaje = dosyaDatabase.tagrol.mesaje
                    tagroldb.mesajk = dosyaDatabase.tagrol.mesajk
                    tagroldb.dmesaje = dosyaDatabase.tagrol.dmesaje
                    tagroldb.dmesajk = dosyaDatabase.tagrol.dmesajk
                    db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                    db.yazdosya(guildDatabase, guildId)
                    db.sil(guildId, "premium database", "diğerleri")
                }
                return;
            }
            case "değiştir":
            case "değiş": {
                let kod = args[1]
                    , dosya = db.buldosya("premium", "diğerleri")
                if (!kod) return hata(`Lütfen yetkililerden aldığınız premium komutu giriniz\n\n**Örnek**\n• ${prefix}pre değiştir ${rastgeleKod(8, dosya)} <guildId>`)
                let kodVarMı = Object.entries(dosya).find(a => a[1].code == kod)
                if (!kodVarMı) return hata(`**${kod}** koduna karşılık gelen premium kodunu bulamadım!\n\n• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[destek sunucuma](${ayarlar.discord})__ gelip yetkililerden destek alabilirsiniz`)
                if (kodVarMı[1].author != msg.author.id) return hata(`Bu premium kodunu yalnızca satın alan kişi (<@${kodVarMı[1].author}>) kullanabilir`)
                if (isNaN(+kodVarMı[0])) return hata(`**${kod}** koduna karşılık gelen premium kodunda zaten herhangi bir sunucu tanımlanmamış!\n\n• Eğer premium kodunu kullanmak isterseniz **${prefix}pre kullan <kod> <guildId>** şeklinde yazabilirsiniz\n\n**Örnek**\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)}\n\n• ${prefix}pre kullan ${rastgeleKod(8, dosya)} ${guildId}`)
                if (kodVarMı[1].isDemo) return hata(`Premium deneme sürümünü başka bir sunucuya aktaramazsın şapşik şey seni :((`)
                let guildId = args[2]
                if (!guildId) return hata("Lütfen premium özelliğini aktaracağınız sunucunun ID'sini giriniz")
                if (kodVarMı[0] == guildId) return hata(`Girdiğiniz premium kodu zaten ${await msg.client.getGuildNameOrId(guildId)} sunucuda kullanılıyor`)
                if (dosya[guildId]) return hata(`Şeyyy... **${(await msg.client.getGuild(kodVarMı[1].guild))?.name || `${kodVarMı[1].guild}** ID'ye sahip**`} **sunucuda zaten bir premium bulunuyor şapşik şey seni :(`)
                hata(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await msg.client.getGuildNameOrId(guildId)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "b")
                dosya[guildId] = { ...kodVarMı[1], isUse: true }
                delete dosya[kodVarMı[0]]
                dosya.g.push(guildId)
                let guildDatabase = msg.client.guildDatabase(kodVarMı[0])
                    , tagroldb = msg.client.tagrolDatabase(kodVarMı[0], guildDatabase.kayıt.tag)
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
                    let guildDatabase = msg.client.guildDatabase(guildId)
                        , tagroldb = msg.client.tagrolDatabase(guildId, guildDatabase.kayıt.tag)
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
                return;
            }
            case "kalansüre":
            case "süre":
            case "zaman": {
                if (!pre) return hata(`Bu sunucuya tanımlanmış herhangi bir premium bulunmuyor :(`)
                let s = pre.expiresTimestamp
                if (!s) return msg.reply({ content: `• Bu sunucudaki premium **ASLA** bitmeyecektir oleyy!! 🎉` }).catch(err => { })
                let st = (s / 1000).toFixed(0)
                return msg.reply({ content: `• Bu sunucudaki premium **<t:${st}:F> - <t:${st}:R>** tarihinde sona erecektir\n• Yani __${Time.duration({ ms: s, toNow: true, skipZeros: true })}__ sonra bitecektir` }).catch(err => { })
            }
            case "özellikler":
            case "özellik": {
                let pp = msg.client.user.displayAvatarURL()
                return msg.reply({ embeds: [new EmbedBuilder().setAuthor({ name: msg.client.user.username, iconURL: pp }).setDescription(`• *Botun premium sistemi özellikleri*`).setColor("#9e02e2").setTimestamp().setThumbnail(pp)] }).catch(err => { })
            }
            case "fiyat":
            case "fiyatlandırma": {
                let pp = msg.client.user.displayAvatarURL()
                return msg.reply({ embeds: [new EmbedBuilder().setAuthor({ name: msg.client.user.username, iconURL: pp }).setDescription(`• *Botun premium fiyatlandırma bilgileri*`).setColor("#9e02e2").setTimestamp().setThumbnail(pp)] }).catch(err => { })
            }
            case "oluştur":
            case "ekle": {
                if (!ship) return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
                let kişi = msg.mentions.users.first() || await msg.client.fetchUser(args.join(" "))
                if (!kişi) return hata("Lütfen bir kişiyi etiketleyiniz veya ID'sini giriniz")
                if (kişi.bot) return hata(`B-botlara premium vermeyi nasıl düşünüyorsun??`)
                let zaman = Time.durationToMs(args.join(" "))
                if (!zaman) {
                    if (args.includes("sınırsız")) zaman = undefined
                    else return hata(`Lütfen bir premium süresi giriniz\n\n**Örnek**\n• ${prefix}pre oluştur <@${kişi.id}> 1 ay\n• ${prefix}pre oluştur <@${kişi.id}> 25 gün 10 dakika 5 saniye\n• ${prefix}pre oluştur <@${kişi.id}> sınırsız`)
                }
                let pre = db.buldosya("premium", "diğerleri")
                    , kod = rastgeleKod(8, pre)
                    , isim = "kullanılmamış - " + Date.now()
                    , object = { author: kişi.id, expiresTimestamp: zaman, totalTime: zaman, code: kod }
                pre[isim] = object
                db.yazdosya(pre, "premium", "diğerleri")
                let kisiyeGonderildiMi = true
                    , gelistiriciyeGonderildiMi = true
                await kişi.send(`• Pişt pişşttt duydum ki premium'u almışsııınnn!!! Sana ne kadar teşekkür etsem azdır...\n\n• ||${kod}|| al bakalım premiumu aktif etmen için gerekli kodu gönderdim bunu istediğin sunucuya gidip **.pre kullan ||${kod}||** şeklinde yazıp o sunucuya __çok avantajlı özellikler__ verebilirsiiinn!!\n\n• Ve eğer premiumunu __başka bir sunucuya aktarmak__ isterseniz **.pre değiştir ||${kod}|| ${msg.guildId}** şeklinde yazıp premiumunu **her yerde** kullanabirsiinn!!\n\n• Ve en önemlisi *seni seviyorum* 💗`).catch(async err => {
                    kisiyeGonderildiMi = false
                    await msg.member.send(`• <@${kişi.id}> adlı kişiye mesaj atamadım o yüzden onun kodunu sana gönderiyorum. Lütfen sana gönderdiğim premium kodunu <@${kişi.id}> adlı kişiye vermeyi sakın unutma\n• **Kod:**  ${kod}`).catch(async err => {
                        gelistiriciyeGonderildiMi = false
                            ; (await msg.client.fetchUserForce(ayarlar.sahip)).send(`• Hem premiumu alan kişiye hem de komutu kullanan yetkiye mesaj atamadım!\n• Şimdi sana atacağım premium kodunu <@${kişi.id}> - **${kişi.tag}** adlı kişiye vermeyi unutma\n• **Kod:**  ${kod}`)
                    })
                })
                return hata(`<@${kişi.id}> adlı kişiye özel premium kodu başarıyla oluşturuldu${kisiyeGonderildiMi ? " ve ona özel mesajdan premium kodunu ve nasıl kullanması gerektiğini anlattım!" : " ama DM'si açık olmadığı için nasıl kullanılacağını anlatamadım :("}${gelistiriciyeGonderildiMi ? "" : `\n\n• Ve <@${msg.member.id}> lütfen botun sana mesaj gönderebilmesi için DM mesajlarını açık tut!`}`, "b")
            }
            case "uzat":
            case "süreekle": {
                if (!ship) return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
                let kod = args[1]
                if (!kod) return hata(`Lütfen bir premium kodu giriniz`)
                let dosya = db.buldosya("premium", "diğerleri")
                let kodVarMı = Object.entries(dosya).find(a => a[1].code == kod)
                if (!kodVarMı) return hata(`**${kod}** koduna karşılık gelen premium kodunu bulamadım!`)
                let zaman = Time.durationToMs(args.join(" "))
                if (!zaman) {
                    if (args.includes("sınırsız")) zaman = undefined
                    else return hata(`Lütfen bir uzacağınız süreyi giriniz\n\n**Örnek**\n• ${prefix}pre uzat ${kod} 1 ay\n• ${prefix}pre uzat ${kod} 25 gün 10 dakika 5 saniye\n• ${prefix}pre uzat ${kod} sınırsız`)
                }
                dosya[kodVarMı[0]] = { ...kodVarMı[1], expiresTimestamp: zaman ? kodVarMı[1].expiresTimestamp + zaman : undefined, totalTime: zaman ? kodVarMı[1].totalTime + zaman : undefined }
                hata(`**${kod}** adlı kodun süresi **${zaman ? Time.duration({ ms: zaman, skipZeros: true }) : "sınırsız"}** uzatılmıştır`, "b")
                db.yaz(kodVarMı[0], { ...kodVarMı[1], expiresTimestamp: zaman ? kodVarMı[1].expiresTimestamp + zaman : undefined, totalTime: zaman ? kodVarMı[1].totalTime + zaman : undefined }, "premium", "diğerleri")
                return;
            }
            case "sil":
            case "kaldır": {
                if (!ship) return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
                let ar = args[1]
                if (!ar) return hata(`Lütfen bir sunucu ID'si veya premium kodu giriniz`)
                let dosya = db.buldosya("premium", "diğerleri")
                let sunucuPre = dosya[ar]
                    , id
                if (sunucuPre) id = ar
                else {
                    sunucuPre = Object.entries(dosya).find(a => a[1].code == ar)
                    if (sunucuPre) id = sunucuPre[0]
                    else return hata(`**${ar}** koduna veya ID'ye karşılık gelen premium kodunu bulamadım!`)
                }
                hata(`Girdiğiniz **${ar}** koduna veya ID'ye gelen premium kodu başarıyla silinmiştir`, "b")
                delete dosya[id]
                db.yazdosya(dosya, "premium", "diğerleri")
                return;
            }
            case "sunucu":
            case "sunucular": {
                if (!ship) return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
                let dosya = db.buldosya("premium", "diğerleri")
                    , object = Object.entries(dosya)
                    , active = object.filter(a => a[0] != "g" && a[0].search(/\d+ - \d+/) == -1).sort((a, b) => (b[1].expiresTimestamp || 9999999999999) - (a[1].expiresTimestamp || 9999999999999)).map((a, i) => `• ${ayarlar.emoji.p} \`${a[1].code}\` **=> ${a[1].isUse ? "Aktif" : "Aktif değil"}** | ${a[1].totalTime ? Time.duration({ ms: a[1].totalTime, format: "<M> ay, <d> gün, <h> saat, <m> dk", skipZeros: true }) : "__**Sınırsız**__"} | <@${a[1].author}>${a[1].expiresTimestamp && a[1].isUse ? ` | %${((1 - (a[1].expiresTimestamp - Date.now()) / a[1].totalTime) * 100).toFixed(2)} tamamlandı` : ""}`)
                    , notActive = object.filter(a => a[0] != "g" && a[0].search(/\d+ - \d+/) != -1).sort((a, b) => (b[1].expiresTimestamp || 9999999999999) - (a[1].expiresTimestamp || 9999999999999)).map((a, i) => `• ${ayarlar.emoji.np} \`${a[1].code}\` **=> Süresi bitmiş** | ${a[1].totalTime ? Time.duration({ ms: a[1].totalTime, format: "<M> ay, <d> gün, <h> saat, <m> dk", skipZeros: true }) : "__**Sınırsız**__"} | <@${a[1].author}>`)
                    , array = [...active, ...notActive]
                    , sayfa = Math.ceil(array.length / 5)
                    , pp = msg.client.user.displayAvatarURL()
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: `${msg.client.user.username} premium`, iconURL: pp })
                        .setDescription(`**• Toplamda __${array.length}__ premium kodu bulunuyor**\n\n${array.slice(0, 5).join("\n\n") || "• Burada gösterilecek hiçbir şey yok..."}`)
                        .setColor("DarkPurple")
                        .setTimestamp()
                        .setThumbnail(pp)
                        .setFooter({ text: `Sayfa 1/${sayfa}` })
                if (sayfa == 1) return msg.reply({ embeds: [embed] }).catch(err => { })
                embed.setDescription(`**• Toplamda __${array.length}__ premium kodu bulunuyor**\n\n${array.slice(0, 5).join("\n\n")}`).setFooter({ text: `Sayfa 1/${sayfa}` })
                const düğmesağ = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagok)
                    .setCustomId("NOT_sağok")
                const düğmesil = new ButtonBuilder()
                    .setStyle(4)
                    .setEmoji(ayarlar.emoji.sil)
                    .setCustomId("NOT_sil")
                const düğmesol = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solok)
                    .setCustomId("NOT_solok")
                    .setDisabled(true)
                const düğmesaghizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.sagokhizli)
                    .setCustomId("NOT_saghizli")
                const düğmesolhizli = new ButtonBuilder()
                    .setStyle(1)
                    .setEmoji(ayarlar.emoji.solokhizli)
                    .setCustomId("NOT_solhizli")
                    .setDisabled(true)
                const düğme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                return msg.reply({ embeds: [embed], components: [düğme] }).then(a => {
                    const filter = i => ["NOT_sağok", "NOT_solok", "NOT_sil", "NOT_saghizli", "NOT_solhizli"].includes(i.customId) && i.user.id === msg.author.id
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
                            const düğmeeditleme2 = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                            embed.setDescription(`**• Toplamda __${array.length}__ premium kodu bulunuyor**\n\n${array.slice((sayfasayısı * 5 - 5), (sayfasayısı * 5)).join("\n\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            a.edit({ embeds: [embed], components: [düğmeeditleme2] }).catch(err => { })
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
                            const düğmeeditleme = new ActionRowBuilder().addComponents(düğmesolhizli).addComponents(düğmesol).addComponents(düğmesil).addComponents(düğmesağ).addComponents(düğmesaghizli)
                            embed.setDescription(`**• Toplamda __${array.length}__ premium kodu bulunuyor**\n\n${array.slice((sayfasayısı * 5 - 5), (sayfasayısı * 5)).join("\n\n")}`).setFooter({ text: `Sayfa ${sayfasayısı}/${sayfa}` })
                            a.edit({ embeds: [embed], components: [düğmeeditleme] }).catch(err => { })
                        }
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
                }).catch(() => { })
            }
            default:
                return hata(`Lütfen bir seçenek giriniz\n\n**🗒️ Girilebilir seçenekler**\n${seçenekler.join("\n")}`, "h", 30000)
        }
    }
}
