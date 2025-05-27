const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, Message } = require("discord.js");
const { EMOJIS } = require("../../settings.json");
const allMessages = require("../Localizations/Index.js");
const Util = require("../Util.js");

/**
 * @typedef {Object} EmbedOptions
 * @property {{ name: string, iconURL: string }} author
 * @property {String} description
 * @property {string} [thumbnail]
 * @property {string} [color]
 */

/**
 * @typedef {Object} createMessageArrowsOptions
 * @property {Message} msg - Mesaj
 * @property {Array} array - Dizi
 * @property {({ result: any, index: number, length: number, limit: number}) => Promise<String>} arrayValuesFunc - Sayfada gözükecek verileri database'den çekme fonksiyonu
 * @property {({startIndex: number, limit: number}) => Promise <Array>} [result] - Sayfada gözükecek verileri database'den çekme fonksiyonu (Direkt dizi döndürür ve eğer verilmezse arrayValuesFunc kullanılır)
 * @property {"description" | "field"} [putDescriptionOrField="description"] - Embed'de verilerin nasıl gözükeceğini belirleme (Varsayılan: description)
 * @property {string} [authorId=msg.author.id] - Mesajı atan kişinin ID'si (Varsayılan: msg.author.id)
 * @property {EmbedOptions} embed - Embed seçenekleri
 * @property {"long" | "short"} [arrowLength="long"] - Okların uzunluğu (Varsayılan: long)
 * @property {number} [forwardAndBackwardCount=5] - Oklara basıldığında kaç sayfa ileri veya geri gideceğini belirleme (Varsayılan: 5)
 * @property {string} [pageJoin="\n"] - Sayfada gözükecek verileri birleştirme (Varsayılan: \n)
 * @property {number} [VALUES_PER_PAGE=8] - Sayfada kaç veri gözükeceğini belirleme (Varsayılan: 8)
 * @property {"en" | "tr"} [language="tr"] - Dil (Varsayılan: tr)
 * @property {number} [arrowTimeout=1000 * 60 * 5] - Butonların ne kadar süre aktif olacağını belirleme (Varsayılan: 5 dakika)
 */


/**
 * 
 * @param {createMessageArrowsOptions} param0 
 * @returns {Promise<void>}
 */
