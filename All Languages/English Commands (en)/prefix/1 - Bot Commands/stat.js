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
    name: "stat", // Komutun ismi
    id: "istatistik", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "stat",
        "statistic",
        "statistics"
    ],
    description: "Shows general information of the bot", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>stat", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        guildId,
        language,
    }) {

        // Mesaj gecikmesini ölçme
        const messagePingStart = Date.now();
        const ONE_SECOND_FOR_WAIT_COMMAND = 1000;
        const embed = new EmbedBuilder()
            .setDescription(`${EMOJIS.loading} **Data is being received, please wait a moment**`)
            .setColor("#1536d8");

        const sendMessage = await msg.reply({
            embeds: [
                embed
            ]
        });
        const messageSendPing = Date.now() - messagePingStart
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(`${EMOJIS.loading} **Data is being received, please wait a moment.**`);

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
            .setDescription(`${EMOJIS.loading} **Data is being received, please wait a moment..**`);
        await sendMessage.edit({
            embeds: [
                embed
            ]
        });
        await Util.wait(ONE_SECOND_FOR_WAIT_COMMAND);

        embed
            .setDescription(`${EMOJIS.loading} **Data is being received, please wait a moment...**`);
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
                    .setLabel("Invite me")
                    .setEmoji("💌")
                    .setStyle(ButtonStyle.Link)
                    .setURL(botInviteLink),

                // Oy verme linki
                new ButtonBuilder()
                    .setLabel("Vote me")
                    .setEmoji(EMOJIS.shy)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${msg.client.user.id}/vote`),

                // Destek sunucusu linki
                new ButtonBuilder()
                    .setLabel("My support server")
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
            .setDescription(`⏲️ **Last reboot:** <t:${milisecondsToSeconds(msg.client.readyTimestamp)}:F> - <t:${milisecondsToSeconds(msg.client.readyTimestamp)}:R>`)
            .addFields(
                {
                    name: "BOT INFORMATION",
                    value: `✏️ **My username:** ${Util.recreateString(clientMe.displayName)}\n` +
                        `🆔 **Discord ID:** ${clientMe.id}\n` +
                        `📅 **My founding date:** <t:${milisecondsToSeconds(clientMe.createdTimestamp)}:F>\n` +
                        `🎚️ **RAM usage:** ${readMemory(allCountableDatas.usedMemory)} - %${usedRamPercent}`,
                    inline: true
                },
                {
                    name: "MY DELAY INFORMATION",
                    value: `📡 **Bot's main delay:** ${Util.toHumanize(msg.client.ws.ping, language)} ms\n` +
                        `📨 **Message delay:** ${Util.toHumanize(messageSendPing, language)} ms\n` +
                        `📄 **Message edit delay:** ${Util.toHumanize(messageEditPing, language)} ms\n` +
                        `📁 **Database latency:** ${Util.toHumanize(databasePing, language)} ms`,
                    inline: true
                },
                {
                    name: "MY DEVELOPERS",
                    value: `👑 **${Util.recreateString(owner?.displayName) ?? "deleted_user"} - ${ownerId}** (Producer)`
                },
                {
                    name: "SERVER INFORMATION",
                    value: `💻 **Number of servers:** ${Util.toHumanize(allCountableDatas.guildsCount, language)}\n` +
                        `👥 **Number of users:** ${Util.toHumanize(allCountableDatas.usersCount, language)}\n` +
                        `${EMOJIS.channel} **Number of channels:** ${Util.toHumanize(allCountableDatas.channelsCount, language)}\n` +
                        `${EMOJIS.role} **Number of roles:** ${Util.toHumanize(allCountableDatas.rolesCount, language)}`,
                    inline: true
                },
                {
                    name: "VERSIONS",
                    value: `🎛️ **Node.js version:** ${process.version}\n` +
                        `🔨 **Discord.js version:** v${discordVersion}\n` +
                        `📒 **Database version:** v${databaseVersion}\n` +
                        `${EMOJIS.alisa} **Alisa version:** v${botVersion}`,
                    inline: true
                },
                {
                    name: "VDS INFORMATION",
                    value: `📝 **VDS name:** Alisa Bot VDS\n` +
                        `🖥️ **Windows version:** Windows 10 (64 bit)\n` +
                        `🎞️ **CPU:** ${os.cpus()[0].model}\n` +
                        `🔋 **Total ram:** ${readMemory(totalRam)} (**Free:** ${readMemory(freeRam)})`
                }
            )
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