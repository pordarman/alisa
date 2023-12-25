"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "alisa", // Komutun ismi
    id: "alisa", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "alisa"
    ],
    description: "Bot ile ilgili verileri gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>alisa <Seçenek>", // Komutun kullanım şekli
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
        language,
    }) {

        switch (args[0]?.toLocaleLowerCase(language)) {

            // Eğer kullanıcı sıralamasını görmek istiyorsa
            case "top":
            case "lb":
            case "leaderboard":
            case "sıralama":
            case "sıra": {
                const sortUsers = Object.entries(alisa.usersCommandUses)
                    .sort(([_, uses1], [__, uses2]) => uses2 - uses1);

                // Komutu kullanan kişinin kaçıncı sırada olduğunu bul
                function bsSearch(array, number, userIdParam) {
                    let startIndex = 0,
                        endIndex = array.length
                    while (startIndex < endIndex) {
                        let middleIndex = Math.floor((endIndex + startIndex) / 2);
                        const [userId, commandUses] = array[middleIndex];
                        if (commandUses === number) {
                            if (userId == userIdParam) return middleIndex;

                            for (let i = middleIndex - 1; i > -1; --i) {
                                if (array[i][1] != number) break;
                                if (array[i][0] == userIdParam) return i;
                            }
                            for (let i = middleIndex + 1; i < array.length; ++i) {
                                if (array[i][1] != number) break;
                                if (array[i][0] == userIdParam) return i;
                            }

                        } else if (commandUses > number) {
                            startIndex = middleIndex
                        } else {
                            endIndex = middleIndex
                        }
                    }
                    return -1;
                }
                const userIndex = bsSearch(sortUsers, alisa.usersCommandUses[authorId], authorId);

                const clientAvatar = msg.client.user.displayAvatarURL();

                const length = sortUsers.length,
                    USERS_PER_PAGE = 20,
                    MAX_PAGE_NUMBER = Math.ceil(length / USERS_PER_PAGE);

                // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
                const pages = new Map();

                // Sayfada gözükecek kullanıcıları database'den çekme fonksiyonu
                function getUsers(pageNum, limit) {
                    const startIndex = (pageNum - 1) * limit
                    const resultArray = [];
                    for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                        try {
                            const [userId, commandUses] = sortUsers[index];

                            resultArray.push(
                                `\`#${(index + 1)}\` ${index == 0 ? "👑 " : ""}<@${userId}> => **${Util.toHumanize(commandUses, language)}** kere`
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
                    return pages.get(pageNum) ?? getUsers(pageNum, USERS_PER_PAGE)
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
                            `• Botun komutlarını en çok kullanan kişiler\n` +
                            `• Sen **${Util.toHumanize(length, language)}** kişi içerisinden **${Util.toHumanize(userIndex + 1, language)}.** sıradasın! (**__${Util.toHumanize(alisa.usersCommandUses[authorId], language)}__ kullanım**) 🎉\n\n` +
                            page.join("\n")
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
                });

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

                break;

            // Eğer komutların kaç kere kullanıldığını görmek istiyorsa
            case "komut":
            case "komutlar":
            case "command":
            case "commands": {

                // Komutları kullanım sırasına göre sırala
                const allCommandsSort = [...msg.client.categoryCommands[language].get("Tüm komutlar").values()]
                    .filter(command => !command.ownerOnly && !command.addHelpCommand && alisa.commandUses[command.id]?.total > 0)
                    .sort(({ id: a }, { id: b }) => alisa.commandUses[b].total - alisa.commandUses[a].total);
                const allCommandsArray = [];

                let totalUsageCount = 0;

                // Komutların kullanım sayısını kaydet ve yeni diziye aktar
                for (let i = 0; i < allCommandsSort.length; ++i) {
                    const command = allCommandsSort[i];
                    const usage = alisa.commandUses[command.id].total;

                    totalUsageCount += usage;

                    allCommandsArray.push(`    "${command.name}": "${Util.toHumanize(usage, language)} kere"${allCommandsSort.length - 1 != i ? "," : ""}`)
                }

                // Bütün komutları discord mesaj karakteri sınırlamasına göre sırala
                const allCommands = Util.splitMessage({
                    arrayString: allCommandsArray,
                    joinString: "\n",
                    firstString: `// Botun komutları toplamda ${Util.toHumanize(totalUsageCount, language)} kere kullanıldı\n` +
                        `const commandUses = {\n`,
                    limit: 1900
                });

                // Bütün sayfaları teker teker mesaj olarak gönder
                for (let i = 0; i < allCommands.length; ++i) {
                    await msg.channel.send(`\`\`\`js\n` +
                        `${allCommands[i]}\n` +
                        `${allCommands.length - 1 == i ? "}" : ""}\`\`\``
                    );

                    // 500 milisaniye bekle
                    await Util.wait(500)
                }
            }

                break;

            // Eğer toplamda kaç kişi kayıt edildi vs. görmek istiyorsa
            case "tümbilgi":
            case "tüm":
            case "tbilgi":
            case "tümb":
            case "toplam":
            case "all": {
                const clientAvatar = msg.client.user.displayAvatarURL();
                const allRegistersToArray = Object.entries(database.getFile("all registers", "other"));

                let allRegistersCount = {
                    boy: 0,
                    girl: 0,
                    normal: 0,
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

                // Bütün shardlarda dolaş ve kaç sunucu ve sunucuların kaçı kayıt türüni normal olarak ayarlamış hesapla
                const allShards = await msg.client.shard.broadcastEval(
                    client => ({
                        guildSize: client.guilds.cache.size,
                        registerNormalSize: client.registerOptions.size
                    })
                );
                let totalGuildsSize = 0;
                let totalTypeSize = 0;
                for (let i = 0; i < allShards.length; i++) {
                    const {
                        guildSize,
                        registerNormalSize
                    } = allShards[i];
                    totalGuildsSize += guildSize;
                    totalTypeSize += registerNormalSize;
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
                const top8Register = sortRegisterGuilds.map(
                    ([guildId, guildData], index) => `• ${Util.stringToEmojis(index + 1)} **${top8GuildNamesObject[guildId] || "❓ Bilinmiyor"} [${Util.toHumanize(guildData.total, language)}]**`
                );

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.client.user.displayName,
                        iconURL: clientAvatar
                    })
                    .addFields(
                        {
                            name: `KAYIT EDİLEN (${Util.toHumanize(allRegistersCount.total, language)})`,
                            value: `${EMOJIS.boy} **Erkek:** ${Util.toHumanize(allRegistersCount.boy, language)}\n` +
                                `${EMOJIS.girl} **Kız:** ${Util.toHumanize(allRegistersCount.girl, language)}\n` +
                                `${EMOJIS.normal} **Üye:** ${Util.toHumanize(allRegistersCount.normal, language)}\n` +
                                `${EMOJIS.bot} **Bot:** ${Util.toHumanize(allRegistersCount.bot, language)}`,
                            inline: true
                        },
                        {
                            name: "\u200b",
                            value: "\u200b",
                            inline: true
                        },
                        {
                            name: `KAYIT TÜRÜ (${Util.toHumanize(totalGuildsSize, language)})`,
                            value: `👫 **Cinsiyet:** ${Util.toHumanize(totalGuildsSize - totalTypeSize, language)}\n` +
                                `👤 **Normal Kayıt:** ${Util.toHumanize(totalTypeSize, language)}`,
                            inline: true
                        },
                        {
                            name: "📈 En fazla kayıt yapan 8 sunucu",
                            value: top8Register.join("\n") || "• Burada gösterilecek hiçbir şey yok"
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
            case "sunucu":
            case "sunucular":
            case "sunucusıra":
            case "sırasunucu":
            case "guild":
            case "guilds":
            case "guildslb":
            case "lbguilds":
            case "lbguild": {
                // Bütün sunucuları kayıt sırasına göre sırala
                const allRegisterFile = database.getFile("all registers", "other");
                const sortGuildRegisterEntries = Object.entries(allRegisterFile)
                    .sort(([_, data1], [__, data2]) => data2.total - data1.total);

                const sortGuildRegisterKeys = sortGuildRegisterEntries.map(([guildId]) => guildId);

                // Komutu sunucunun kaçıncı sırada olduğunu bul
                function bsSearch(array, number, guildIdParam) {
                    let startIndex = 0,
                        endIndex = array.length
                    while (startIndex < endIndex) {
                        let middleIndex = Math.floor((endIndex + startIndex) / 2);
                        const [guildId, guildData] = array[middleIndex];
                        if (guildData.total === number) {
                            if (guildId == guildIdParam) return middleIndex;

                            for (let i = middleIndex - 1; i > -1; --i) {
                                if (array[i][1] != number) break;
                                if (array[i][0] == guildIdParam) return i;
                            }
                            for (let i = middleIndex + 1; i < array.length; ++i) {
                                if (array[i][1] != number) break;
                                if (array[i][0] == guildIdParam) return i;
                            }

                        } else if (guildData.total > number) {
                            startIndex = middleIndex
                        } else {
                            endIndex = middleIndex
                        }
                    }
                    return -1;
                }

                // Eğer komutu kullana sunucu daha önce hiç kayıt yapmamışsa -1 döndür
                const guildIndex = guildId in allRegisterFile ? bsSearch(sortGuildRegisterEntries, allRegisterFile[guildId].total, guildId) : -1;

                // Bu sunucu
                const REGISTERS_PER_PAGE = 15,
                    length = sortGuildRegisterEntries.length,
                    MAX_PAGE_NUMBER = Math.ceil(length / REGISTERS_PER_PAGE);

                const clientAvatar = msg.client.user.displayAvatarURL();

                // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
                const pages = new Map();

                // Sayfada gözükecek isimleri database'den çekme fonksiyonu
                async function getGuildNames(pageNum, limit) {
                    const startIndex = (pageNum - 1) * limit;
                    const sortSliceArray = sortGuildRegisterKeys.slice(startIndex, startIndex + limit);
                    const allGuildNames = await Util.getGuildNames(
                        msg.client,
                        sortSliceArray
                    );

                    const resultArray = sortSliceArray.map(
                        (guildId, index) => `• \`#${Util.toHumanize(index + 1, language)}\` ${allGuildNames[guildId] || "❓ Bilinmiyor"} [${Util.toHumanize(allRegisterFile[guildId].total)}]`
                    )

                    pages.set(pageNum, resultArray);
                    return resultArray
                }
                async function getPage(pageNum) {
                    return pages.get(pageNum) ?? await getGuildNames(pageNum, REGISTERS_PER_PAGE)
                }

                let pageNumber = 1;

                // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
                async function createEmbed(pageNum) {
                    const page = await getPage(pageNum);
                    return new EmbedBuilder()
                        .setAuthor({
                            name: msg.client.user.displayName,
                            iconURL: clientAvatar
                        })
                        .setDescription(
                            `**• En fazla kayıt yapan sunucu sıralaması __(${Util.toHumanize(length, language)})__\n` +
                            (guildIndex == -1 ?
                                `• Sunucunun sıralaması bulunamadı!` :
                                `• Bu sunucu tam olarak ${Util.toHumanize(guildIndex + 1, language)}. sırada! (**__${Util.toHumanize(allRegisterFile[guildId].total, language)}__ kayıt**) 🎉`
                            ) + "\n\n" +
                            (page.join("\n") || "• Burada gösterilecek hiç bir şey yok...") +
                            "**"
                        )
                        .setThumbnail(clientAvatar)
                        .setColor("DarkPurple")
                        .setFooter({
                            text: `Sayfa ${pageNum}/${MAX_PAGE_NUMBER || 1}`
                        })
                };

                const pageEmbed = await createEmbed(pageNumber);

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
                waitComponents.on("collect", async (button) => {
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

                    const pageEmbed = await createEmbed(pageNumber);

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

                break;

            // Eğer Alisa'nın kim olduğunu öğrenmek istiyorsa
            case "kim":
            case "kimdir":
            case "nedir": {
                const clientAvatar = msg.client.user.displayAvatarURL();
                const addedGuilds = Object.values(alisa.guildAddRemove.add);
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

                const username = Util.recreateString(msg.client.user.displayName);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${username} kimdir?`,
                        iconURL: clientAvatar
                    })
                    .setDescription(
                        `• ${username} **<t:${Math.round(msg.client.user.createdTimestamp / 1000)}:F>** tarihinde tatlı mı tatlı bir bot olarak oluşturuldu\n\n` +
                        `• ${username} aslında ilk public botumun yardımcısı olarak oluşturulmuştu fakat sonradan bu botla uğraşmaktan daha çok zevk aldığımı fark ettim ve ilk botumu kapattım\n\n` +
                        `• Bota hemen hemen her gün farklı bir özellik veya optimizasyon getiriyorum ki bot hızını asla yitirmesin\n\n` +
                        `• Ayrıca sizin verdiğiniz öneriler sayesinde bota birçok yeni ve gelişmiş özellikler getiriyoruz ki botun birçok komutu öneriler sayesinde geldi. **(${prefix}ses komutu, jail sistemi vb.)**\n\n` +
                        `• Son 24 saatte **${Util.toHumanize(lastOneDay, language)}**, toplamda **${Util.toHumanize(length, language)}** sunucuya eklendim!`
                    )
                    .setImage("https://media.giphy.com/media/W5eV84IFjKpAnwYPKc/giphy.gif")
                    .setThumbnail(clientAvatar)
                    .setColor("#9e02e2")
                    .setFooter({
                        text: "İyi ki varsınız <3"
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
                    `Lütfen bir seçenek giriniz\n\n` +
                    `**🗒️ Girilebilir seçenekler**\n` +
                    `**• ${prefix}${this.name} sıra =>** Botun komutlarını en çok kullanan kişiler\n` +
                    `**• ${prefix}${this.name} toplam =>** Şu ana kadar yapılmış kayıtların sayısı\n` +
                    `**• ${prefix}${this.name} komutlar =>** Komutların kaç kere kullanıldığını gösterir\n` +
                    `**• ${prefix}${this.name} sunucu =>** Bütün kayıt yapan sunucu sıralaması\n` +
                    `**• ${prefix}${this.name} kim =>** Alisa kim???`
                )
        }

    },
};