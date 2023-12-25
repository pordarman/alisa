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
        customId,
        int,
        authorId,
        errorEmbed,
        language,
    }) {

        // Eğer tıklayan kişi komutu kullanan kişiden farklıysa hata döndür
        const [_, categoryIndex, clickedAuthorId] = int.values[0].split("-");
        if (clickedAuthorId != authorId) return errorEmbed(`Bu butonu sadece komutu kullanan kişi (<@${clickedAuthorId}>) kullanabilir :(`);

        // Kategori adından komutları çekme
        const allCategoriesName = [...int.client.categoryCommands[language].keys()];
        const categoryName = allCategoriesName[categoryIndex];
        const categoryCommands = int.client.categoryCommands[language].get(categoryName);

        if (!categoryCommands) return errorEmbed(`Yardım komutlarını şu anda çekemiyoruz, lütfen daha sonra tekrar deneyiniz!`);

        const SHOW_COMMAND_IN_ONE_PAGE = 8;
        const MAX_PAGE_NUMBER = Math.ceil(categoryCommands.length / SHOW_COMMAND_IN_ONE_PAGE);
        const currPageIndex = 0;
        const prefix = guildDatabase.prefix;

        const messageEmbed = int.message.embeds[0];

        // Eğer mesajda gösterilen embed silinmişse hata döndür
        if (!messageEmbed) return errorEmbed(`Mesajda gösterilen embed silindiği için artık bu butonlar işe yaramaz. Lütfen **${prefix}yardım** yazarak yeni bir mesaj daha oluşturunuz`);

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
                text: `Sayfa ${currPageIndex + 1}/${MAX_PAGE_NUMBER}`
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