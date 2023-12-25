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
    description: "Shows everything related to Premium", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>pre <Options>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        guildId,
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
            `**• Use ${prefix}${this.name} <code> =>** Allows you to use a premium code given by an official`,
            `**• ${prefix}${this.name} replace <serverId> =>** Allows to transfer premium features of one server to another server`,
            `**• ${prefix}${this.name} duration =>** Shows this server's channel premium duration`,
            `**• ${prefix}${this.name} features =>** Allows you to see features exclusive to Premium`,
            `**• ${prefix}${this.name} price =>** Allows you to see the prices of Premium`
        ];

        const premiumFile = database.getFile("premium", "other");

        // Girilen Premium kodunun verisini döndür
        function getPremiumGuildId(premiumCode) {
            return Object.entries(premiumFile).find(([, value]) => value.code === premiumCode)?.[0];
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
                `\n**• Create ${prefix}${this.name} <personId> =>** Adds a special premium to the person you tag`,
                `**• ${prefix}${this.name} extend <code> =>** Extends the premium duration of the code you entered`,
                `**• ${prefix}${this.name} delete <code> =>** You delete a server's premium`,
                `**• ${prefix}${this.name} servers =>** Shows all people and servers who have purchased Premium`,
            );
        }

        const PREMIUM_CODE_LENGTH = 8;

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer kullanıcı kodunu kullanmak istiyorsa
            case "use": {

                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Please enter the premium command you received from the authorities\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} use ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `I couldn't find the premium code corresponding to **${premiumCode}**!\n\n` +
                    `• If you purchased premium and cannot activate it, you can come to __[My Support Server](${discordInviteLink})__ and get support from the authorities`
                )

                const {
                    authorId: premiumAuthorId,
                    isUse,
                    totalTime,
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(`Only the person who purchased this premium code (<@${premiumAuthorId}>) can use it you stupid thing :(`);

                // Eğer kod zaten kullanılıyorsa
                if (isUse) return errorEmbed(
                    `The premium code corresponding to **${premiumCode}** already has a server ( ${await Util.getGuild(msg.client, premiumGuildId)?.name || premiumGuildId} )\n\n` +
                    `• If you want to transfer your premium to another server, you can transfer your premium to another server by typing **${prefix}${this.name} change**`
                );

                // Eğer o sunucuda bir premium bulunuyorsa
                if (premiumFile[guildId]) return errorEmbed(`Wellyy... ${await Util.getGuildNameOrId(msg.client, guildId, language)} server already has a premium, you stupid thing :(`);

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
                                `• Heyy, I see that ${guildName} server seems to have run out of premium :(\n\n` +
                                `• If you are satisfied with the premium or want to buy it again, you can come to my support server.!!\n\n` +
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

                return errorEmbed(`Premium code has been successfully activated and can be used! ${await Util.getGuildNameOrId(msg.client, guildId, language)} server now has __very, very special advantagesp__!!`, "success");
            }

            // Eğer premiumu başka bir sunucuya aktartmak istiyorsa
            case "change": {
                const premiumCode = args[1];

                // Eğer premium kodunu girmemişse
                if (!premiumCode) return errorEmbed(
                    `Please enter the premium command you received from the authorities\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} use ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const premiumGuildId = getPremiumGuildId(premiumCode);
                const premiumData = premiumFile[premiumGuildId];

                // Eğer premium kodu bulunamadıysa
                if (!premiumData) return errorEmbed(
                    `I couldn't find the premium code corresponding to **${premiumCode}**!\n\n` +
                    `• If you purchased premium and cannot activate it, you can come to __[My Support Server](${discordInviteLink})__ and get support from the authorities`
                )

                const {
                    authorId: premiumAuthorId
                } = premiumData;

                // Eğer komutu kullanan kişi kodun sahibi değilse
                if (premiumAuthorId != authorId) return errorEmbed(`Only the person who purchased this premium code (<@${premiumAuthorId}>) can use it you stupid thing :(`);

                // Eğer premium kodu zaten kullanılmamışsa
                if (isNaN(premiumGuildId)) return errorEmbed(
                    `No server is already defined in the premium code corresponding to **${premiumCode}**!\n\n` +
                    `• If you want to use the premium code, you can write **${prefix}${this.name} use <premiumCode>**\n\n` +
                    `**Example**\n` +
                    `• ${prefix}${this.name} use ${randomCode(PREMIUM_CODE_LENGTH)}`
                );

                const newGuildId = args[2];

                // Eğer sunucu ID'si girilmemişse veya düzgün bir ID girilmemişse
                if (
                    !newGuildId ||
                    !(/^\d{17,20}$/.test(newGuildId))
                ) return errorEmbed("Please enter the ID of the server to which you will transfer the premium feature");

                // Eğer girdiği sunucu ID'si premium sunucusunun ID'siyle aynıysa
                if (premiumGuildId == newGuildId) return errorEmbed(`The premium code you entered is already used on the ${await Util.getGuildNameOrId(msg.client, serverId, language)} server`);

                // Eğer girdiği sunucuda bir premium bulunuyorsa
                if (premiumFile[newGuildId]) return errorEmbed(`Wellyy... **${await Util.getGuild(msg.client, newGuildId)?.name || `${newGuildId}** has ID**`} **there is already a premium on the server you stupid thing :(`)

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

                return errorEmbed(`Premium code has been successfully activated and can be used! ${await Util.getGuildNameOrId(msg.client, newGuildId, language)} server now has __very, very special advantagesp__!!`, "b")
            }

            // Eğer premiumun ne zaman biteceğini görmek istiyorsa
            case "remain":
            case "remaintime":
            case "expires": {
                // Eğer bu sunucuda premium yoksa
                if (!premium) return errorEmbed(`There is no premium defined on this server :(`);

                const {
                    expiresTimestamp
                } = premium;

                // Eğer premium sınırsız ise
                if (expiresTimestamp === null) return msg.reply(`• The premium on this server will **NEVER** end oleyy!! 🎉`);

                const expiresTimestampInSecond = Math.round(expiresTimestamp / 1000);
                return msg.reply(
                    `• The premium on this server will expire on **<t:${expiresTimestampInSecond}:F> - <t:${expiresTimestampInSecond}:R>**\n` +
                    `• So it will end after __${Time.duration(expiresTimestampInSecond, language, true)}__`
                );
            }

            // Eğer premium özelliklerini görmek istiyorsa
            case "features":
            case "feature": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        `• To find out the price information, you can write **${prefix}${this.name} price**\n\n` +
                        `• Heyy, I see you're thinking of buying premium, then you've come to the right place\n\n` +
                        `__**• Let me briefly tell you about the premium features.**__\n` +
                        ` ├> You can use it as you wish without any waiting period for any command\n` +
                        ` ├> You can make your server a better place with many premium-specific commands\n` +
                        ` ├> You can see the features coming to the bot before other users\n` +
                        ` ├> After your premium ends, none of your data will be deleted and you can use it without setting anything when you get premium again\n` +
                        ` ├> You have a special role on my support server :3\n` +
                        ` └> And if you don't like it within 1 week, your money will be refunded immediately.!\n\n` +
                        `• If you want to get premium, just come to __**[My Support Server](${discordInviteLink})**__ and open a ticket\n\n` +
                        `• And most importantly *I love you..* 💗`
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
            case "price":
            case "pricing": {
                const clientAvatar = msg.client.user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar,
                    })
                    .setDescription(
                        `${premium ? "• Heyyy I see that premium is already activated on this server!\n\n" : ""}` +
                        `• To learn about premium features, you can write **${prefix}${this.name} features**\n\n` +
                        `• If you don't like it within 1 week, your money will be refunded.!\n\n` +
                        `• **1 month =>** __3__ Dollar 💵\n` +
                        `• **3 month =>** __6__ Dollar 💵\n` +
                        `• **6 month =>** __10__ Dollar 💵\n` +
                        `• **Unlimited =>** __20__ Dollar 💵\n\n` +
                        `• We only accept **Papara, Ininal and IBAN** as payment\n\n` +
                        `• If you want to get premium, just come to __**[My Support Server](${discordInviteLink})**__ and open a ticket`
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
                    createdTimestamp: Date.now()
                }
                database.writeFile(premiumFile, "premium", "other");

                const isUserSent = await sendMessage(
                    userId,
                    `• Psst, pssttt I heard that you bought the premium!!! I can't thank you enough...\n\n` +
                    `• ||${newCode}|| Here you go, I sent you the code you need to activate the premium. You can go to the server you want and write **.pre use ||${newCode}||** and give that server __very advantageous features__.!!\n\n` +
                    `• And if you want to __transfer your premium to another server__** <@${msg.client.user.id}> pre change ||${newCode}|| You can use your premium **anywhere** by typing ${guildId}**!!\n\n` +
                    `• And most importantly *I love you* 💗`
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
                                `• Heyy, I see that ${guildName} server seems to have run out of premium :(\n\n` +
                                `• If you are satisfied with the premium or want to buy it again, you can come to my support server!!\n\n` +
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
                            if (!firstExpression && !secondExpression) return secondData.createdTimestamp - firstData.createdTimestamp;

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
                    `Please enter an option\n\n` +
                    `**🗒️ Enterable options**\n` +
                    `${options.join("\n")}`,
                    "warn",
                    30 * 1000 // Mesajı 30 saniye boyunca göster
                )
        }

    },
};