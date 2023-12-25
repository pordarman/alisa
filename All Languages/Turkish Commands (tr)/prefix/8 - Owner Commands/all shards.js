"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json")
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "shard", // Komutun ismi
    id: "shard", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "shard",
        "shards",
        "allshards"
    ],
    description: "Bütün shard'ların bilgilerini gösterir", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>shard", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
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

        const allShardsInfo = await msg.client.shard.broadcastEval(
            client => ({
                id: client.shard.ids[0],
                guildsCount: client.guilds.cache.size,
                channelsCount: client.channels.cache.size,
                usersCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                ping: client.ws.ping
            })
        );

        const SHARDS_PER_PAGE = 9,
            length = allShardsInfo.length,
            MAX_PAGE_NUMBER = Math.ceil(length / SHARDS_PER_PAGE);

        const clientAvatar = msg.client.user.displayAvatarURL();

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Embed mesajının daha güzel gözükmesi için ekstra boşluklar bırak
        const extraSpace = "\u200b ".repeat(7);

        // Sayfada gözükecek shardları database'den çekme fonksiyonu
        function getShards(pageNum, limit) {
            const startIndex = (pageNum - 1) * limit
            const resultArray = [];
            for (let index = startIndex; index < length && resultArray.length < limit; ++index) {
                try {
                    const {
                        id,
                        guildsCount,
                        channelsCount,
                        usersCount,
                        ping
                    } = allShardsInfo[index];

                    resultArray.push({
                        name: `${extraSpace}__Shard ID #${Util.toHumanize(id, language)}__`,
                        value: `• **Sunucu sayısı:** ${Util.toHumanize(guildsCount, language)}\n` +
                            `• **Kullanıcı sayısı:** ${Util.toHumanize(usersCount, language)}\n` +
                            `• **Kanal sayısı:** ${Util.toHumanize(channelsCount, language)}\n` +
                            `• **Bot gecikmesi:** ${Util.toHumanize(ping, language)}`,
                        inline: true
                    });
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
            return pages.get(pageNum) ?? getShards(pageNum, SHARDS_PER_PAGE)
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
                .addFields(...page)
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
        const leftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftArrow)
            .setCustomId("COMMAND_BUTTON_LEFT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == 1);

        const deleteButton = new ButtonBuilder()
            .setEmoji(EMOJIS.delete)
            .setCustomId("COMMAND_BUTTON_DELETE")
            .setStyle(ButtonStyle.Danger)

        const rightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightArrow)
            .setCustomId("COMMAND_BUTTON_RIGHT")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNumber == MAX_PAGE_NUMBER);

        // Her yerde yeni bir ActionRowBuilder oluşturmak yerine hepsini bu fonksiyondan çekeceğiz
        function createRowBuilder() {
            return new ActionRowBuilder()
                .addComponents(
                    leftButton,
                    deleteButton,
                    rightButton,
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

                case "COMMAND_BUTTON_LEFT":
                    // Sağ okları yeniden aktif et    
                    rightButton.setDisabled(false);

                    // Kaç sayfa geriye gideceğini hesapla
                    pageNumber = Math.max(1, pageNumber - 1);

                    // Eğer en başa geldiysek sol okları deaktif et
                    if (pageNumber == 1) {
                        leftButton.setDisabled(true);
                    }
                    break;

                default:
                    // Sol okları yeniden aktif et    
                    leftButton.setDisabled(false);

                    // Kaç sayfa ileriye gideceğini hesapla
                    pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + 1);

                    // Eğer en sona geldiysek sağ okları deaktif et
                    if (pageNumber == MAX_PAGE_NUMBER) {
                        rightButton.setDisabled(true);
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
            leftButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            deleteButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            rightButton
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

    },
};