module.exports = async function createMessageArrows({
    msg,
    array,
    arrayValuesFunc,
    result,
    putDescriptionOrField = "description",
    authorId,
    embed,
    arrowLength = "long",
    forwardAndBackwardCount = 5,
    pageJoin = "\n",
    VALUES_PER_PAGE = 8,
    language = "tr",
    arrowTimeout = 1000 * 60 * 5 // 5 minutes
} = {}) {

    const length = array.length;
    const MAX_PAGE_NUMBER = Math.ceil(length / VALUES_PER_PAGE);
    const messages = allMessages[language].messageArrows;

    authorId ??= msg.author.id;

    // Sayfaları tekrar yüklemek yerine önbelleğe kaydet
    const pages = new Map();

    // Sayfada gözükecek verileri database'den çekme fonksiyonu
    async function getValues(pageNum, limit) {
        const startIndex = (pageNum - 1) * limit;
        let resultArray = [];
        // Eğer direkt diziyi döndüren bir fonksiyon verilmişse
        if (result) resultArray = await result({ startIndex, limit });
        else {

            resultArray.push(
                ...(await Promise.all(
                    array.slice(startIndex, startIndex + limit).map(async (result, index) => {
                        try {
                            return await arrayValuesFunc({
                                result,
                                index: startIndex + index,
                                length,
                                limit
                            });
                        }
                        // Eğer olur da bir hata oluşursa döngüyü geç
                        catch (error) {
                            console.error(error)
                            return allMessages[language].others.somethingWentWrong;
                        }
                    })
                ))
            );
        }
        const resultSting = putDescriptionOrField == "description" ? resultArray.join(pageJoin) : resultArray;

        pages.set(pageNum, resultSting);
        return resultSting
    }
    async function getPage(pageNum) {
        return pages.get(pageNum) ?? await getValues(pageNum, VALUES_PER_PAGE)
    }

    let pageNumber = 1;

    // Girilen sayfa numarasına göre embed'i düzenleme fonksiyonu
    async function createEmbed(pageNum) {
        const page = await getPage(pageNum);
        const embedDescription = "description" in embed ? `${embed.description}\n\n` : "";
        const messageEmbed = new EmbedBuilder()
            .setAuthor({
                name: embed.author.name,
                iconURL: embed.author.iconURL
            })
            .setThumbnail(embed.thumbnail || null)
            .setColor(embed.color || "DarkPurple")
            .setFooter({
                text: `${messages.page} ${pageNum}/${MAX_PAGE_NUMBER || 1}`
            });

        if (putDescriptionOrField == "description") {
            messageEmbed.setDescription(
                embedDescription + Util.stringOr(page, language)
            );
        } else {
            messageEmbed
                .setDescription(embedDescription || null)
                .addFields(...page)
        }

        return messageEmbed;
    };

    const pageEmbed = await createEmbed(pageNumber);

    if (MAX_PAGE_NUMBER <= 1) return msg[msg.author.id == msg.client.user.id ? "edit" : "reply"]({
        embeds: [
            pageEmbed
        ],
        content: undefined,
    });

    const isLong = arrowLength == "long";

    // Mesaja butonlar ekle ve bu butonlar sayesinde sayfalar arasında geçişler yap
    const fastleftButton = isLong ? new ButtonBuilder() // Eğer uzun oklar seçilmişse
        .setEmoji(EMOJIS.leftFastArrow)
        .setCustomId("COMMAND_BUTTON_FASTLEFT")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageNumber == 1) : null;

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

    const fastrightButton = isLong ? new ButtonBuilder() // Eğer uzun oklar seçilmişse
        .setEmoji(EMOJIS.rightFastArrow)
        .setCustomId("COMMAND_BUTTON_FASTRIGHT")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageNumber == MAX_PAGE_NUMBER) : null;

    const allButtons = new ActionRowBuilder();
    const components = [
        leftButton,
        deleteButton,
        rightButton
    ];

    if (isLong) {
        components.unshift(fastleftButton);
        components.push(fastrightButton);
    }

    allButtons.addComponents(
        ...components
    );

    const waitMessage = await msg[msg.author.id == msg.client.user.id ? "edit" : "reply"]({
        content: messages.notWorking,
        embeds: [
            pageEmbed
        ],
        components: [
            allButtons
        ],
    });

    // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
    if (!waitMessage) return;

    const waitComponents = waitMessage.createMessageComponentCollector({
        filter: (button) => button.user.id == authorId,
        time: arrowTimeout
    });

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
                if (isLong) {
                    fastrightButton.setDisabled(false);
                }

                // Kaç sayfa geriye gideceğini hesapla
                pageNumber = Math.max(1, pageNumber - (button.customId == "COMMAND_BUTTON_LEFT" ? 1 : forwardAndBackwardCount));

                // Eğer en başa geldiysek sol okları deaktif et
                if (pageNumber == 1) {
                    leftButton.setDisabled(true);
                    if (isLong) {
                        fastleftButton.setDisabled(true);
                    }
                }

                break;
            default:
                // Sol okları yeniden aktif et    
                leftButton.setDisabled(false);
                if (isLong) {
                    fastleftButton.setDisabled(false);
                }

                // Kaç sayfa ileriye gideceğini hesapla
                pageNumber = Math.min(MAX_PAGE_NUMBER, pageNumber + (button.customId == "COMMAND_BUTTON_RIGHT" ? 1 : forwardAndBackwardCount));

                // Eğer en sona geldiysek sağ okları deaktif et
                if (pageNumber == MAX_PAGE_NUMBER) {
                    rightButton.setDisabled(true);
                    if (isLong) {
                        fastrightButton.setDisabled(true);
                    }
                }

                break;
        }

        const pageEmbed = await createEmbed(pageNumber);

        return waitMessage.edit({
            embeds: [
                pageEmbed
            ],
            components: [
                allButtons
            ]
        })
    })

    // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
    waitComponents.on("end", () => {
        const channel = msg.channel;

        // Eğer kanal veya mesaj silinmişse hiçbir şey yapma
        if (
            !channel ||
            !channel.messages.cache.has(waitMessage.id)
        ) return;

        // Butonları deaktif et
        if (isLong) {
            fastleftButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
            fastrightButton
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary);
        }
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
            content: messages.inactive,
            components: [
                allButtons
            ]
        })
    });
}