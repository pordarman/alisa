"use strict";
const {
    EMOJIS,
    ownerId,
    botInviteLink,
    discordInviteLink,
    botVersion,
    topgglink
} = require("../../../settings.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    version: discordVersion
} = require("discord.js");
const os = require("os");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "istatistik",
        en: "stat"
    },
    id: "istatistik", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "istatistik",
            "stat",
            "botbilgi",
            "bilgibot",
            "botbilgileri"
        ],
        en: [
            "stat",
            "statistic",
            "statistics"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Botun genel bilgilerini gösterir",
        en: "Shows general information of the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>istatistik",
        en: "<px>stat"
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
        alisa,
        msg,
        guildId,
        language
    }) {

        const {
            commands: {
                istatistik: messages
            }
        } = allMessages[language];

        // Mesaj gecikmesini ölçme
        const messagePingStart = Date.now();
        const ONE_SECOND_FOR_WAIT_COMMAND = 1000;
        const embed = new EmbedBuilder()
            .setDescription(messages.loading(""))
            .setColor("#1536d8");

        const firstSendMessage = await msg.reply({
            embeds: [
                embed
            ]
        });

        // Eğer bir hata olur da mesaj atamazsa hiçbir şey döndürme
        if (!firstSendMessage) return;

        const messageSendPing = Date.now() - messagePingStart
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(messages.loading("."));

        // Mesaj editlemesini ölçme
        const messageEditStart = Date.now();
        const secondSendMessage = await firstSendMessage.edit({
            embeds: [
                embed
            ]
        });
        if (!secondSendMessage) return;

        const messageEditPing = Date.now() - messageEditStart;
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(messages.loading(".."));
        const thirdSendMessage = await secondSendMessage.edit({
            embeds: [
                embed
            ]
        });
        if (!thirdSendMessage) return;

        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(messages.loading("..."));
        const lastSendMessage = await thirdSendMessage.edit({
            embeds: [
                embed
            ]
        });
        if (!lastSendMessage) return;

        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        // Artık bütün gerekli olan bilgileri çekme zamanı

        // Ram kullanımını okuma
        function readMemory(usedMemory) {
            function baytToMegabayt(number, fixed = 0) {
                return (number / 1024 / 1024).toFixed(fixed);
            }
            function baytToGigabayt(number, fixed = 1) {
                return (number / 1024 / 1024 / 1024).toFixed(fixed);
            }

            const gigabayt = baytToGigabayt(usedMemory);
            // Eğer bellek kullanımı 1 gb'yi aştıysa gigabayt'a çevir ve geri döndür
            return parseFloat(gigabayt) >= 1 ?
                `${gigabayt} GB` :
                `${baytToMegabayt(usedMemory)} MB`;
        }

        const clientMe = msg.client.user;
        const clientAvatar = clientMe.displayAvatarURL();

        const totalRam = os.totalmem();
        const freeRam = os.freemem();

        // Bütün sayılabilen verileri bir objeye aktar
        const allCountableDatas = {
            guildsCount: 0,
            usersCount: 0,
            channelsCount: 0,
            rolesCount: 0,
            usedMemory: 0,
        }

        // Bütün verileri yazmaya başla
        const [owner, allShardDatas, databaseVersion] = await Promise.all([
            Util.fetchUserForce(msg.client, ownerId),
            msg.client.shard.broadcastEval(
                (client) => {
                    const resultObject = {
                        guildsCount: 0,
                        usersCount: 0,
                        channelsCount: 0,
                        rolesCount: 0,
                        usedMemory: 0,
                    }
                    resultObject.guildsCount += client.guilds.cache.size;
                    resultObject.channelsCount += client.channels.cache.size;
                    resultObject.usedMemory += process.memoryUsage().heapUsed;

                    // Performanstan tasarruf etmek için bütün sunucularda dolaş ve hepsindeki kullanıcı ve rol sayılarını yazdır
                    client.guilds.cache.forEach(guild => {
                        resultObject.usersCount += guild.memberCount;
                        resultObject.rolesCount += guild.roles.cache.size;
                    });

                    return resultObject
                }
            ),
            database.version()
        ]);

        // Şimdi döndürülen verileri kendi objemize geçiriyoruz
        for (let i = 0; i < allShardDatas.length; i++) {
            const shardData = allShardDatas[i];
            for (const key in shardData) {
                allCountableDatas[key] += shardData[key];
            }
        }

        const usedRamPercent = ((allCountableDatas.usedMemory / totalRam) * 100).toFixed(2);

        // Butonları oluştur
        const allButtons = new ActionRowBuilder()
            .addComponents(
                // Botun davet linki
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.invite)
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.vote)
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(topgglink),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel(messages.buttonLabels.support)
                    .setEmoji("🎉")
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordInviteLink)
            );

        embed
            .setAuthor({
                name: clientMe.displayName,
                iconURL: clientAvatar
            })
            .setDescription(
                messages.lastReboot(
                    Util.msToSecond(alisa.lastUptimeTimestamp)
                )
            )
            .addFields(
                {
                    name: messages.botInformation.name,
                    value: messages.botInformation.value({
                        clientUsername: Util.escapeMarkdown(clientMe.username),
                        id: clientMe.id,
                        createdTimestamp: Util.msToSecond(clientMe.createdTimestamp),
                        usedMemory: readMemory(allCountableDatas.usedMemory),
                        usedRamPercent
                    }),
                    inline: true
                },
                {
                    name: messages.delayInformation.name,
                    value: messages.delayInformation.value({
                        wsPing: Util.toHumanize(msg.client.ws.ping, language),
                        messageSendPing: Util.toHumanize(messageSendPing, language),
                        messageEditPing: Util.toHumanize(messageEditPing, language),
                        databasePing: Util.toHumanize(await database.ping(), language)
                    }),
                    inline: true
                },
                {
                    name: messages.developers.name,
                    value: messages.developers.value(owner),
                },
                {
                    name: messages.serverInformation.name,
                    value: messages.serverInformation.value({
                        channelsCount: Util.toHumanize(allCountableDatas.channelsCount, language),
                        guildsCount: Util.toHumanize(allCountableDatas.guildsCount, language),
                        usersCount: Util.toHumanize(allCountableDatas.usersCount, language),
                        rolesCount: Util.toHumanize(allCountableDatas.rolesCount, language)
                    }),
                    inline: true
                },
                {
                    name: messages.versions.name,
                    value: messages.versions.value({
                        nodeVersion: process.version,
                        discordVersion,
                        databaseVersion,
                        botVersion
                    }),
                    inline: true
                },
                {
                    name: messages.vdsInformation.name,
                    value: messages.vdsInformation.value({
                        vdsName: "Alisa VDS",
                        operatingSystemVersion: os.release(),
                        cpuModel: os.cpus()[0].model,
                        totalRam: readMemory(totalRam),
                        freeRam: readMemory(freeRam)
                    }),
                }
            )
            .setTimestamp();

        await lastSendMessage.edit({
            embeds: [
                embed
            ],
            components: [
                allButtons
            ]
        })
    },
};