"use strict";
const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS,
    botInviteLink,
    discordInviteLink
} = require("../../../../settings.json")
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "help", // Komutun ismi
    id: "yardım", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "help"
    ],
    description: "Shows the help menu", // Komutun açıklaması
    category: "Bot commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>help", // Komutun kullanım şekli
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
        guildMe,
        authorId,
        isOwner,
        language,
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL()

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`helpcommand`)
            .setPlaceholder("Nothing was selected...");

        const allCommandSize = msg.client.categoryCommands[language].get("All commands").length;

        // Diğer komutları göstermek için dizi oluşturuyoruz
        const otherCommandDes = [];
        const selectMenuOptions = [];

        const commandsEntries = [...msg.client.categoryCommands[language].entries()];
        for (let index = 0; index < commandsEntries.length; index++) {
            const [key, array] = commandsEntries[index];
            try {

                const {
                    emoji,
                    description
                } = Util.helpCommandHelper[language][key];

                switch (key) {
                    case "All commands":
                        // Tüm komutları daha önceden gösterdiğimiz için Tüm komutları geçiyoruz
                        break;

                    case "Owner commands": {
                        // Eğer komutu kullanan kişi geliştirici değilse "Owner commands" verisini geç
                        if (!isOwner) continue;

                        otherCommandDes.push(`\n${emoji} ${key} (${array.length})`);
                        break;
                    }

                    default: {
                        otherCommandDes.push(`${emoji} ${key} (${array.length})`);
                    }
                        break;

                }

                // Select menüye seçenek ekleme
                selectMenuOptions.push(
                    {
                        label: key,
                        description: description,
                        value: `helpcommand-${index}-${authorId}`,
                        emoji: emoji
                    }
                )
            }
            // Eğer olur da bir hata çıkarsa (Kategori ismini yanlış yazmışsak vs.) döngüyü geç
            catch (error) {
                console.log(`Yardım komutunda bir hata var: ${key}`);
            }

        }

        // Seçmeli menüye seçenekler ekleme
        selectMenu
            .addOptions(
                ...selectMenuOptions
            )

        const actionRow = new ActionRowBuilder()
            .addComponents(selectMenu)

        const embed = new EmbedBuilder()
            .setAuthor({
                name: msg.client.user.displayName,
                iconURL: clientAvatar
            })
            .setDescription(
                `**${EMOJIS.allCommands} All commands (${allCommandSize})\n\n` +
                `${otherCommandDes.join("\n")}\n\n` +
                `🚀 My connections\n` +
                `[ [Invite me](${botInviteLink}) | [Vote me](https://top.gg/bot/${guildMe.id}/vote) | [My support server](${discordInviteLink}) ]**`
            )
            .setThumbnail(clientAvatar)
            .setColor("Random")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ],
            components: [
                actionRow
            ]
        })
    },
};