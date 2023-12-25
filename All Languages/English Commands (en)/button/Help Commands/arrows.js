"use strict";
const {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS,
    prefix
} = require("../../../../settings.json");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "helpcommandarrow", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Yardım komutunda sayfalar arasında gezinmeyi sağlar", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        alisa,
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
        language,
    }) {

        // Eğer tıklayan kişi komutu kullanan kişiden farklıysa hata döndür
        const [_, arrowName, categoryIndex, clickedAuthorId] = customId.split("-");
        if (clickedAuthorId != authorId) return errorEmbed(`Only the person using the command (<@${clickedAuthorId}>) can use this button :(`);

        // Kategori adından kategorinin komutlarını çekiyoruz
        const allCategoriesName = [...int.client.categoryCommands[language].keys()];
        const categoryCommands = int.client.categoryCommands[language].get(allCategoriesName[categoryIndex]);

        const messageEmbed = int.message.embeds[0];

        // Eğer mesajda gösterilen embed silinmişse hata döndür
        if (!messageEmbed) return errorEmbed(`These buttons are no longer useful because the embed shown in the message has been deleted. Please create a new message by typing **${guildDatabase.prefix}help**`);

        // Hangi sayfada olduğunu buluyoruz
        const currPageIndex = Number(messageEmbed.footer.text.match(/\d+(?=\/)/)) - 1;
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

        let toPageIndex;

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

        // Komutun başlangıç sırası
        const startCount = toPageIndex * SHOW_COMMAND_IN_ONE_PAGE;

        // Yardım komutunda gözükecek komutları çek ve düzenle
        const showCommands = categoryCommands.slice(
            toPageIndex * SHOW_COMMAND_IN_ONE_PAGE,
            (toPageIndex + 1) * SHOW_COMMAND_IN_ONE_PAGE
        ).map(
            ({ name: commandName, description: commandDescription, category: commandCategory }, index) => `\`#${startCount + index + 1}\` ${Util.helpCommandHelper[language][commandCategory].emoji} \`${prefix}${commandName}\`: ${commandDescription} `
        );

        // Butonları ActionRow'a ekle ve bunu mesaja ekle
        int.message.components[0] = new ActionRowBuilder()
            .addComponents(
                fastleftButton,
                leftButton,
                deleteButton,
                rightButton,
                fastrightButton
            );

        // Embed'i düzenle
        const editEmbed = new EmbedBuilder(messageEmbed)
            .setDescription(`**${showCommands.join("\n")}**`)
            .setFooter({
                text: `Page ${toPageIndex + 1}/${MAX_PAGE_NUMBER}`
            });

        // Mesajı düzenle
        return int.message.edit({
            embeds: [
                editEmbed
            ],
            components: int.message.components
        });
    },
};