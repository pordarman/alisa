"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const path = require("path");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "alisa",
        en: "alisa"
    },
    id: "alisa", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "alisa"
        ],
        en: [
            "alisa"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bot ile ilgili verileri gösterir",
        en: "Shows data about the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>alisa <Seçenekler>",
        en: "<px>alisa <Options>"
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
        args,
        prefix,
        authorId,
        language,
        errorEmbed
    }) {
        const {
            commands: {
                alisa: messages
            },
            others: otherMessages,
            switchs: {
                alisa: switchKey
            }
        } = allMessages[language];

        switch (switchKey(args[0]?.toLocaleLowerCase(language))) {

            // Eğer kullanıcı sıralamasını görmek istiyorsa
            case "leaderboard": {
                const sortUsers = Object.entries(alisa.usersCommandUses)
                    .sort(([_, uses1], [__, uses2]) => uses2 - uses1);

                const userIndex = Util.binarySearch(sortUsers, alisa.usersCommandUses[authorId], authorId);
                const clientAvatar = msg.client.user.displayAvatarURL();

                return createMessageArrows({
                    msg,
                    array: sortUsers,
                    async arrayValuesFunc({ result: [userId, commandUses], index }) {
                        return `• \`#${Util.toHumanize(index + 1, language)}\` ${index == 0 ? "👑 " : ""}<@${userId}> => **${Util.toHumanize(commandUses, language)}** ${messages.times}`
                    },
                    embed: {
                        author: {
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        },
                        description: messages.lb.description({
                            length: Util.toHumanize(sortUsers.length, language),
                            userIndex: Util.toHumanize(userIndex + 1, language),
                            commandUses: Util.toHumanize(alisa.usersCommandUses[authorId], language)
                        }),
                        thumbnail: clientAvatar,
                    },
                    forwardAndBackwardCount: 20,
                    VALUES_PER_PAGE: 20,
                    language
                });
            }

            // Eğer komutların kaç kere kullanıldığını görmek istiyorsa
            case "commands": {

                // Komutları kullanım sırasına göre sırala
                const allCommandsSort = [...Util.maps.categoryCommands.get(language).get(otherMessages.allCommands).values()]
                    .filter(command => !command.ownerOnly && !command.addHelpCommand && alisa.commandUses[command.id].total > 0)
                    .sort(({ id: a }, { id: b }) => alisa.commandUses[b].total - alisa.commandUses[a].total);
                const allCommandsArray = [];

                let totalUsageCount = 0;

                // Komutların kullanım sayısını kaydet ve yeni diziye aktar
                for (let i = 0; i < allCommandsSort.length; ++i) {
                    const command = allCommandsSort[i];
                    const usage = alisa.commandUses[command.id].total;

                    totalUsageCount += usage;

                    allCommandsArray.push(`    "${command.name}": "${Util.toHumanize(usage, language)} ${messages.times}"${allCommandsSort.length - 1 != i ? "," : ""}`)
                }

                // Bütün komutları discord mesaj karakteri sınırlamasına göre sırala
                const allCommands = Util.splitMessage({
                    arrayString: allCommandsArray,
                    joinString: "\n",
                    firstString: `// ${messages.commands.description(Util.toHumanize(totalUsageCount))}\n` +
                        `const commandUses = {\n`,
                    limit: 1900
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < allCommands.length; ++i) {
                    await msg.channel.send(
                        `\`\`\`js\n` +
                        `${allCommands[i]}\n` +
                        `${allCommands.length - 1 == i ? "}" : ""}\`\`\``
                    );

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
            }

                break;

            // Eğer toplamda kaç kişi kayıt edildi vs. görmek istiyorsa
            case "total": {
                const clientAvatar = msg.client.user.displayAvatarURL();
                const allRegistersToArray = Object.entries(await database.getFile("registers"));

                const allRegistersCount = {
                    boy: 0,
                    girl: 0,
                    member: 0,
                    bot: 0,
                    total: 0
                };

                // Şu ana kadar kaç kişi kayıt edilmiş hesapla
                for (let i = 0; i < allRegistersToArray.length; i++) {
                    const [_, currGuildData] = allRegistersToArray[i];

                    for (const key in currGuildData) {
                        allRegistersCount[key] += currGuildData[key]
                    }
                }

                // Bütün shardlarda dolaş ve kaç sunucu ve sunucuların kaçı kayıt türüni üyeli olarak ayarlamış hesapla
                const allShards = await msg.client.shard.broadcastEval(
                    (client, path) => {
                        const pathModule = require("path");

                        const Util = require(pathModule.resolve(path, "Helpers", "Util.js"));

                        return {
                            guildSize: client.guilds.cache.size,
                            registerMemberSize: Util.maps.registerOptions.size
                        };
                    },
                    {
                        context: __dirname.split(`${path.sep}Commands`)[0]
                    }
                );
                let totalGuildsSize = 0;
                let totalTypeSize = 0;
                for (let i = 0; i < allShards.length; i++) {
                    const {
                        guildSize,
                        registerMemberSize
                    } = allShards[i];
                    totalGuildsSize += guildSize;
                    totalTypeSize += registerMemberSize;
                };

                const sortRegisterGuilds = allRegistersToArray
                    .sort(([_, firstData], [__, secondData]) => secondData.total - firstData.total)
                    .slice(0, 8);

                // En fazla kayıt yapan 8 sunucunun isimlerini çek çek
                const top8GuildNamesObject = await Util.getGuildNames(
                    msg.client,
                    sortRegisterGuilds
                        .map(([guildId]) => guildId)
                );

                // Sunucu isimlerini düzgün bir şekilde yazdır
                const top8Register = Util.stringOr(
                    Util.mapAndJoin(
                        sortRegisterGuilds,
                        ([guildId, guildData], index) => `• ${Util.stringToEmojis(index + 1)} **${top8GuildNamesObject[guildId] || `❓ ${messages.unknown}`} [${Util.toHumanize(guildData.total, language)}]**`,
                        "\n"
                    ),
                    language
                );

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar
                    })
                    .addFields(
                        {
                            name: `${messages.total.registered} (${Util.toHumanize(allRegistersCount.total, language)})`,
                            value: `${EMOJIS.boy} **${otherMessages.roleNames.boy}:** ${Util.toHumanize(allRegistersCount.boy, language)}\n` +
                                `${EMOJIS.girl} **${otherMessages.roleNames.girl}:** ${Util.toHumanize(allRegistersCount.girl, language)}\n` +
                                `${EMOJIS.member} **${otherMessages.roleNames.member}:** ${Util.toHumanize(allRegistersCount.member, language)}\n` +
                                `${EMOJIS.bot} **${otherMessages.roleNames.bot}:** ${Util.toHumanize(allRegistersCount.bot, language)}`,
                            inline: true
                        },
                        {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        },
                        {
                            name: `${messages.total.type} (${Util.toHumanize(totalGuildsSize, language)})`,
                            value: `👫 **${messages.total.gender}:** ${Util.toHumanize(totalGuildsSize - totalTypeSize, language)}\n` +
                                `👤 **${messages.total.member}:** ${Util.toHumanize(totalTypeSize, language)}`,
                            inline: true
                        },
                        {
                            name: `📈 ${messages.total.most}`,
                            value: top8Register
                        }
                    )
                    .setColor("#9e02e2")
                    .setThumbnail(clientAvatar)
                    .setTimestamp();

                return msg.reply({
                    embeds: [
                        embed
                    ]
                });
            }

            // Eğer kayıt yapan bütün sunucuların sırasını görmek istiyorsa
            case "guilds": {

                // Bütün sunucuları kayıt sırasına göre sırala
                const allRegisterFile = await database.getFile("registers");
                const sortGuildRegisterEntries = Object.entries(allRegisterFile)
                    .sort(([_, data1], [__, data2]) => data2.total - data1.total);

                const sortGuildRegisterKeys = sortGuildRegisterEntries.map(([guildId]) => guildId);

                // Eğer komutu kullana sunucu daha önce hiç kayıt yapmamışsa -1 döndür
                const guildIndex = guildId in allRegisterFile ? Util.binarySearch(sortGuildRegisterEntries, allRegisterFile[guildId].total, guildId, {
                    findNumberCallback: (arr, index) => arr[index][1].total,
                    findIdCallback: (arr, index) => arr[index][0]
                }) : -1;

                const clientAvatar = msg.client.user.displayAvatarURL();

                return createMessageArrows({
                    msg,
                    array: sortGuildRegisterEntries,
                    async result({
                        startIndex,
                        limit
                    }) {
                        const sortSliceArray = sortGuildRegisterKeys.slice(startIndex, startIndex + limit);
                        const allGuildNames = await Util.getGuildNames(
                            msg.client,
                            sortSliceArray
                        );

                        return sortSliceArray.map(
                            (guildId, index) => `• \`#${Util.toHumanize(startIndex + index + 1, language)}\` ${allGuildNames[guildId] || `❓ ${messages.unknown}`} [${Util.toHumanize(allRegisterFile[guildId].total)}]`
                        )
                    },
                    embed: {
                        author: {
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        },
                        description: messages.guilds.embed.description({
                            length: Util.toHumanize(sortGuildRegisterEntries.length, language),
                            guildIndex: Util.toHumanize(guildIndex + 1, language),
                            total: Util.toHumanize(allRegisterFile[guildId]?.total ?? 0, language)
                        }),
                        thumbnail: clientAvatar,
                    },
                    forwardAndBackwardCount: 20,
                    VALUES_PER_PAGE: 20,
                    language
                });
            }

            // Eğer Alisa'nın kim olduğunu öğrenmek istiyorsa
            case "who": {
                const clientAvatar = msg.client.user.displayAvatarURL();
                const addedGuilds = Object.values(alisa.guildAddLeave.leave);
                const length = addedGuilds.length;

                const NOW_TIME = Date.now();
                const ONE_DAY = 1000 * 60 * 60 * 24;

                // Son 1 günde kaç kişi eklediğini hesapla
                let lastOneDay = 0;
                for (let index = length - 1; index >= 0; index--) {
                    const guildTimestamp = addedGuilds[index];

                    // Eğer son 24 saatte eklenmemişse döngüyü bitir
                    if (NOW_TIME - guildTimestamp > ONE_DAY) break;

                    lastOneDay += 1;
                }

                const username = Util.escapeMarkdown(msg.client.user.displayName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${username} ${messages.who.who}?`,
                        iconURL: clientAvatar
                    })
                    .setDescription(
                        messages.who.description({
                            username,
                            createdTimestamp: Util.msToSecond(msg.client.user.createdTimestamp),
                            prefix,
                            lastOneDay: Util.toHumanize(lastOneDay, language),
                            length: Util.toHumanize(length, language)
                        })
                    )
                    .setImage("https://media.giphy.com/media/W5eV84IFjKpAnwYPKc/giphy.gif")
                    .setThumbnail(clientAvatar)
                    .setColor("#9e02e2")
                    .setFooter({
                        text: messages.who.footer
                    })

                return msg.reply({
                    embeds: [
                        embed
                    ]
                });
            }

            // Eğer geçerli bir seçenek girmediyse
            default:
                return errorEmbed(
                    messages.enterOption(prefix)
                )
        }
    }
};