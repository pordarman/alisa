"use strict";
const database = require("../../../Helpers/Database.js");
const Time = require("../../../Helpers/Time");
const Util = require("../../../Helpers/Util.js");
const path = require("path");
const {
    discordInviteLink,
    ownerId,
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "premium",
        en: "premium"
    },
    id: "premium", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "pre",
            "premium"
        ],
        en: [
            "pre",
            "premium"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Premium ile ilgili her şeyi gösterir",
        en: "Shows everything related to Premium"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>pre <Seçenekler>",
        en: "<px>pre <Options>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guildDatabase,
        guildId,
        args,
        prefix,
        authorId,
        language,
        errorEmbed,
        isOwner,
        premium,
    }) {

        const {
            commands: {
                premium: messages
            },
            switchs: {
                premium: switchKey
            }
        } = allMessages[language];

        // ID'si girilen kullanıcıya mesaj atar
        async function sendMessage(userId, messageObject) {
            // Eğer kullanıcıyı bulamadıysa hiçbir şey yapma
            const user = await Util.fetchUserForce(msg.client, userId);
            if (!user) return;

            return user.send(messageObject);
        }

        let options = messages.options(prefix)

        const premiumFile = await database.getFile("premium");

        // Girilen Premium kodunun verisini döndür
        function getPremiumGuildId(premiumCode) {
            return Object.entries(premiumFile).find(([, value]) => value.code === premiumCode)?.[0];
        }

        // Rastgele kod oluşturma fonksiyonu
        function randomCode(length, allPremiumCodes = new Set()) {
            const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let resultCode = "";

            for (let i = 0; i < length; i++) {
                resultCode += Util.random(allLetters);
            }

            // Eğer premiumCode daha önceden oluşturulmuşsa yeniden oluştur
            return allPremiumCodes.has(resultCode) ? randomCode(length, allPremiumCodes) : resultCode;
        }

        // Eğer komutu kullanan kişi botun sahibiyse ona özel seçenekleri de göster
        if (isOwner) {
            options += `\n• **${prefix}pre oluştur <kişiId> <süre> =>** Etiketlediğiniz kişiye özel bir premium ekler\n` +
                `• **${prefix}pre uzat <kod> <süre> =>** Girdiğiniz kodun premium süresini uzatır\n` +
                `• **${prefix}pre sil <kod> =>** Bir sunucunun premium'unu silersiniz\n` +
                `• **${prefix}pre sunucular =>** Premium alan ve almış olan bütün kişileri ve sunucuları gösterir`
        }

        const PREMIUM_CODE_LENGTH = 8;

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {

            // Eğer kullanıcı kodunu kullanmak istiyorsa
            case "use": {

                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    messages.noCode({
                        prefix,
                        randomCode: randomCode(PREMIUM_CODE_LENGTH)
                    })
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    messages.noCodeFound(premiumCode)
                )

                const {
                    authorId: premiumAuthorId,
                    isUse,
                    totalTime,
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(messages.notOwner(premiumAuthorId));

                // Eğer kod zaten kullanılıyorsa
                if (isUse) return errorEmbed(
                    messages.use.codeAlreadyUsed({
                        premiumCode,
                        guildName: await Util.getGuildNameOrId(msg.client, premiumGuildId, language),
                        prefix
                    })
                );

                // Eğer o sunucuda bir premium bulunuyorsa
                if (premiumFile[guildId]) return errorEmbed(messages.use.guildAlreadyHasPremium(await Util.getGuildNameOrId(msg.client, guildId, language)));

                const startedTimestamp = Date.now();
                const expiresTimestamp = totalTime == null ? null : startedTimestamp + totalTime;

                // Sunucunun premium verisini eski haline getir
                guildDatabase.premium = guildDatabase.premium.oldDatas || database.defaultGuildDatabase.premium;

                // Eğer premiumun süresi sınırsız değilse
                if (expiresTimestamp !== null) {
                    Util.maps.guildPremiums.set(guildId,
                        Util.setTimeout(async () => {
                            const newPremiumFile = await database.getFile("premium");

                            const premiumGuildId = getPremiumGuildId(premiumCode);

                            // Eğer kod daha önceden silinmişse hiçbir şey döndürme
                            if (!premiumGuildId) return;

                            const newPremiumData = newPremiumFile[premiumGuildId];

                            // Veriyi sil ve yenisini oluştur
                            delete newPremiumFile[premiumGuildId];

                            const newName = `${premiumGuildId} - ${Date.now()}`;
                            newPremiumFile[newName] = {
                                ...newPremiumData,
                                isFinished: true,
                            };

                            const [guildName] = await Promise.all([
                                Util.getGuildNameOrId(msg.client, premiumGuildId, language),
                                database.updateFile("premium", {
                                    $unset: {
                                        [premiumGuildId]: ""
                                    },
                                    $set: {
                                        [newName]: newPremiumFile[newName]
                                    }
                                })
                            ]);

                            // Kullanıcıya ve bot sahibine bilgilendirme mesajı gönder
                            sendMessage(
                                premiumAuthorId,
                                messages.use.codeIsExpired(guildName)
                            );
                            sendMessage(
                                ownerId,
                                `**> PREMİUM BİLGİLENDİRME**\n\n` +
                                `• ${guildName} - **(${premiumGuildId})** sunucunun premium'u bitmiştir\n` +
                                `• **Satın alan kişi:** <@${premiumAuthorId}> - (${premiumAuthorId})\n` +
                                `• **Kullandığı süre:** ${Time.duration(expiresTimestamp - startedTimestamp, "tr")}`
                            );
                        }, totalTime)
                    );
                }

                // Database'ye kaydet
                delete premiumFile[premiumGuildId];
                premiumFile[guildId] = {
                    authorId: premiumAuthorId,
                    isUse: true,
                    code: premiumCode,
                    totalTime,
                    expiresTimestamp,
                    startedTimestamp
                };
                const [guildName] = await Promise.all([
                    Util.getGuildNameOrId(msg.client, guildId, language),
                    database.updateFile("premium", {
                        $set: {
                            [guildId]: premiumFile[guildId]
                        },
                        $unset: {
                            [premiumGuildId]: ""
                        }
                    })
                ]);

                return errorEmbed(messages.codeWorked(guildName), "success");
            }

            // Eğer premiumu başka bir sunucuya aktartmak istiyorsa
            case "change": {
                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    messages.noCode({
                        prefix,
                        randomCode: randomCode(PREMIUM_CODE_LENGTH)
                    })
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    messages.noCodeFound(premiumCode)
                );

                const {
                    authorId: premiumAuthorId
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(messages.notOwner(premiumAuthorId));

                // Eğer premium kodu zaten kullanılmamışsa
                if (isNaN(premiumGuildId)) return errorEmbed(
                    messages.change.codeIsNotUsed({
                        prefix,
                        premiumCode,
                        randomCode: randomCode(PREMIUM_CODE_LENGTH)
                    })
                );

                const newGuildId = args[2];

                // Eğer sunucu ID'si girilmemişse veya düzgün bir ID girilmemişse
                if (
                    !newGuildId ||
                    !(/^\d{17,20}$/.test(newGuildId))
                ) return errorEmbed(messages.change.enterGuildId);

                // Eğer girdiği sunucu ID'si premium sunucusunun ID'siyle aynıysa
                if (premiumGuildId == newGuildId) return errorEmbed(messages.change.guildAlreadyUsesPremium(await Util.getGuildNameOrId(msg.client, newGuildId, language)));

                // Eğer girdiği sunucuda bir premium bulunuyorsa
                if (premiumFile[newGuildId]) return errorEmbed(messages.change.guildAlreadyHasPremium(await Util.getGuildNameOrId(msg.client, newGuildId, language)));

                // Premium Database'sini kaydet 
                delete premiumFile[premiumGuildId];
                premiumFile[newGuildId] = premiumData;
                const [guildName] = await Promise.all([
                    Util.getGuildNameOrId(msg.client, newGuildId, language),
                    database.updateFile("premium", {
                        $set: {
                            [newGuildId]: premiumFile[newGuildId]
                        },
                        $unset: {
                            [premiumGuildId]: ""
                        }
                    }),
                    msg.client.shard.broadcastEval(
                        async (_, guildId) => {
                            const path = require("path");
                            const rootPath = __dirname.split(`${path.sep}node_modules`)[0];
                            const database = require(path.join(rootPath, "Helpers", "Database.js"));

                            const guildData = await database.getGuild(guildId);
                            const tempData = guildData.premium;
                            guildData.premium = database.defaultGuildDatabase.premium;
                            guildData.premium.oldDatas = tempData;
                            await database.updateGuild(guildId, {
                                $set: {
                                    premium: guildData.premium
                                }
                            });
                        },
                        {
                            shard: Util.shardId(premiumGuildId),
                            context: premiumGuildId
                        }
                    ),
                    msg.client.shard.broadcastEval(
                        async (_, guildId) => {
                            const path = require("path");
                            const rootPath = __dirname.split(`${path.sep}node_modules`)[0];
                            const database = require(path.join(rootPath, "Helpers", "Database.js"));

                            const guildData = await database.getGuild(guildId);
                            guildData.premium = guildData.premium.oldDatas || database.defaultGuildDatabase.premium;
                            await database.updateGuild(guildId, {
                                $set: {
                                    premium: guildData.premium
                                }
                            });
                        },
                        {
                            shard: Util.shardId(newGuildId),
                            context: newGuildId
                        }
                    )
                ]);

                return errorEmbed(messages.codeWorked(guildName), "success")
            }

            // Eğer premiumun ne zaman biteceğini görmek istiyorsa
            case "remain": {
                // Eğer bu sunucuda premium yoksa
                if (!premium) return errorEmbed(messages.time.noPremium);

                const {
                    expiresTimestamp
                } = premium;

                // Eğer premium sınırsız ise
                if (expiresTimestamp === null) return msg.reply(messages.time.premiumNeverEnds);

                const expiresTimestampInSecond = Util.msToSecond(expiresTimestamp);
                return msg.reply(
                    messages.time.premiumEndsAt(expiresTimestampInSecond)
                );
            }

            // Eğer premium özelliklerini görmek istiyorsa
            case "features": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        messages.features.description(prefix)
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
            case "price": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        messages.price.description({
                            prefix,
                            premium,
                        })
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
            case "ekle": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
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
                        `• ${prefix}pre oluştur <@${userId}> 1 ay\n` +
                        `• ${prefix}pre oluştur <@${userId}> 25 gün 10 dakika 5 saniye\n` +
                        `• ${prefix}pre oluştur <@${userId}> sınırsız`
                    );

                    // Eğer sınırsız ise
                    time = null;
                };

                // Bütün premium kodlarını bir önbelleğe kaydet
                const premiumCodes = new Set();
                const values = Object.values(premiumFile);
                for (let i = 0; i < values.length; ++i) {
                    premiumCodes.add(values[i].code)
                }

                // Yeni bir kod oluştur ve dosyaya kaydet
                const newCode = randomCode(PREMIUM_CODE_LENGTH, premiumCodes);
                const newName = `Not used - ${Date.now()}`;

                premiumFile[newName] = {
                    authorId: userId,
                    totalTime: time,
                    code: newCode,
                    isUse: false,
                    createdTimestamp: Date.now()
                };

                const [isUserSent] = await Promise.all([
                    sendMessage(
                        userId,
                        `• Pişt pişşttt duydum ki premium'u almışsııınnn!!! Sana ne kadar teşekkür etsem azdır...\n\n` +
                        `• ${newCode} al bakalım premiumu aktif etmen için gerekli kodu gönderdim bunu istediğin sunucuya gidip **.pre kullan ${newCode}** şeklinde yazıp o sunucuya __çok avantajlı özellikler__ verebilirsiiinn!!\n\n` +
                        `• Ve eğer premiumunu __başka bir sunucuya aktarmak__ isterseniz **<@${msg.client.user.id}> pre değiştir ${newCode} ${guildId}** şeklinde yazıp premiumunu **her yerde** kullanabirsiinn!!\n\n` +
                        `• Ve en önemlisi *seni seviyorum* 💗`
                    ),
                    database.updateFile("premium", {
                        $set: {
                            [newName]: premiumFile[newName]
                        }
                    })
                ]);

                // Eğer kod kullanıcıya gönderilemediyse bot sahibine gönder
                if (!isUserSent) await sendMessage(
                    ownerId,
                    `• Premiumu satın alan kişiye mesaj atamadım!\n` +
                    `• Şimdi sana atacağım premium kodunu <@${userId}> - **${Util.escapeMarkdown(user.displayName)}** adlı kişiye vermeyi unutma\n` +
                    `• **Kod:** ${newCode}`
                );

                return errorEmbed(
                    `<@${userId}> adlı kişiye özel premium kodu başarıyla oluşturuldu${isUserSent ? " ve ona özel mesajdan premium kodunu ve nasıl kullanması gerektiğini anlattım!" : " ama DM'si açık olmadığı için nasıl kullanılacağını anlatamadım :("}`,
                    "success"
                );
            }

            // Eğer süreyi uzatmak istiyorsa
            case "uzat": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}pre kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
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
                        `• ${prefix}pre uzat ${premiumCode} 1 ay\n` +
                        `• ${prefix}pre uzat ${premiumCode} 25 gün 10 dakika 5 saniye\n` +
                        `• ${prefix}pre uzat ${premiumCode} sınırsız`
                    );

                    // Eğer sınırsız ise
                    premiumData.totalTime = null;
                    premiumData.expiresTimestamp = null;
                }
                // Eğer sınırsız değilse
                else {
                    premiumData.totalTime += time;
                    premiumData.expiresTimestamp += time;

                    Util.maps.guildPremiums.set(premiumGuildId,
                        Util.setTimeout(async () => {
                            const newPremiumFile = await database.getFile("premium");

                            const premiumGuildId = getPremiumGuildId(premiumCode);

                            // Eğer kod daha önceden silinmişse hiçbir şey döndürme
                            if (!premiumGuildId) return;

                            const newPremiumData = newPremiumFile[premiumGuildId];

                            // Veriyi sil ve yenisini oluştur
                            delete newPremiumFile[premiumGuildId];

                            const newName = `${premiumGuildId} - ${Date.now()}`;
                            newPremiumFile[newName] = {
                                ...newPremiumData,
                                isFinished: true,
                            };
                            const [guildName] = await Promise.all([
                                Util.getGuildNameOrId(msg.client, premiumGuildId, language),
                                database.updateFile("premium", {
                                    $unset: {
                                        [premiumGuildId]: ""
                                    },
                                    $set: {
                                        [newName]: newPremiumFile[newName]
                                    }
                                })
                            ]);

                            const {
                                authorId: premiumAuthorId,
                                expiresTimestamp,
                                startedTimestamp
                            } = newPremiumData;

                            // Kullanıcıya ve bot sahibine bilgilendirme mesajı gönder
                            sendMessage(
                                premiumAuthorId,
                                `• Heyy, ${guildName} sunucusunun premium'unun tükendiğini görüyorum :(\n\n` +
                                `• Premium'dan memnunsanız veya tekrar satın almak istiyorsanız, destek sunucuma gelebilirsiniz!!\n\n` +
                                `• ${discordInviteLink}`
                            );
                            sendMessage(
                                ownerId,
                                `**> PREMİUM BİLGİLENDİRME**\n\n` +
                                `• ${guildName} - **(${premiumGuildId})** sunucunun premium'u bitmiştir\n` +
                                `• **Satın alan kişi:** <@${premiumAuthorId}> - (${premiumAuthorId})\n` +
                                `• **Kullandığı süre:** ${Time.duration(expiresTimestamp - startedTimestamp, "tr")}`
                            );
                        }, premiumData.totalTime)
                    );
                }

                // Database'ye kaydet
                await database.updateFile("premium", {
                    $set: {
                        [`${premiumGuildId}.totalTime`]: premiumData.totalTime,
                        [`${premiumGuildId}.expiresTimestamp`]: premiumData.expiresTimestamp
                    }
                });

                return errorEmbed(`**${premiumCode}** adlı kodun süresi **${time != 0 ? Time.duration(time, language) : "sınırsız"}** uzatılmıştır`, "success");
            }

            // Eğer premium kodunu silmek istiyorsa
            case "sil": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                const premiumCodeOrGuildId = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCodeOrGuildId) return errorEmbed(
                    `Lütfen yetkililerden aldığınız premium komutu giriniz\n\n` +
                    `**Örnek**\n` +
                    `• ${prefix}pre kullan ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                let premiumGuildId = getPremiumGuildId(premiumCodeOrGuildId);
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

                // Veriyi sil ve yenisini oluştur
                delete premiumFile[premiumGuildId];

                const newName = `${premiumGuildId} - ${Date.now()}`;
                premiumFile[newName] = {
                    ...premiumData,
                    isFinished: true,
                };

                // Sunucunun shard'ına git ve timeout verisini durdur
                await Promise.all([
                    msg.client.shard.broadcastEval(
                        (client, premiumGuildId) => {
                            const pathModule = require("path");
                            const Util = require(pathModule.resolve(path, "Helpers", "Util.js"));
                            const timeout = Util.maps.guildPremiums.get(premiumGuildId);

                            // Eğer timeout verisi varsa durdur
                            if (timeout !== undefined) {
                                clearTimeout(timeout);
                                Util.maps.guildPremiums.delete(premiumGuildId);
                            }
                        },
                        {
                            shard: Util.shardId(premiumGuildId),
                            context: {
                                premiumGuildId,
                                path: __dirname.split(`${path.sep}Commands`)[0]
                            }
                        }
                    ),
                    database.updateFile("premium", {
                        $unset: {
                            [premiumGuildId]: ""
                        },
                        $set: {
                            [newName]: premiumFile[newName]
                        }
                    })
                ])

                return errorEmbed(`**${premiumCodeOrGuildId}** ${isNaN(premiumCodeOrGuildId) ? "koduna" : "ID'sine"} karşılık gelen premium kodu başarıyla silinmiştir`, "success");
            }

            // Eğer premiuma sahip olan bütün sunucuları görmek istiyorsa
            case "sunucu": {
                // Eğer kişi bot sahibi değilse direkt hata döndür
                if (!isOwner) return errorEmbed(
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `${options}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                );

                // Bütün premium verilerini bir diziye aktar ve sırala
                const allPremiumCodes = Object.entries(await database.getFile("premium"))
                    .sort(
                        ([_, firstData], [__, secondData]) => {
                            const firstExpression = firstData.expiresTimestamp;
                            const secondExpression = secondData.expiresTimestamp;

                            // Eğer iki premium verisinin daha kullanılmamışsa
                            if (!firstExpression && !secondExpression) return secondData.createdTimestamp - firstData.createdTimestamp;

                            // Eğer ilk premium verisi daha kullanılmamışsa
                            if (!firstExpression) return -1;

                            // Eğer ikinci premium verisi daha kullanılmamışsa
                            if (!secondExpression) return 1;

                            return secondExpression - firstExpression;
                        }
                    );

                const clientAvatar = msg.client.user.displayAvatarURL();

                return createMessageArrows({
                    msg,
                    array: allPremiumCodes,
                    async arrayValuesFunc({
                        result: [_, {
                            authorId: userId,
                            code,
                            isUse,
                            expiresTimestamp,
                            totalTime,
                            isFinished
                        }],
                        length,
                        index
                    }) {
                        const duration = totalTime !== null ? Time.duration(totalTime, language) : "__**Sınırsız**__";
                        if (isFinished) return `• \`#${length - index}\` ${EMOJIS.no} __${code}__ **=> Süresi bitmiş** - ${duration} - <@${userId}>`;

                        const expiresTime = expiresTimestamp - Date.now();
                        const expiresTimePercent = (1 - expiresTime / totalTime) * 100;
                        const remainTime = Time.duration(expiresTimestamp, language, { toNow: true });

                        return `• \`#${length - index}\` ${EMOJIS.yes} __${code}__ **=> ${isUse ? "Aktif" : "Aktif değil"}** - ${duration} - <@${userId}>${expiresTimestamp ? ` - %${expiresTimePercent.toFixed(2)} tamamlandı - (${remainTime} kaldı)` : ""}`
                    },
                    embed: {
                        author: {
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        },
                        description: `**• Botta toplamda __${Util.toHumanize(allPremiumCodes.length)}__ tane premium verisi bulundu**`,
                        thumbnail: clientAvatar,
                    },
                    pageJoin: "\n\n",
                    VALUES_PER_PAGE: 10
                });
            }

            default:
                return errorEmbed(
                    messages.enter(options),
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
        }

    },
};