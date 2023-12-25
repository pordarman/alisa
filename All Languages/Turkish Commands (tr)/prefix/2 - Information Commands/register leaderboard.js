"use strict";
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {
    EMOJIS
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "sıra", // Komutun ismi
    id: "sıra", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sıra",
        "kayıtsıra",
        "leaderboard",
        "leader",
        "lb"
    ],
    description: "Sunucunun kayıt sıralamasını gösterir", // Komutun açıklaması
    category: "Bilgi komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sıra", // Komutun kullanım şekli
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

        // Eğer komutu kullanan kişi de kayıt yapmışsa sunucuda kaçıncı olduğunu göster
        let guildRank;

        // Kayıt yetkililerini en fazladan en az olacak şekilde sırala
        const allRegisterAuths = Object.entries(guildDatabase.register.authorizedInfos)
            .filter(([_, { countables }]) => countables.total !== undefined)
            .sort(([_, { countables: countablesA }], [__, { countables: countablesB }]) => countablesB.total - countablesA.total)
            .map(([userId, { countables }], index) => {
                switch (userId) {

                    // Eğer kullanıcı komutu kullanan kişiyse
                    case authorId:
                        guildRank = index + 1;
                        return `• ${Util.stringToEmojis(index + 1)} **<@${userId}> ${Util.toHumanize(countables.total || 0, language)} Kayıt sayın • ${Util.getUserRank(countables.total, language) || "Rankın yok"}**`

                    // Eğer kullanıcı bot ise (Yani Alisa ise)
                    case guildMe.id:
                        return `• ${Util.stringToEmojis(index + 1)} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(countables.total || 0, language)}** Kayıt sayım **•** Botların rankı olmaz :)`

                    default:
                        return `• ${Util.stringToEmojis(index + 1)} <@${userId}> **${Util.toHumanize(countables.total || 0, language)}** Kayıt sayısı **•** ${Util.getUserRank(countables.total, language) || "Rankı yok"}`
                }
            });

        const length = allRegisterAuths.length;

        // Eğer bu sunucuda daha önceden hiç kimse kayıt edilmemişse hata döndür
        if (!length) return errorEmbed("Bu sunucuda daha önceden hiç kimse kayıt edilmediği için tablo gösterilemiyor");

        const USERS_PER_PAGE = 15,
            MAX_PAGE_NUMBER = Math.ceil(length / USERS_PER_PAGE),
            guildIcon = guild.iconURL();

        // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
        const pages = new Map();

        // Sayfada gözükecek isimleri database'den çekme fonksiyonu
        function getUsers(pageNum, limit) {
            const startIndex = (pageNum - 1) * limit;
            const resultArray = allRegisterAuths.slice(startIndex, startIndex + limit);

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
                    name: guild.name,
                    iconURL: guildIcon
                })
                .setDescription(
                    `**📈 Sunucunun kayıt sıralaması!** ${guildRank ? `\n**👑 Sen ${length} kişi içinden ${guildRank}. sıradasın**` : ""}\n\n` +
                    `${page.join("\n") || "• Burada gösterilecek hiçbir şey yok..."}`
                )
                .setThumbnail(guildIcon)
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