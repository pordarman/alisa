"use strict";
const {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: "helpcommandarrow", // Butonun ismi
    id: "yardım", // Butonun ID'si
    cooldown: 3, // Butonun bekleme süresi
    description: "Yardım komutunda sayfalar arasında gezinmeyi sağlar", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        splitCustomId,
        authorId,
        errorEmbed,
        language,
    }) {

        const {
            buttons: buttonMessages,
            others: otherMessages,
            messageArrows: messageArrowsMessages
        } = allMessages[language];

        // Eğer tıklayan kişi komutu kullanan kişiden farklıysa hata döndür
        const [_, arrowName, categoryIndex, clickedAuthorId] = splitCustomId;
        if (clickedAuthorId != authorId) return errorEmbed(buttonMessages.notAuthor(clickedAuthorId));

        const utilCategoryCommands = Util.maps.categoryCommands.get(language);

        // Kategori adından kategorinin komutlarını çekiyoruz
        const allCategoriesName = [...utilCategoryCommands.keys()];
        const categoryCommands = utilCategoryCommands.get(allCategoriesName[categoryIndex]);

        const messageEmbed = int.message.embeds[0];
        const prefix = guildDatabase.prefix;

        // Eğer mesajda gösterilen embed silinmişse hata döndür
        if (!messageEmbed) return errorEmbed(buttonMessages.embedDeleted(prefix));

        // Hangi sayfada olduğunu buluyoruz
        const currPageIndex = Number(messageEmbed.footer?.text?.match(/\d+(?=\/)/) ?? 0) - 1;
        const SHOW_COMMAND_IN_ONE_PAGE = 8;
        const MAX_PAGE_NUMBER = Math.ceil(categoryCommands.length / SHOW_COMMAND_IN_ONE_PAGE);

        // Butonları güncelle
        const fastleftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftFastArrow)
            .setCustomId(`helpcommandarrow-fastleft-${categoryIndex}-${authorId}`)
            .setStyle(ButtonStyle.Primary);

        const leftButton = new ButtonBuilder()
            .setEmoji(EMOJIS.leftArrow)
            .setCustomId(`helpcommandarrow-left-${categoryIndex}-${authorId}`)
            .setStyle(ButtonStyle.Primary);

        const deleteButton = new ButtonBuilder()
            .setEmoji(EMOJIS.delete)
            .setCustomId(`helpcommandarrow-delete-${categoryIndex}-${authorId}`)
            .setStyle(ButtonStyle.Danger);

        const rightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightArrow)
            .setCustomId(`helpcommandarrow-right-${categoryIndex}-${authorId}`)
            .setStyle(ButtonStyle.Primary);

        const fastrightButton = new ButtonBuilder()
            .setEmoji(EMOJIS.rightFastArrow)
            .setCustomId(`helpcommandarrow-fastright-${categoryIndex}-${authorId}`)
            .setStyle(ButtonStyle.Primary);

        let toPageIndex = 0;

        // Okun adını kullanarak hangi sayfaya gideceğini hesaplıyoruz
        switch (arrowName) {
            case "delete":
                // Mesajı sil
                return int.message.delete();

            case "left":
            case "fastleft":
                // Sağ okları yeniden aktif et
                rightButton
                    .setDisabled(false);
                fastrightButton
                    .setDisabled(false);

                toPageIndex = Math.max(0, currPageIndex - (arrowName == "fastleft" ? 5 : 1));

                // Eğer en baş sayfaya geldiyse sol okları devre dışı bırak
                if (toPageIndex == 0) {
                    leftButton
                        .setDisabled(true);
                    fastleftButton
                        .setDisabled(true);
                }

                break;

            case "right":
            case "fastright":
                // Sol okları yeniden aktif et
                leftButton
                    .setDisabled(false);
                fastleftButton
                    .setDisabled(false);

                toPageIndex = Math.min(MAX_PAGE_NUMBER - 1, currPageIndex + (arrowName == "fastright" ? 5 : 1));

                // Eğer en son sayfaya geldiyse sağ okları devre dışı bırak
                if (toPageIndex == MAX_PAGE_NUMBER - 1) {
                    rightButton
                        .setDisabled(true);
                    fastrightButton
                        .setDisabled(true);
                }
                break;
        }

        // Sayfada gözükecek komutları ayarla
        const commandsString = Util.sliceMapAndJoin(
            categoryCommands,
            toPageIndex * SHOW_COMMAND_IN_ONE_PAGE,
            (toPageIndex + 1) * SHOW_COMMAND_IN_ONE_PAGE,
            function ({
                name: commandName,
                description: commandDescription,
                category: commandCategory
            }, index) {
                return `\`#${index + 1}\` ${otherMessages.helpCommandHelper[commandCategory].emoji} \`${prefix}${commandName}\`: ${commandDescription}`;
            },
            "\n"
        );

        // Butonları ActionRow'a ekle ve bunu mesaja ekle
        int.message.components[0] = new ActionRowBuilder()
            .addComponents(
                fastleftButton,
                leftButton,
                deleteButton,
                rightButton,
                fastrightButton
            )

        // Embed'i düzenle
        const editEmbed = new EmbedBuilder(messageEmbed.data)
            .setDescription(`**${commandsString}**`)
            .setFooter({
                text: `${messageArrowsMessages.page} ${toPageIndex + 1}/${MAX_PAGE_NUMBER}`
            });

        // Mesajı düzenle
        return await int.message.edit({
            embeds: [
                editEmbed
            ],
            components: int.message.components
        });
    },
};