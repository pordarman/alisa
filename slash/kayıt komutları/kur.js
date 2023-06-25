const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "kur",
    data: new SlashCommandBuilder()
        .setName("kur")
        .setDescription("Tüm kayıt sistemini tek bir komutla kurmanızı sağlar"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
    */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            if (db.bul(guildId, "kur", "diğerleri")) return hata("**Kayıt kur işlemi devam ederken tekrar kayıt kur işlemini başlatamazsın!!**").catch(err => { })
            if (!int.guild.members.me.permissions.has('Administrator')) return hata(`Yönetici`, "yetkibot")

            let yazılacakguildDatabase = { isimler: {} }
                , filter = m => m.author.id === int.user.id
                , sure = 0
                , channel = int.channel
                , maxError = 8
                , m = {
                    i: `❗ İşlem iptal edilmiştir`,
                    mdy: (kalanDenemeHakki) => `‼️ Lütfen soruları düzgün cevaplayınız - __*( **${kalanDenemeHakki}** adet hakkınız kaldı )*__\n`,
                    kd: `${ayarlar.emoji.np} Etiketlediğiniz kanal bir yazı kanalı değil. Lütfen bir yazı kanalı etiketleyiniz veya kanalın ID'sini giriniz`,
                    brd: `${ayarlar.emoji.np} Botların oluşturduğu rolleri başkalarına veremem. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    kuv: `${ayarlar.emoji.np} Etiketlediğiniz rollerden birisi bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    ukedyr: `${ayarlar.emoji.np} Etiketlediğiniz rol bu sunucudaki üyeleri kayıt eden yetkili rolü. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    fr: `${ayarlar.emoji.np} Hey hey heyyy, sence de biraz fazla rol etiketlemedin mi? Lütfen daha az rol etiketleyip tekrar deneyiniz`,
                    rby: `${ayarlar.emoji.np} Etiketlediğiniz rollerden birisi bu sunucudaki üyeleri kayıt eden yetkili rolü. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    rbk: `${ayarlar.emoji.np} Etiketlediğiniz rollerden birisi bu sunucudaki kayıtsız üyelere verilecek olan rol. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    th: `${ayarlar.emoji.np} Tag uzunluğunuz 10'dan büyük olamaz. Lütfen daha kısa bir tag giriniz`,
                    sh: `${ayarlar.emoji.np} Sembol uzunluğunuz 3'ten büyük olamaz. Lütfen daha kısa bir sembol giriniz`,
                    ry: (id, m) => `${ayarlar.emoji.np} **<@&${id}>** adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${m.guild.members.me.roles.botRole?.toString() || m.guild.members.me.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    bry: (idler, m) => `${ayarlar.emoji.np} [${idler.map(a => `<@&${a}>`).join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${m.guild.members.me.roles.botRole?.toString() || m.guild.members.me.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`,
                    k: `${ayarlar.emoji.kanal} Kayıtlar hangi kanalda yapılacak. Lütfen kanalı etiketleyiniz veya kanalın ID'sini giriniz`,
                    g: `${ayarlar.emoji.kanal} Kayıt günlük kanalı hangi kanal olacak. Günlük kanalının sohbet kanalı olması önerilir. Eğer kayıt günlük kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen kanalı etiketleyiniz veya kanalın ID'sini giriniz`,
                    l: `${ayarlar.emoji.kanal} Kayıt log kanalı hangi kanal olacak. Eğer kayıt log kanalını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen kanalı etiketleyiniz veya kanalın ID'sini giriniz`,
                    y: `${ayarlar.emoji.rol} Üyeleri kayıt eden yetkili rolü hangi rol olacak. Lütfen rolü etiketleyiniz veya rolün ID'sini giriniz veya rolün ID'sini giriniz`,
                    kyt: `${ayarlar.emoji.rol} Üyeleri kayıt ettikten sonra hangi rol alınacak veya sunucuya katılınca ona hangi rolü vereceğim. Kısaca kayıtsız rolü ne olacak. Lütfen rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    s: `❓ Kayıt seçeneğiniz **Normal** mi yoksa **Cinsiyet** mi olacak?`,
                    u: `${ayarlar.emoji.uye} Üyelere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz veya rol(lerin) ID'sini giriniz`,
                    kiz: `${ayarlar.emoji.kiz} Kızlara hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz veya rol(lerin) ID'sini giriniz`,
                    erkek: `${ayarlar.emoji.erkek} Erkeklere hangi rol(ler) verilecek. Lütfen rol(leri) etiketleyiniz veya rol(lerin) ID'sini giriniz`,
                    bot: `🤖 Botlara hangi rol(ler) verilecek. Eğer ayarlamak istemiyorsanız \`geç\` yazabilirsiniz. Lütfen rol(leri) etiketleyiniz veya rol(lerin) ID'sini giriniz`,
                    tag: (tag) => `📝 İsimlerin başına koyulacak tag ne olsun. Eğer tag ayarlamak istemiyorsanız \`geç\` yazabilirsiniz.\n• Eğer tagı **♫** olarak ayarladıysanız şöyle gözükecek **${tag}**`,
                    evr: (idler) => `${ayarlar.emoji.np} Etiketlediğiniz [${idler.map(a => `<@&${a}>`).join(" | ")}] rol(ler) bu sunucudaki erkeklere verilecek olan rol. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    kvr: (idler) => `${ayarlar.emoji.np} Etiketlediğiniz [${idler.map(a => `<@&${a}>`).join(" | ")}] rol(ler) bu sunucudaki kızlara verilecek olan rol. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    uvr: (idler) => `${ayarlar.emoji.np} Etiketlediğiniz [${idler.map(a => `<@&${a}>`).join(" | ")}] rol(ler) bu sunucudaki üyelere verilecek olan rol. Lütfen başka bir rolü etiketleyiniz veya rolün ID'sini giriniz`,
                    sembol: (isim) => `📝 İsimlerin arasına koyulacak sembol ne olsun. Eğer sembol ayarlamak istemiyorsanız \`geç\` yazabilirsiniz.\n‼️ Semboller botların isimlerine koyulmayacaktır \n• Eğer sembolü **|** olarak ayarladıysanız şöyle gözükecek **${isim}**`,
                    oto: (otoisim) => `📝 Birisi sunucuya girince onun kullanıcı adı ne olsun. Eğer kullanıcı adını ayarlamak istemiyorsanız \`geç\` yazabilirsiniz.\n‼️ Oto isim botların isimlerine koyulmayacaktır\n• Eğer oto ismi **<tag> Kayıtsız** olarak ayarladıysanız şöyle gözükecek **${otoisim}**`,

                    rolBul: (awaitMsg) => awaitMsg && (awaitMsg.mentions.roles.first() || awaitMsg.guild.roles.cache.get(awaitMsg.content.replace(/<@&|>/g, "").trim())),
                    rolBulMulti: (awaitMsg) => {
                        if (!awaitMsg) return undefined
                        if (awaitMsg.mentions.roles.size) return awaitMsg.mentions.roles
                        let split = awaitMsg.content.match(/\d{17,19}/g)
                        return awaitMsg.guild.roles.cache.filter(a => split.includes(a.id))
                    },
                    kanalBul: (awaitMsg) => awaitMsg && (awaitMsg.mentions.channels.first() || awaitMsg.guild.channels.cache.get(awaitMsg.content.replace(/<#|>/g, "").trim()))
                }
            async function mesajlar(yazı, funcMsg) {
                funcMsg.reply({ content: yazı, allowedMentions: { roles: false, repliedUser: true } }).catch(() => { })
            }
            function süre(func, yazı, mesajId, funcMsg) {
                sure += 1
                if (sure == maxError) {
                    db.sil(guildId, "kur", "diğerleri")
                    mesajlar(m.i, funcMsg).catch(() => { })
                } else {
                    mesajlar(m.mdy(maxError - sure) + yazı, funcMsg).catch(() => { })
                    func(mesajId, funcMsg)
                }
            }
            async function son(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 11, date: Date.now() }, "kur", "diğerleri")
                guildDatabase.kayıt = { ...guildDatabase.kayıt, ...yazılacakguildDatabase };
                ["günlük", "log", "bot", "tag", "sembol", "secenek"].filter(a => !yazılacakguildDatabase[a]).forEach(id => delete guildDatabase.kayıt[id])
                if (!yazılacakguildDatabase.isimler.giris) delete guildDatabase.kayıt.isimler.giris
                if (yazılacakguildDatabase.secenek) {
                    delete guildDatabase.kayıt.erkek
                    delete guildDatabase.kayıt.kız
                    int.client.secenek.add(guildId)
                } else {
                    delete guildDatabase.kayıt.normal
                    int.client.secenek.delete(guildId)
                }
                let tagroldb = int.client.tagrolDatabase(guildId)
                    , özel = guildDatabase.kayıt.özel ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
                    , gözel = guildDatabase.kayıt.gözel ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
                    , discordlogo = guild.iconURL()
                    , ayar = guildDatabase.kayıt.ayar ? `Kayıt yapamazsınız ${ayarlar.emoji.kapali}` : `Kayıt yapabilirsiniz ${ayarlar.emoji.acik}`
                    , bototo = guildDatabase.kayıt.bototo ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                    , otoduzeltme = guildDatabase.kayıt.otoduzeltme ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                    , yaszorunlu = guildDatabase.kayıt.yaszorunlu ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
                    , seçenek
                    , yazıı
                    , kayıtisim
                    , kayıtisimler = guildDatabase.kayıt.isimler.kayıt
                tagroldb.tag = yazılacakguildDatabase.tag?.slice(0, -1)
                if (yazılacakguildDatabase.secenek) {
                    seçenek = "Normal kayıt 👤"
                    yazıı = `**• Üyelere verilecek olan rol(ler):**  ${yazılacakguildDatabase.normal.map(a => "<@&" + a + ">").join(" | ")}`
                } else {
                    seçenek = "Cinsiyete göre kayıt 👫"
                    yazıı = `**• Erkeklere verilecek olan rol(ler):**  ${yazılacakguildDatabase.erkek.map(a => "<@&" + a + ">").join(" | ")}\n**• Kızlara verilecek olan rol(ler):**  ${yazılacakguildDatabase.kız.map(a => "<@&" + a + ">").join(" | ")}`
                }
                if (kayıtisimler) kayıtisim = kayıtisimler.replace(/<tag>/g, tagroldb.tag || "").replace(/<isim>/g, "Ali " + (yazılacakguildDatabase.sembol || "") + "İhsan").replace(/<yaş>/g, "19")
                else kayıtisim = `${yazılacakguildDatabase.tag || ""}Ali ${yazılacakguildDatabase.sembol || ""}19`
                const embed = new EmbedBuilder()
                    .setAuthor({ name: guild.name, iconURL: discordlogo })
                    .setThumbnail(discordlogo)
                    .setDescription('**• Kayıt ayarım:**  ' + ayar + '\n**• Kayıt türü:**  ' + seçenek)
                    .addFields(
                        {
                            name: `${ayarlar.emoji.rol} ROLLER`,
                            value: [
                                yazıı,
                                `**• Botlara verilecek olan rol(ler):**  ${yazılacakguildDatabase.bot?.map(a => "<@&" + a + ">")?.join(" | ") || "Rol ayarlanmamış ❗"}`,
                                `**• Üyeleri kayıt eden yetkili:**  <@&${yazılacakguildDatabase.yetkili}>`,
                                `**• Üyeleri kayıt ettikten sonra alınacak rol:**  <@&${yazılacakguildDatabase.kayıtsız}>`
                            ].join("\n")
                        },
                        {
                            name: `${ayarlar.emoji.kanal} KANALLAR`,
                            value: [
                                `**• Kayıt kanalı:**  <#${yazılacakguildDatabase.kanal}>`,
                                `**• Kayıt günlük kanalı:**  ${yazılacakguildDatabase.günlük ? `<#${yazılacakguildDatabase.günlük}>` : "Kanal ayarlanmamış ❗"}`,
                                `**• Kayıt log kanalı:**  ${yazılacakguildDatabase.log ? `<#${yazılacakguildDatabase.log}>` : "Kanal ayarlanmamış ❗"}`
                            ].join("\n")
                        },
                        {
                            name: '✏️ DİĞERLERİ',
                            value: [
                                `**• Sunucuya özel tag:**  ${yazılacakguildDatabase.tag || "Tag ayarlanmamış ❗"}`,
                                `**• İsimlerin arasına koyulacak sembol:**  ${yazılacakguildDatabase.sembol || "Sembol ayarlanmamış ❗"}`,
                                `**• Botları otomatik kayıt etme:**  ${bototo}`,
                                `**• İsimleri otomatik düzeltme:**  ${otoduzeltme}`,
                                `**• Yaş zorunluluğu:**  ${yaszorunlu}`,
                                `**• Özelleştirilmiş mesaj:**  ${özel}`,
                                `**• Özelleştirilmiş günlük mesajı:**  ${gözel}`,
                                `**• Oto isim:**  ${yazılacakguildDatabase.isimler.giris ? yazılacakguildDatabase.isimler.giris.replace(/<tag>/g, tagroldb.tag || "").replace(/<isim>/g, int.user.username) : "Ayarlanmamış ❗"}`,
                                `\n**Birisini kayıt ettikten sonra şöyle gözükecek**\n└> ${kayıtisim}`
                            ].join("\n")
                        })
                    .setColor('Blue')
                    .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: int.client.user.displayAvatarURL() })
                    .setTimestamp()
                funcMsg.reply({ content: `• Kayıt sistemini test etmek için **${guildDatabase.prefix || ayarlar.prefix}test** yazabilirsiniz!`, embeds: [embed] }).catch(() => { })
                db.yazdosya(guildDatabase, guildId)
                db.yaz(guildId, tagroldb, "tag rol", "diğerleri")
                db.sil(guildId, "kur", "diğerleri")
            }
            async function otoisim(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 10, date: Date.now() }, "kur", "diğerleri")
                let tag = yazılacakguildDatabase.tag
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            let sisim
                                , tag = yazılacakguildDatabase.tag
                            if (guildDatabase.kayıt.isimler.kayıt) sisim = guildDatabase.kayıt.isimler.kayıt.replace(/<tag>/g, tag || "").replace(/<isim>/g, "Ali | İhsan").replace(/<yaş>/, "19")
                            else sisim = `${tag || ""}Ali | 19`
                            mesajlar(m.sembol(sisim), mesaj)
                            return await sembol(mesaj.id, mesaj)
                        case "geç":
                            delete guildDatabase.kayıt.isimler.giris
                            return await son(mesaj.id, mesaj)
                        default:
                            yazılacakguildDatabase.isimler.giris = mesaj.content
                            return await son(mesaj.id, mesaj)
                    }
                }).catch(err => {
                    süre(otoisim, m.oto(`${tag || ""}Kayıtsız`, mesajId, funcMsg))
                })
            }
            async function sembol(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 9, date: Date.now() }, "kur", "diğerleri")
                let tagg = yazılacakguildDatabase.tag
                    , isim
                if (guildDatabase.kayıt.isimler.kayıt) isim = guildDatabase.kayıt.isimler.kayıt.replace(/<tag>/g, (tagg ? tagg.slice(0, -1) : "")).replace(/<isim>/g, "Ali | İhsan").replace(/<yaş>/, "19")
                else isim = `${tagg || ""}Ali | 19`
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.tag("♫ Ali 19"), mesaj)
                            return await tag(mesajId, mesaj)
                        case "geç":
                            delete yazılacakguildDatabase.sembol
                            mesajlar(m.oto(`${tagg || ""}Kayıtsız`), mesaj)
                            return await otoisim(mesaj.id, mesaj)
                    }
                    if (mesaj.content.length > 3) return süre(sembol, m.sg, mesajId, mesaj)
                    else if (mesaj.content.length) {
                        yazılacakguildDatabase.sembol = mesaj.content + " "
                        mesajlar(m.oto(`${tagg || ""}Kayıtsız`), mesaj)
                        return await otoisim(mesaj.id, mesaj)
                    } else return süre(sembol, m.sembol(isim), mesajId, mesaj)
                }).catch(() => süre(sembol, m.sembol(isim), mesajId, funcMsg))
            }
            async function tag(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 8, date: Date.now() }, "kur", "diğerleri")
                let isim
                if (guildDatabase.kayıt.isimler.kayıt) isim = guildDatabase.kayıt.isimler.kayıt.replace(/<tag>/g, "♫").replace(/<isim>/g, "Ali İhsan").replace(/<yaş>/, "19")
                else isim = `"♫" Ali | 19`
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.bot, mesaj)
                            return await bot(mesajId, mesaj)
                        case "geç":
                            delete yazılacakguildDatabase.tag
                            let sisim
                            if (guildDatabase.kayıt.isimler.kayıt) sisim = guildDatabase.kayıt.isimler.kayıt.replace(/<tag>/g, "").replace(/<isim>/g, "Ali | İhsan").replace(/<yaş>/, "19")
                            else sisim = `Ali | 19`
                            mesajlar(m.sembol(sisim), mesaj)
                            return await sembol(mesaj.id, mesaj)
                    }
                    if (mesaj.content.length > 10) return süre(tag, m.th, mesajId, mesaj)
                    else if (mesaj.content.length) {
                        yazılacakguildDatabase.tag = mesaj.content + " "
                        let sisim
                        if (guildDatabase.kayıt.isimler.kayıt) sisim = guildDatabase.kayıt.isimler.kayıt.replace(/<tag>/g, mesaj.content).replace(/<isim>/g, "Ali | İhsan").replace(/<yaş>/, "19")
                        else sisim = `${yazılacakguildDatabase.tag}Ali | 19`
                        mesajlar(m.sembol(sisim), mesaj)
                        return await sembol(mesaj.id, mesaj)
                    } else return süre(tag, m.tag(isim), mesajId, mesaj)
                }).catch(() => süre(tag, m.tag(isim), mesajId, funcMsg))
            }
            async function bot(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 7, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            if (yazılacakguildDatabase.secenek) {
                                mesajlar(m.u, mesaj)
                                return await normal(mesajId, mesaj)
                            } else {
                                mesajlar(m.erkek, mesaj)
                                return await erkek(mesajId, mesaj)
                            }
                        case "geç":
                            delete yazılacakguildDatabase.bot
                            mesajlar(m.tag("♫ Ali 19"), mesaj)
                            return await tag(mesajId, mesaj)
                    }
                    let rol = m.rolBulMulti(mesaj)
                    if (rol.some(a => a.managed == true)) return süre(bot, m.brd, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.kayıtsız)) return süre(bot, m.kuv, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.yetkili)) return süre(bot, m.ukedyr, mesajId, mesaj)
                    let erkekrolvar = rol.filter(a => yazılacakguildDatabase.erkek?.includes(a.id))
                    if (erkekrolvar.size) return süre(bot, m.evr(erkekrolvar.map(a => a.id)), mesajId, mesaj)
                    let kızrolvar = rol.filter(a => yazılacakguildDatabase.kız?.includes(a.id))
                    if (kızrolvar.size) return süre(bot, m.kvr(kızrolvar.map(a => a.id)), mesajId, mesaj)
                    let uyerolvar = rol.filter(a => yazılacakguildDatabase.normal?.includes(a.id))
                    if (uyerolvar.size) return süre(bot, m.uvr(uyerolvar.map(a => a.id)), mesajId, mesaj)
                    if (rol.size > 5) return süre(bot, m.fr, mesajId, mesaj)
                    let yuksekroluyarı = rol.filter(a => a.position >= mesaj.guild.members.me.roles.highest.position)
                    if (yuksekroluyarı.size) return süre(bot, m.bry(rol.map(a => a.id), mesaj), mesajId, mesaj)
                    if (rol.size) {
                        yazılacakguildDatabase.bot = rol.map(a => a.id)
                        mesajlar(m.tag("♫ Ali 19"), mesaj)
                        return await tag(mesajId, mesaj)
                    } else return süre(bot, m.bot, mesajId, mesaj)
                }).catch(err => süre(bot, m.bot, mesajId, funcMsg))
            }
            async function erkek(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 6, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.kiz, mesaj)
                            return await kız(mesajId, mesaj)
                    }
                    let rol = m.rolBulMulti(mesaj)
                    if (rol.some(a => a.managed == true)) return süre(erkek, m.brd, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.kayıtsız)) return süre(erkek, m.kuv, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.yetkili)) return süre(erkek, m.ukedyr, mesajId, mesaj)
                    if (rol.size > 5) return süre(erkek, m.fr, mesajId, mesaj)
                    let yuksekroluyarı = rol.filter(a => a.position >= mesaj.guild.members.me.roles.highest.position)
                    if (yuksekroluyarı.size) return süre(erkek, m.bry(rol.map(a => a.id), mesaj), mesajId, mesaj)
                    if (rol.size) {
                        yazılacakguildDatabase.erkek = rol.map(a => a.id)
                        mesajlar(m.bot, mesaj)
                        return await bot(mesajId, mesaj)
                    } else return süre(erkek, m.erkek, mesajId, mesaj)
                }).catch(() => süre(erkek, m.erkek, mesajId, funcMsg))
            }
            async function kız(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 5, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.s, mesaj)
                            return await seçenek(mesajId, mesaj)
                    }
                    let rol = m.rolBulMulti(mesaj)
                    if (rol.some(a => a.managed == true)) return süre(normal, m.brd, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.kayıtsız)) return süre(kız, m.kuv, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.yetkili)) return süre(kız, m.ukedyr, mesajId, mesaj)
                    if (rol.size > 5) return süre(kız, m.fr, mesajId, mesaj)
                    let yuksekroluyarı = rol.filter(a => a.position >= mesaj.guild.members.me.roles.highest.position)
                    if (yuksekroluyarı.size) return süre(kız, m.bry(rol.map(a => a.id), mesaj), mesajId, mesaj)
                    if (rol.size) {
                        yazılacakguildDatabase.kız = rol.map(a => a.id)
                        mesajlar(m.erkek, mesaj)
                        return await erkek(mesajId, mesaj)
                    } else return süre(kız, m.kiz, mesajId, mesaj)
                }).catch(err => süre(kız, m.kiz, mesajId, funcMsg))
            }
            async function normal(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 50, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.s, mesaj)
                            return await seçenek(mesajId, mesaj)
                    }
                    let rol = m.rolBulMulti(mesaj)
                    if (rol.some(a => a.managed == true)) return süre(normal, m.brd, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.kayıtsız)) return süre(normal, m.rbk, mesajId, mesaj)
                    if (rol.some(a => a.id == yazılacakguildDatabase.yetkili)) return süre(normal, m.rby, mesajId, mesaj)
                    if (rol.size > 5) return süre(normal, m.fr, mesajId, mesaj)
                    let yuksekroluyarı = rol.filter(a => a.position >= mesaj.guild.members.me.roles.highest.position)
                    if (yuksekroluyarı.size) return süre(normal, m.bry(rol.map(a => a.id), mesaj), mesajId, mesaj)
                    if (rol.size) {
                        yazılacakguildDatabase.normal = rol.map(a => a.id)
                        mesajlar(m.bot, mesaj)
                        return await bot(mesajId, mesaj)
                    } else return süre(normal, m.u, mesajId, mesaj)
                }).catch(() => süre(normal, m.u, mesajId, funcMsg))
            }
            async function seçenek(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 4, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "cinsiyet":
                        case "cin":
                        case "c":
                            delete yazılacakguildDatabase.secenek
                            mesajlar(m.kiz, mesaj)
                            return await kız(mesajId, mesaj)
                        case "normal":
                        case "nor":
                        case "n":
                            yazılacakguildDatabase.secenek = true
                            mesajlar(m.u, mesaj)
                            return await normal(mesajId, mesaj)
                        case "geri":
                            mesajlar(m.kyt, mesaj)
                            return await alınacak(mesajId, mesaj)
                        default:
                            return süre(seçenek, m.s, mesajId, mesaj)
                    }
                }).catch(() => süre(seçenek, m.s, mesajId, funcMsg))
            }
            async function alınacak(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 3, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.y, mesaj)
                            return await yetkili(mesajId, mesaj)
                    }
                    let rol = m.rolBul(mesaj)
                    if (rol.managed) return süre(alınacak, m.brd, mesajId, mesaj)
                    else if (rol.id == yazılacakguildDatabase.yetkili) return süre(alınacak, m.ukedyr, mesajId, mesaj)
                    else if (rol.position >= mesaj.guild.members.me.roles.highest.position) return süre(alınacak, m.ry(rol.id, mesaj), mesajId, mesaj)
                    else if (rol) {
                        yazılacakguildDatabase.kayıtsız = rol.id
                        mesajlar(m.s, mesaj)
                        return await seçenek(mesajId, mesaj)
                    } else return süre(alınacak, m.kyt, mesajId, mesaj)
                }).catch(() => süre(alınacak, m.kyt, mesajId, funcMsg))
            }
            async function yetkili(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 2, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(m.l, mesaj)
                            return await log(mesajId, mesaj)
                    }
                    let rol = m.rolBul(mesaj)
                    if (rol.managed) return süre(yetkili, m.brd, mesajId, mesaj)
                    else if (rol) {
                        yazılacakguildDatabase.yetkili = rol.id
                        mesajlar(m.kyt, mesaj)
                        return await alınacak(mesajId, mesaj)
                    } else return süre(yetkili, m.y, mesajId, mesaj)
                }).catch(() => süre(yetkili, m.y, mesajId, funcMsg))
            }
            async function log(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 111, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geç":
                            delete yazılacakguildDatabase.log
                            mesajlar(m.y, mesaj)
                            return await yetkili(mesajId, mesaj)
                        case "geri":
                            mesajlar(m.g, mesaj)
                            return await günlük(mesajId, mesaj)
                    }
                    let kanal = m.kanalBul(mesaj)
                    if (kanal.type !== 0) return süre(log, m.kd, mesajId, mesaj)
                    else if (kanal) {
                        yazılacakguildDatabase.log = kanal.id
                        mesajlar(m.y, mesaj)
                        return await yetkili(mesajId, mesaj)
                    } else return süre(log, m.l, mesajId, mesaj)
                }).catch(() => süre(log, m.l, mesajId, funcMsg))
            }
            async function günlük(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: mesajId, idler: yazılacakguildDatabase, f: 1, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geç":
                            delete yazılacakguildDatabase.günlük
                            mesajlar(m.y, mesaj)
                            return await yetkili(mesajId, mesaj)
                        case "geri":
                            mesajlar(m.k, mesaj)
                            return await kayıtkanal(mesajId, mesaj)
                    }
                    let kanal = m.kanalBul(mesaj)
                    if (kanal.type !== 0) return süre(günlük, m.kd, mesajId, mesaj)
                    else if (kanal) {
                        yazılacakguildDatabase.günlük = kanal.id
                        mesajlar(m.l, mesaj)
                        return await log(mesajId, mesaj)
                    } else return süre(günlük, m.g, mesajId, mesaj)
                }).catch(err => süre(günlük, m.g, mesajId, funcMsg))
            }
            async function kayıtkanal(mesajId, funcMsg) {
                db.yaz(guildId, { channelId: int.channelId, messageId: (mesajId || int.id), idler: yazılacakguildDatabase, f: 150, date: Date.now() }, "kur", "diğerleri")
                await channel?.awaitMessages({ filter: filter, max: 1, time: 45000 }).then(async a => {
                    const mesaj = a.first()
                    switch (mesaj.content.toLocaleLowerCase()) {
                        case "kapat":
                        case "iptal":
                            db.sil(guildId, "kur", "diğerleri")
                            return mesajlar(m.i, mesaj)
                        case "geri":
                            mesajlar(`• B-ben bunu nasıl yapabileceğimi b-bilmiyorum...\n${m.k}`, mesaj)
                            return await kayıtkanal(mesajId, mesaj)
                    }
                    let kanal = m.kanalBul(mesaj)
                    if (kanal.type !== 0) return süre(kayıtkanal, m.kd, int.id, mesaj)
                    else if (kanal) {
                        yazılacakguildDatabase.kanal = kanal.id
                        mesajlar(m.g, mesaj)
                        return await günlük(int.id, mesaj)
                    } else return süre(kayıtkanal, m.k, int.id, mesaj)
                }).catch(err => süre(kayıtkanal, m.k), int.id, (funcMsg || int))
            }
            int.reply(`${m.k}\n\n• İşlemi iptal etmek için **iptal** veya **kapat**\n• Önceki soruya dönmek isterseniz **geri** yazabilirsiniz`).catch(err => { })
            kayıtkanal()
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}