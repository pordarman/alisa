"use strict";
const database = require("../../../../Helpers/Database");
const Time = require("../../../../Helpers/Time");
const Util = require("../../../../Helpers/Util");
const {
    discordInviteLink,
    ownerId,
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");


module.exports = {
    name: "pre", // Komutun ismi
    id: "pre", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "pre",
        "premium"
    ],
    description: "Premium ile ilgili her şeyi gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>pre <Seçenekler>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        isOwner,
        premium,
        language,
    }) {

        // ID'si girilen kullanıcıya mesaj atar
        async function sendMessage(userId, messageObject) {
            // Eğer kullanıcıyı bulamadıysa hiçbir şey yapma
            const user = await Util.fetchUserForce(msg.client, userId);
            if (!user) return;

            return user.send(messageObject);
        }

        const options = [
            `**• ${prefix}${this.name} kullan <kod> =>** Bir yetkilinin verdiği premium kodu kullanmanızı sağlar`,
            `**• ${prefix}${this.name} değiştir <sunucuId> =>** Bir sunucunun premium özelliklerini başka bir sunucuya aktarmayı sağlar`,
            `**• ${prefix}${this.name} süre =>** Bu sunucunun kanal premium süresini gösterir`,
            `**• ${prefix}${this.name} özellikler =>** Premium'a özel olan özellikleri görmenizi sağlar`,
            `**• ${prefix}${this.name} fiyat =>** Premium'un fiyatlarını görmenizi sağlar`
        ];

        const premiumFile = database.getFile("premium", "other");

        // Girilen Premium kodunun verisini döndür
        function getPremiumGuildId(premiumCode) {
            return Object.entries(premiumFile).find(([key, value]) => value.code === premiumCode)?.[0];
        }

        // Rastgele kod oluşturma fonksiyonu
        function randomCode(length, allPremiumCodes = new Set()) {
            const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let resultCode = "";

            for (let i = 0; i < length; i++) {
                resultCode += allLetters[Math.floor(Math.random() * allLetters.length)];
            }

            // Eğer premiumCode daha önceden oluşturulmuşsa yeniden oluştur
            return allPremiumCodes.has(resultCode) ? randomCode(length) : resultCode;
        }

        // Eğer komutu kullanan kişi botun sahibiyse ona özel seçenekleri de göster
        if (isOwner) {
            options.push(
                `\n**• ${prefix}${this.name} oluştur <kişiId> =>** Etiketlediğiniz kişiye özel bir premium ekler`,
                `**• ${prefix}${this.name} uzat <kod> =>** Girdiğiniz kodun premium süresini uzatır`,
                `**• ${prefix}${this.name} sil <kod> =>** Bir sunucunun premium'unu silersiniz`,
                `**• ${prefix}${this.name} sunucular =>** Premium alan ve almış olan bütün kişileri ve sunucuları gösterir`,
            );
        }

        const PREMIUM_CODE_LENGTH = 8;

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer kullanıcı kodunu kullanmak istiyorsa
            case "kullan":
            case "use": {

                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `**${premiumCode}** koduna karşılık gelen premium kodunu bulamadım!\n\n` +
                    `• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[Destek Sunucuma](${discordInviteLink})__ gelip yetkililerden destek alabilirsiniz`
                )

                const {
                    authorId: premiumAuthorId,
                    isUse,
                    totalTime,
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(`Bu premium kodunu yalnızca satın alan kişi (<@${premiumAuthorId}>) kullanabilir şapşik şey seni :(`);

                // Eğer kod zaten kullanılıyorsa
                if (isUse) return errorEmbed(
                    `**${premiumCode}** koduna karşılık gelen premium kodunda zaten bir sunucu ( ${await Util.getGuild(msg.client, premiumGuildId)?.name || premiumGuildId} ) bulunuyor\n\n` +
                    `• Eğer premiumunuzu başka bir sunucuya aktarmak için **${prefix}${this.name} değiştir** yazarak premiumunuzu başka bir sunucuya aktarabilirsiniz`
                );

                // Eğer o sunucuda bir premium bulunuyorsa
                if (premiumFile[guildId]) return errorEmbed(`Şeyyy... ${await Util.getGuildNameOrId(msg.client, guildId, language)} sunucuda zaten bir premium bulunuyor şapşik şey seni :(`);

                const startedTimestamp = Date.now();
                const expiresTimestamp = totalTime === null ? null : startedTimestamp + totalTime;

                // Sunucunun premium verisini eski haline getir
                guildDatabase.premium = guildDatabase.premium.oldDatas || database.defaultGuildDatabase.premium;

                // Eğer premiumun süresi sınırsız değilse
                if (expiresTimestamp !== null) {
                    msg.client.guildPremiums.set(guildId,
                        Util.setTimeout(async () => {
                            const newPremiumFile = database.getFile("premium", "other");

                            const premiumGuildId = getPremiumGuildId(premiumCode);

                            // Eğer kod daha önceden silinmişse hiçbir şey döndürme
                            if (!premiumGuildId) return;

                            const newPremiumData = newPremiumFile[premiumGuildId];

                            // Veriyi sil ve yenisini oluştur
                            delete newPremiumFile[premiumGuildId];
                            newPremiumFile[`${premiumGuildId} - ${Date.now()}`] = {
                                ...newPremiumData,
                                isFinished: true,
                            };
                            database.writeFile(newPremiumFile, "premium", "other");

                            const guildName = await Util.getGuildNameOrId(msg.client, premiumGuildId, language);

                            // Kullanıcıya ve bot sahibine bilgilendirme mesajı gönder
                            sendMessage(
                                premiumAuthorId,
                                `• Heyy bakıyorum ki ${guildName} sunucunun premiumu bitmiş gibi görünüyor :(\n\n` +
                                `• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n` +
                                `• ${discordInviteLink}`
                            );
                            sendMessage(
                                ownerId,
                                `**> PREMİUM BİLGİLENDİRME**\n\n` +
                                `• ${guildName} - **(${premiumGuildId})** sunucunun premium'u bitmiştir\n` +
                                `• **Satın alan kişi:** <@${premiumAuthorId}> - (${premiumAuthorId})\n` +
                                `• **Kullandığı süre:** ${Time.duration(expiresTimestamp - startedTimestamp, language)}`
                            );
                        }, totalTime)
                    );
                }

                // Database'ye kaydet
                premiumFile[guildId] = {
                    authorId: premiumAuthorId,
                    isUse: true,
                    code: premiumCode,
                    totalTime,
                    expiresTimestamp,
                    startedTimestamp
                }
                delete premiumFile[premiumGuildId];
                database.writeFile(premiumFile, "premium", "other");

                return errorEmbed(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await Util.getGuildNameOrId(msg.client, guildId, language)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "success");
            }

            // Eğer premiumu başka bir sunucuya aktartmak istiyorsa
            case "değiştir":
            case "değiş": {
                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `**${premiumCode}** koduna karşılık gelen premium kodunu bulamadım!\n\n` +
                    `• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[Destek Sunucuma](${discordInviteLink})__ gelip yetkililerden destek alabilirsiniz`
                )

                const {
                    authorId: premiumAuthorId
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(`Bu premium kodunu yalnızca satın alan kişi (<@${premiumAuthorId}>) kullanabilir şapşik şey seni :(`);

                // Eğer premium kodu zaten kullanılmamışsa
                if (isNaN(premiumGuildId)) return errorEmbed(
                    `**${premiumCode}** koduna karşılık gelen premium kodunda zaten herhangi bir sunucu tanımlanmamış!\n\n` +
                    `• Eğer premium kodunu kullanmak isterseniz **${prefix}${this.name} kullan <premiumKodu>** şeklinde yazabilirsiniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const newGuildId = args[2];

                // Eğer sunucu ID'si girilmemişse veya düzgün bir ID girilmemişse
                if (
                    !newGuildId ||
                    !(/^\d{17,20}$/.test(newGuildId))
                ) return errorEmbed("Lütfen premium özelliğini aktaracağınız sunucunun ID'sini giriniz");

                // Eğer girdiği sunucu ID'si premium sunucusunun ID'siyle aynıysa
                if (premiumGuildId == newGuildId) return errorEmbed(`Girdiğiniz premium kodu zaten ${await Util.getGuildNameOrId(msg.client, sunucuId, language)} sunucuda kullanılıyor`);

                // Eğer girdiği sunucuda bir premium bulunuyorsa
                if (premiumFile[newGuildId]) return errorEmbed(`Şeyyy... **${await Util.getGuild(msg.client, newGuildId)?.name || `${newGuildId}** ID'ye sahip**`} **sunucuda zaten bir premium bulunuyor şapşik şey seni :(`)

                // Premium Database'sini kaydet 
                premiumFile[newGuildId] = {
                    ...premiumData,
                    isUse: true
                };
                delete premiumFile[premiumGuildId];
                database.writeFile(premiumFile, "premium", "other");

                // Sunucuların database'sini kaydet
                await msg.client.shard.broadcastEval(
                    (client, guildId) => {
                        const path = __dirname.replace(/\\node_modules.*/, "");
                        const Util = require(`${dirname}\\Helpers\\Util`);
                        const database = require(`${path}\\Helpers\\Database`);

                        const guildData = Util.getGuildData(client, guildId);
                        const tempData = guildData.premium;
                        guildData.premium = database.defaultGuildDatabase.premium;
                        guildData.premium.oldDatas = tempData;
                        database.writeFile(guildData, guildId);
                    },
                    {
                        shard: Util.shardId(premiumGuildId),
                        context: premiumGuildId
                    }
                )
                await msg.client.shard.broadcastEval(
                    (client, guildId) => {
                        const path = __dirname.replace(/\\node_modules.*/, "");
                        const Util = require(`${dirname}\\Helpers\\Util`);
                        const database = require(`${path}\\Helpers\\Database`);

                        const guildData = Util.getGuildData(client, guildId);
                        guildData.premium = guildData.premium.oldDatas || database.defaultGuildDatabase.premium;
                        database.writeFile(guildData, guildId);
                    },
                    {
                        shard: Util.shardId(newGuildId),
                        context: newGuildId
                    }
                )

                return errorEmbed(`Premium kodu başarıyla aktif edildi ve kullanılabilir durumda! ${await Util.getGuildNameOrId(msg.client, newGuildId, language)} sunucu artık __çok ama çok özel avantajlara sahipp__!!`, "b")
            }

            // Eğer premiumun ne zaman biteceğini görmek istiyorsa
            case "kalansüre":
            case "süre":
            case "zaman": {
                // Eğer bu sunucuda premium yoksa
                if (!premium) return errorEmbed(`Bu sunucuya tanımlanmış herhangi bir premium bulunmuyor :(`);

                const {
                    expiresTimestamp
                } = premium;

                // Eğer premium sınırsız ise
                if (expiresTimestamp === null) return msg.reply(`• Bu sunucudaki premium **ASLA** bitmeyecektir oleyy!! 🎉`);

                const expiresTimestampInSecond = Math.round(expiresTimestamp / 1000);
                return msg.reply(
                    `• Bu sunucudaki premium **<t:${expiresTimestampInSecond}:F> - <t:${expiresTimestampInSecond}:R>** tarihinde sona erecektir\n` +
                    `• Yani __${Time.duration(expiresTimestampInSecond, language, true)}__ sonra bitecektir`
                );
            }

            // Eğer premium özelliklerini görmek istiyorsa
            case "özellikler":
            case "özellik": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        `• Fiyat bilgisini öğrenmek için **${prefix}${this.name} fiyat** yazabilirsiniz\n\n` +
                        `• Heyy görüyorum ki premium almayı düşünüyorsun o halde tam da doğru yere geldin\n\n` +
                        `__**• Hemen sana premium özelliklerini kısaca anlatıyım**__\n` +
                        ` ├> Hiçbir komutta bekleme süresi olmadan istediğiniz gibi kullanabilirsiniz\n` +
                        ` ├> Premium'a özel bir sürü komutla beraber sunucunuzu daha güzel bir yer haline getirebilirsiniz\n` +
                        ` ├> Bota gelecek özellikleri diğer kullanıcılardan daha önce görebilirsiniz\n` +
                        ` ├> Premiumunuz bittikten sonra hiçbir veriniz silinmez ve yeniden premium aldığınızda hiçbir şey ayarlamadan kullanabilirsiniz\n` +
                        ` ├> Destek sunucumda özel bir role sahip olursunuz :3\n` +
                        ` └> Ve eğer 1 hafta içinde beğenmezseniz paranız anında iade edilir!\n\n` +
                        `• Eğer premium almak istiyorsanız __**[Destek Sunucuma](${discordInviteLink})**__ gelip bilet açmanız yeterlidir\n\n` +
                        `• Ve en önemlisi *seni seviyorum..* 💗`
                    )
                    .setThumbnail(clientAvatar)
                    .setColor("#9e02e2")
                    .setTimestamp();

                return msg.reply({
                    embeds: [
                        embed
                    ]
                });
            }

            // Eğer fiyatlandırmayı görmek istiyorsa
            case "fiyat":
            case "fiyatlandırma": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        `${premium ? "• Heyyy görüyorum ki bu sunucuda premium zaten aktif edilmiş durumda!\n\n" : ""}` +
                        `• Premium özelliklerini öğrenmek için **${prefix}${this.name} özellikler** yazabilirsiniz\n\n` +
                        `• Eğer 1 hafta içinde beğenmezseniz paraniz iade!\n\n` +
                        `• **1 aylık =>** __20__ Türk Lirası 💵\n` +
                        `• **3 aylık =>** __50__ Türk Lirası 💵\n` +
                        `• **6 aylık =>** __80__ Türk Lirası 💵\n` +
                        `• **Sınırsız =>** __125__ Türk Lirası 💵\n\n` +
                        `• Ödeme olarak sadece **Papara, İninal ve IBAN** kabul ediyoruz\n\n` +
                        `• Eğer premium almak istiyorsanız __**[Destek Sunucuma](${discordInviteLink})**__ gelip bilet açmanız yeterlidir`
                    )
                    .setThumbnail(clientAvatar)
                    .setColor("#9e02e2")
                    .setTimestamp();

                return msg.reply({
                    embeds: [
                        embed
                    ]
                });
            }

            // Eğer yeni bir premium kodu oluşturmak istiyorsa
            case "oluştur":
            case "ekle": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Kişiyi etiketle
                const content = args.join(" ")
                const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, content);

                // Eğer kişiyi etiketlememişse
                if (!user) return errorEmbed("Lütfen bir kişiyi etiketleyiniz veya ID'sini giriniz");

                // Eğer etiketlediği kişi bir botsa
                if (user.bot) return errorEmbed(`B-botlara premium vermeyi nasıl düşünüyorsun??`);

                const userId = user.id;

                // Süreyi belirle
                let time = Time.parseTime(content);

                // Eğer süre girilmemişse
                if (time == 0) {
                    // Eğer sınırsız değilse
                    if (!args.includes("sınırsız")) return errorEmbed(
                        `Lütfen bir premium süresi giriniz\n\n` +
                        `**Örnek**\n` +
                        `• ${prefix}${this.name} oluştur <@${userId}> 1 ay\n` +
                        `• ${prefix}${this.name} oluştur <@${userId}> 25 gün 10 dakika 5 saniye\n` +
                        `• ${prefix}${this.name} oluştur <@${userId}> sınırsız`
                    );

                    // Eğer sınırsız ise
                    time = Infinity;
                };

                // Bütün premium kodlarını bir önbelleğe kaydet
                const premiumCodes = new Set();
                Object.values(premiumFile).forEach(
                    premiumData => premiumCodes.add(premiumData.code)
                );

                // Yeni bir kod oluştur ve dosyaya kaydet
                const newCode = randomCode(PREMIUM_CODE_LENGTH, premiumCodes);
                const newName = `Not used - ${Date.now()}`;

                premiumFile[newName] = {
                    authorId: userId,
                    totalTime: time,
                    code: newCode,
                    isUse: false,
                }
                database.writeFile(premiumFile, "premium", "other");

                const isUserSent = await sendMessage(
                    userId,
                    `• Pişt pişşttt duydum ki premium'u almışsııınnn!!! Sana ne kadar teşekkür etsem azdır...\n\n` +
                    `• ||${newCode}|| al bakalım premiumu aktif etmen için gerekli kodu gönderdim bunu istediğin sunucuya gidip **.pre kullan ||${newCode}||** şeklinde yazıp o sunucuya __çok avantajlı özellikler__ verebilirsiiinn!!\n\n` +
                    `• Ve eğer premiumunu __başka bir sunucuya aktarmak__ isterseniz **<@${msg.client.user.id}> pre değiştir ||${newCode}|| ${guildId}** şeklinde yazıp premiumunu **her yerde** kullanabirsiinn!!\n\n` +
                    `• Ve en önemlisi *seni seviyorum* 💗`
                );

                // Eğer kod kullanıcıya gönderilemediyse bot sahibine gönder
                if (!isUserSent) await sendMessage(
                    ownerId,
                    `• Premiumu satın alan kişiye mesaj atamadım!\n` +
                    `• Şimdi sana atacağım premium kodunu <@${userId}> - **${Util.recreateString(user.displayName)}** adlı kişiye vermeyi unutma\n` +
                    `• **Kod:** ${newCode}`
                );

                return errorEmbed(
                    `<@${userId}> adlı kişiye özel premium kodu başarıyla oluşturuldu${isUserSent ? " ve ona özel mesajdan premium kodunu ve nasıl kullanması gerektiğini anlattım!" : " ama DM'si açık olmadığı için nasıl kullanılacağını anlatamadım :("}`,
                    "success"
                );
            }

            // Eğer süreyi uzatmak istiyorsa
            case "uzat":
            case "süreekle": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `**${premiumCode}** koduna karşılık gelen premium kodunu bulamadım!\n\n` +
                    `• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[Destek Sunucuma](${discordInviteLink})__ gelip yetkililerden destek alabilirsiniz`
                );

                // Süreyi belirle
                let time = Time.parseTime(args.slice(2).join(" "));

                // Eğer süre girilmemişse
                if (time == 0) {
                    // Eğer sınırsız değilse
                    if (!args.includes("sınırsız")) return errorEmbed(
                        `Lütfen bir premium süresi giriniz\n\n` +
                        `**Örnek**\n` +
                        `• ${prefix}${this.name} uzat ${premiumCode} 1 ay\n` +
                        `• ${prefix}${this.name} uzat ${premiumCode} 25 gün 10 dakika 5 saniye\n` +
                        `• ${prefix}${this.name} uzat ${premiumCode} sınırsız`
                    );

                    // Eğer sınırsız ise
                    premiumData.totalTime = null;
                    premiumData.expiresTimestamp = null;
                }
                // Eğer sınırsız değilse
                else {
                    premiumData.totalTime += time;
                    premiumData.expiresTimestamp += time;

                    msg.client.guildPremiums.set(premiumGuildId,
                        Util.setTimeout(async () => {
                            const newPremiumFile = database.getFile("premium", "other");

                            const premiumGuildId = msg.client.premiumCodes.get(premiumCode);

                            // Eğer kod daha önceden silinmişse hiçbir şey döndürme
                            if (!premiumGuildId) return;

                            const newPremiumData = newPremiumFile[premiumGuildId];

                            // Veriyi sil ve yenisini oluştur
                            delete newPremiumFile[premiumGuildId];
                            newPremiumFile[`${premiumGuildId} - ${Date.now()}`] = {
                                ...newPremiumData,
                                isFinished: true,
                            };
                            database.writeFile(newPremiumFile, "premium", "other");

                            const guildName = await Util.getGuildNameOrId(msg.client, premiumGuildId, language);

                            // Kullanıcıya ve bot sahibine bilgilendirme mesajı gönder
                            sendMessage(
                                premiumAuthorId,
                                `• Heyy bakıyorum ki ${guildName} sunucunun premiumu bitmiş gibi görünüyor :(\n\n` +
                                `• Eğer premium'dan memnun kaldıysanız ya da yeniden satın almak isterseniz destek sunucuma gelebilirsiniz!!\n\n` +
                                `• ${discordInviteLink}`
                            );
                            sendMessage(
                                ownerId,
                                `**> PREMİUM BİLGİLENDİRME**\n\n` +
                                `• ${guildName} - **(${premiumGuildId})** sunucunun premium'u bitmiştir\n` +
                                `• **Satın alan kişi:** <@${premiumAuthorId}> - (${premiumAuthorId})\n` +
                                `• **Kullandığı süre:** ${Time.duration(expiresTimestamp - startedTimestamp, language)}`
                            );
                        }, premiumData.totalTime)
                    );
                }

                // Database'ye kaydet
                database.writeFile(premiumFile, "premium", "other");

                return errorEmbed(`**${premiumCode}** adlı kodun süresi **${time != 0 ? Time.duration(time, language) : "sınırsız"}** uzatılmıştır`, "success");
            }

            // Eğer premium kodunu silmek istiyorsa
            case "sil":
            case "kaldır": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                const premiumCodeOrGuildId = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCodeOrGuildId) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}${this.name} kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                let premiumGuildId = allPremiumCodes.get(premiumCodeOrGuildId);
                let premiumData;

                // Eğer kod girmişse
                if (premiumGuildId) premiumData = premiumFile[premiumGuildId];
                // Eğer ID girmişse
                else {
                    premiumData = premiumFile[premiumCodeOrGuildId];
                    premiumGuildId = premiumCodeOrGuildId;
                }

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `**${premiumCodeOrGuildId}** ${isNaN(premiumCodeOrGuildId) ? "koduna" : "ID'sine"} karşılık gelen premium kodunu bulamadım!\n\n` +
                    `• Eğer premium satın aldıysanız ve aktif edemiyorsanız __[Destek Sunucuma](${discordInviteLink})__ gelip yetkililerden destek alabilirsiniz`
                );

                // Sunucunun shard'ına git ve timeout verisini durdur
                await msg.client.shard.broadcastEval(
                    (client, premiumGuildId) => {
                        const timeout = client.guildPremiums.get(premiumGuildId);

                        // Eğer timeout verisi varsa durdur
                        if (typeof timeout == "function") {
                            clearTimeout(timeout);
                            client.guildPremiums.delete(premiumGuildId);
                        }
                    },
                    {
                        shard: Util.shardId(premiumGuildId),
                        context: premiumGuildId
                    }
                )

                // Veriyi sil ve yenisini oluştur
                delete premiumFile[premiumGuildId];
                premiumFile[`${premiumGuildId} - ${Date.now()}`] = {
                    ...premiumData,
                    isFinished: true,
                };
                database.writeFile(premiumFile, "premium", "other");

                return errorEmbed(`**${premiumCodeOrGuildId}** ${isNaN(premiumCodeOrGuildId) ? "koduna" : "ID'sine"} karşılık gelen premium kodu başarıyla silinmiştir`, "success");
            }

            // Eğer premiuma sahip olan bütün sunucuları görmek istiyorsa
            case "sunucu":
            case "sunucular": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Bütün premium verilerini bir diziye aktar ve sırala
                const allPremiumCodes = Object.entries(database.getFile("premium", "other"))
                    .sort(
                        ([_, firstData], [__, secondData]) => {
                            const firstExpression = firstData.expiresTimestamp;
                            const secondExpression = secondData.expiresTimestamp;

                            // Eğer iki premium verisinin daha kullanılmamışsa
                            if (!firstExpression && !secondExpression) return 0;

                            // Eğer ilk premium verisi daha kullanılmamışsa
                            if (!firstExpression) return -1;

                            // Eğer ikinci premium verisi daha kullanılmamışsa
                            if (!secondExpression) return 1;

                            return secondExpression - firstExpression;
                        }
                    );

                const PREMIUM_DATAS_PER_PAGE = 10,
                    length = allPremiumCodes.length,
                    MAX_PAGE_NUMBER = Math.ceil(length / PREMIUM_DATAS_PER_PAGE),
                    LENGTH_TO_HUMANIZE = Util.toHumanize(length, language);

                const clientAvatar = msg.client.user.displayAvatarURL();

                // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
                const pages = new Map();

                // Sayfada gözükecek premium kodlarını database'den çekme fonksiyonu
                function getPremiumCodes(pageNum, limit) {
                    const startIndex = (pageNum - 1) * limit
                    const resultArray = [];
                    for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                        try {
                            let [_, {
                                authorId: userId,
                                code,
                                isUse,
                                expiresTimestamp,
                                totalTime,
                                isFinished
                            }] = allPremiumCodes[index];

                            resultArray.push(
                                // Eğer premiumun süresi bitmişse
                                isFinished ?
                                    `• \`#${length - index}\` ${EMOJIS.no} __${code}__ **=> Süresi bitmiş** - ${totalTime !== null ? Time.duration(totalTime, language) : "__**Sınırsız**__"} - <@${userId}>` :
                                    `• \`#${length - index}\` ${EMOJIS.yes} __${code}__ **=> ${isUse ? "Aktif" : "Aktif değil"}** - ${totalTime !== null ? Time.duration(totalTime, language) : "__**Sınırsız**__"} - <@${userId}>${expiresTimestamp ? ` - %${((1 - (expiresTimestamp - Date.now()) / totalTime) * 100).toFixed(2)} tamamlandı - (${Time.duration(expiresTimestamp, true)} kaldı)` : ""}`
                            );
                        }
                        // Eğer olur da bir hata oluşursa döngüyü geç
                        catch (__) {
                            continue;
                        }
                    }
                    pages.set(pageNum, resultArray);
                    return resultArray
                }
                function getPage(pageNum) {
                    return pages.get(pageNum) ?? getPremiumCodes(pageNum, PREMIUM_DATAS_PER_PAGE)
                }

                let pageNumber = 1;

                // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
                function createEmbed(pageNum) {
                    const page = getPage(pageNum);
                    return new EmbedBuilder()
                        .setAuthor({
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        })
                        .setDescription(
                            `**• Botta toplamda __${LENGTH_TO_HUMANIZE}__ tane premium verisi bulundu**\n\n` +
                            `${page.join("\n\n") || "• Burada gösterilecek hiçbir şey yok..."}`
                        )
                        .setThumbnail(clientAvatar)
                        .setColor("DarkPurple")
                        .setFooter({
                            text: `Sayfa ${pageNum}/${MAX_PAGE_NUMBER || 1}`
                        })
                };

                const pageEmbed = createEmbed(pageNumber);

                if (MAX_PAGE_NUMBER <= 1) return msg.reply({
                    embeds: [
                        pageEmbed
                    ]
                });

                // Mesaja butonlar ekle ve bu butonlar sayesinde sayfalar arasında geçişler yap
                const fastleftButton = new ButtonBuilder()
                    .setEmoji(EMOJIS.leftFastArrow)
                    .setCustomId("COMMAND_BUTTON_FASTLEFT")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == 1);

                const leftButton = new ButtonBuilder()
                    .setEmoji(EMOJIS.leftArrow)
                    .setCustomId("COMMAND_BUTTON_LEFT")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == 1);

                const deleteButton = new ButtonBuilder()
                    .setEmoji(EMOJIS.delete)
                    .setCustomId("COMMAND_BUTTON_DELETE")
                    .setStyle(ButtonStyle.Danger);

                const rightButton = new ButtonBuilder()
                    .setEmoji(EMOJIS.rightArrow)
                    .setCustomId("COMMAND_BUTTON_RIGHT")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == MAX_PAGE_NUMBER);

                const fastrightButton = new ButtonBuilder()
                    .setEmoji(EMOJIS.rightFastArrow)
                    .setCustomId("COMMAND_BUTTON_FASTRIGHT")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageNumber == MAX_PAGE_NUMBER);

                // Her yerde yeni bir ActionRowBuilder oluşturmak yerine hepsini bu fonksiyondan çekeceğiz
                function createRowBuilder() {
                    return new ActionRowBuilder()
                        .addComponents(
                            fastleftButton,
                            leftButton,
                            deleteButton,
                            rightButton,
                            fastrightButton
                        )
                }

                const waitMessage = await msg.reply({
                    content: `**• Eğer düğmelere bastığınız halde sayfalar değişmiyorsa lütfen bu mesajı siliniz ve yeni bir tane oluşturunuz**`,
                    embeds: [
                        pageEmbed
                    ],
                    components: [
                        createRowBuilder()
                    ]
                });

                // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
                if (!waitMessage) return;

                const TWO_MINUTES = 1000 * 60 * 2

                const waitComponents = waitMessage.createMessageComponentCollector({
                    filter: (button) => button.user.id == authorId,
                    time: TWO_MINUTES
                })

                // Eğer butona tıklarsa
                waitComponents.on("collect", (button) => {
                    switch (button.customId) {
                        case "COMMAND_BUTTON_DELETE":
                            // Mesajı sil
                            return waitMessage.delete();

                        case "COMMAND_BUTTON_FASTLEFT":
                        case "COMMAND_BUTTON_LEFT":
                            // Sağ okları yeniden aktif et    
                            rightButton.setDisabled(false);
                            fastrightButton.setDisabled(false);

                            // Kaç sayfa geriye gideceğini hesapla
                            pageNumber = Math.max(1, pageNumber - (button.customId == "COMMAND_BUTTON_LEFT" ? 1 : 5));

                            // Eğer en başa geldiysek sol okları deaktif et
                            if (pageNumber == 1) {
                                leftButton.setDisabled(true);
                                fastleftButton.setDisabled(true);
                            }
                            break;
                        default:
                            // Sol okları yeniden aktif et    
                            leftButton.setDisabled(false);
                            fastleftButton.setDisabled(false);

                            // Kaç sayfa ileriye gideceğini hesapla
                            pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + (button.customId == "COMMAND_BUTTON_RIGHT" ? 1 : 5));

                            // Eğer en sona geldiysek sağ okları deaktif et
                            if (pageNumber == MAX_PAGE_NUMBER) {
                                rightButton.setDisabled(true);
                                fastrightButton.setDisabled(true);
                            }
                            break;
                    }

                    const pageEmbed = createEmbed(pageNumber);

                    return waitMessage.edit({
                        embeds: [
                            pageEmbed
                        ],
                        components: [
                            createRowBuilder()
                        ]
                    })
                })

                // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
                waitComponents.on("end", () => {
                    // Eğer mesaj silinmişse hiçbir şey yapma
                    if (
                        !msg.channel.messages.cache.has(waitMessage.id)
                    ) return;

                    // Butonları deaktif et
                    fastleftButton
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary);
                    leftButton
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary);
                    deleteButton
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary);
                    rightButton
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary);
                    fastrightButton
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary);

                    // Bellekten tasarruf etmek için Map fonksiyonunu temizle
                    pages.clear();

                    return waitMessage.edit({
                        content: `• Bu mesaj artık aktif değildir`,
                        components: [
                            createRowBuilder()
                        ]
                    })
                });
            }
            default:
                return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
        }

    },
};