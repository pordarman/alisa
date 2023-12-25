"use strict";
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
    name: "helpcommand", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Yardım komutlarını gösterir", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunStringSelectMenu} params 
     */
    async execute({
        guildDatabase,
        int,
        authorId,
        errorEmbed,
        language,
    }) {

        // Eğer tıklayan kişi komutu kullanan kişiden farklıysa hata döndür
        const [_, categoryIndex, clickedAuthorId] = int.values[0].split("-");
        if (clickedAuthorId != authorId) return errorEmbed(`Only the person using the command (<@${clickedAuthorId}>) can use this button :(`);

        // Kategori adından komutları çekme
        const allCategoriesName = [...int.client.categoryCommands[language].keys()];
        const categoryName = allCategoriesName[categoryIndex];
        const categoryCommands = int.client.categoryCommands[language].get(categoryName);

        if (!categoryCommands) return errorEmbed(`We can't pull help commands right now, please try again later!`);

        const SHOW_COMMAND_IN_ONE_PAGE = 8;
        const MAX_PAGE_NUMBER = Math.ceil(categoryCommands.length / SHOW_COMMAND_IN_ONE_PAGE);
        const currPageIndex = 0;
        const prefix = guildDatabase.prefix;

        const messageEmbed = int.message.embeds[0];

        // Eğer mesajda gösterilen embed silinmişse hata döndür
        if (!messageEmbed) return errorEmbed(`These buttons are no longer useful because the embed shown in the message has been deleted. Please create a new message by typing **${prefix}help**`);

        const currEmbed = new EmbedBuilder(messageEmbed);
        const components = int.message.components;

        currEmbed
            .setTitle(categoryName)
            .setDescription(
                "**" +
                categoryCommands.slice(0, SHOW_COMMAND_IN_ONE_PAGE).map(
                    ({ name: commandName, description: commandDescription, category: commandCategory }, index) => `\`#${index + 1}\` ${Util.helpCommandHelper[language][commandCategory].emoji} \`${prefix}${commandName}\`: ${commandDescription} `
                ).join("\n") + "**"
            )
            .setFooter({
                text: `Page ${currPageIndex + 1}/${MAX_PAGE_NUMBER}`
            })

        // Komuta butonlar ekle ve bu butonlar sayesinde sayfalarda geçişler yap
        const actionRow = new ActionRowBuilder()
            .addComponents(
                // Sol oklar
                new ButtonBuilder()
                    .setEmoji(EMOJIS.leftFastArrow)
                    .setCustomId(`helpcommandarrow-fastleft-${categoryIndex}-${authorId}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currPageIndex == 0),
                new ButtonBuilder()
                    .setEmoji(EMOJIS.leftArrow)
                    .setCustomId(`helpcommandarrow-left-${categoryIndex}-${authorId}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currPageIndex == 0),

                // Mesajı sil
                new ButtonBuilder()
                    .setEmoji(EMOJIS.delete)
                    .setCustomId(`helpcommandarrow-delete-${categoryIndex}-${authorId}`)
                    .setStyle(ButtonStyle.Danger),

                // Sağ oklar
                new ButtonBuilder()
                    .setEmoji(EMOJIS.rightArrow)
                    .setCustomId(`helpcommandarrow-right-${categoryIndex}-${authorId}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currPageIndex == MAX_PAGE_NUMBER - 1),
                new ButtonBuilder()
                    .setEmoji(EMOJIS.rightFastArrow)
                    .setCustomId(`helpcommandarrow-fastright-${categoryIndex}-${authorId}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currPageIndex == MAX_PAGE_NUMBER - 1),
            );

        // Eğer zaten butonlar oluşturulmuşsa ilk component ile değiştir
        if (components.length == 2) {
            components[0] = actionRow
        }
        // Eğer butonlar oluşturulmamışsa butonları en başa ekle
        else {
            components.unshift(actionRow);
        }

        return int.message.edit({
            embeds: [
                currEmbed
            ],
            components
        })
    },
};