"use strict";
const {
    EMOJIS,
    ownerId,
    botInviteLink,
    discordInviteLink,
    databaseVersion,
    botVersion
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    version: discordVersion
} = require("discord.js");
const os = require("os");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "istatistik", // Komutun ismi
    id: "istatistik", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "istatistik",
        "stat",
        "botbilgi",
        "bilgibot",
        "botbilgileri"
    ],
    description: "Botun genel bilgilerini gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>istatistik", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Mesaj gecikmesini ölçme
        const messagePingStart = Date.now();
        const ONE_SECOND_FOR_WAIT_COMMAND = 1000;
        const embed = new EmbedBuilder()
            .setDescription(`${EMOJIS.loading} **Veriler alınıyor biraz bekleyiniz**`)
            .setColor("#1536d8");

        const sendMessage = await msg.reply({
            embeds: [
                embed
            ]
        });
        const messageSendPing = Date.now() - messagePingStart
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(`${EMOJIS.loading} **Veriler alınıyor biraz bekleyiniz.**`);

        // Mesaj editlemesini ölçme
        const messageEditStart = Date.now();
        await sendMessage.edit({
            embeds: [
                embed
            ]
        });
        const messageEditPing = Date.now() - messageEditStart;
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(`${EMOJIS.loading} **Veriler alınıyor biraz bekleyiniz..**`);
        await sendMessage.edit({
            embeds: [
                embed
            ]
        });
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(`${EMOJIS.loading} **Veriler alınıyor biraz bekleyiniz...**`);
        await sendMessage.edit({
            embeds: [
                embed
            ]
        });
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
            return gigabayt >= 1 ?
                `${gigabayt} GB` :
                `${baytToMegabayt(usedMemory)} MB`;
        }

        const clientMe = msg.client.user;
        const clientAvatar = clientMe.displayAvatarURL();

        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const usedRam = totalRam - freeRam;
        const usedRamPercent = ((usedRam / totalRam) * 100).toFixed(2);

        // Database pingini ölçme
        const databasePingStart = Date.now();
        database.getFile(guildId);
        database.getFile(guildId);
        database.getFile(guildId);
        const databasePing = Date.now() - databasePingStart;

        const owner = await Util.fetchUserForce(msg.client, ownerId);

        // Bütün sayılabilen verileri bir objeye aktar
        const allCountableDatas = {
            guildsCount: 0,
            usersCount: 0,
            channelsCount: 0,
            rolesCount: 0,
            usedMemory: 0,
        }

        // Bütün verileri yazmaya başla
        const allShardDatas = await msg.client.shard.broadcastEval(
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
        );

        // Şimdi döndürülen verileri kendi objemize geçiriyoruz
        for (let i = 0; i < allShardDatas.length; i++) {
            const shardData = allShardDatas[i];
            for (const key in shardData) {
                allCountableDatas[key] += shardData[key];
            }
        }

        // Butonları oluştur
        const allButtons = new ActionRowBuilder()
            .addComponents(
                // Botun davet linki
                new ButtonBuilder()
                    .setLabel("Beni davet et")
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel("Bana oy ver")
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel("Destek sunucum")
                    .setEmoji("🎉")
                    .setStyle(ButtonStyle.Link)
                    .setURL(discordInviteLink)
            );

        // Milisaniyeyi saniyeye çevirme
        function milisecondsToSeconds(miliseconds) {
            return Math.round(miliseconds / 1000);
        }

        embed
            .setAuthor({
                name: clientMe.displayName,
                iconURL: clientAvatar
            })
            .setDescription(`⏲️ **Son yeniden başlatma:** <t:${milisecondsToSeconds(msg.client.readyTimestamp)}:F> - <t:${milisecondsToSeconds(msg.client.readyTimestamp)}:R>`)
            .addFields(
                {
                    name: "BOT BİLGİLERİ",
                    value: `✏️ **Kullanıcı adım:** ${Util.recreateString(clientMe.displayName)}\n` +
                        `🆔 **Discord ID:** ${clientMe.id}\n` +
                        `📅 **Kuruluş tarihim:** <t:${milisecondsToSeconds(clientMe.createdTimestamp)}:F>\n` +
                        `🎚️ **Ram kullanımı:** ${readMemory(allCountableDatas.usedMemory)} - %${usedRamPercent}`,
                    inline: true
                },
                {
                    name: "GECİKME BİLGİLERİM",
                    value: `📡 **Botun ana gecikmesi:** ${Util.toHumanize(msg.client.ws.ping, language)} ms\n` +
                        `📨 **Mesaj gecikmesi:** ${Util.toHumanize(messageSendPing, language)} ms\n` +
                        `📄 **Mesaj edit gecikmesi:** ${Util.toHumanize(messageEditPing, language)} ms\n` +
                        `📁 **Database gecikmesi:** ${Util.toHumanize(databasePing, language)} ms`,
                    inline: true
                },
                {
                    name: "GELİŞTİRİCİLERİM",
                    value: `👑 **${Util.recreateString(owner?.displayName) ?? "deleted_user"} - ${ownerId}** (Yapımcı)`
                },
                {
                    name: "SUNUCU BİLGİLERİ",
                    value: `💻 **Sunucu sayısı:** ${Util.toHumanize(allCountableDatas.guildsCount, language)}\n` +
                        `👥 **Kullanıcı sayısı:** ${Util.toHumanize(allCountableDatas.usersCount, language)}\n` +
                        `${EMOJIS.channel} **Kanal sayısı:** ${Util.toHumanize(allCountableDatas.channelsCount, language)}\n` +
                        `${EMOJIS.role} **Rol sayısı:** ${Util.toHumanize(allCountableDatas.rolesCount, language)}`,
                    inline: true
                },
                {
                    name: "VERSİYONLAR",
                    value: `🎛️ **Node.js versiyon:** ${process.version}\n` +
                        `🔨 **Discord.js versiyon:** v${discordVersion}\n` +
                        `📒 **Database versiyon:** v${databaseVersion}\n` +
                        `${EMOJIS.alisa} **Alisa versiyon:** v${botVersion}`,
                    inline: true
                },
                {
                    name: "VDS BİLGİLERİ",
                    value: `📝 **VDS adı:** Alisa Bot VDS\n` +
                        `🖥️ **Windows sürümü:** Windows 10 (64 bit)\n` +
                        `🎞️ **CPU:** ${os.cpus()[0].model}\n` +
                        `🔋 **Toplam ram:** ${readMemory(totalRam)} (**Serbest:** ${readMemory(freeRam)})`
                })
            .setTimestamp();

        await sendMessage.edit({
            embeds: [
                embed
            ],
            components: [
                allButtons
            ]
        })
    },
};