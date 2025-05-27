"use strict";
const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");
const {
    EMOJIS,
    botInviteLink,
    discordInviteLink,
    topgglink
} = require("../../../settings.json")
const allMessages = require("../../../Helpers/Localizations/Index.js");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "yardım",
        en: "help"
    },
    id: "yardım", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "yardım",
            "komutlar",
            "help"
        ],
        en: [
            "help"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Yardım menüsünü gösterir",
        en: "Shows the help menu"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bot komutları",
        en: "Bot commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>yardım",
        en: "<px>help"
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
        msg,
        authorId,
        language,
        isOwner
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL();

        const {
            commands: {
                yardım: messages
            },
            others: otherMessages,
            switchs: {
                help: switchKey
            }
        } = allMessages[language];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`ONE-helpcommand`)
            .setPlaceholder(messages.nothingSelected);

        const allCommandSize = Util.maps.categoryCommands.get(language).get(otherMessages.allCommands).length;

        // Diğer komutları göstermek için dizi oluşturuyoruz
        const otherCommandDes = [];
        const selectMenuOptions = [];

        const commandsEntries = [...Util.maps.categoryCommands.get(language).entries()];
        for (let index = 0; index < commandsEntries.length; index++) {
            const [key, array] = commandsEntries[index];
            try {

                const {
                    emoji,
                    description
                } = otherMessages.helpCommandHelper[key];

                switch (switchKey(key)) {
                    case "allCommands":
                        // Tüm komutları daha önceden gösterdiğimiz için Tüm komutları geçiyoruz
                        break;

                    case "ownerCommands": {
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
                        description,
                        value: `helpcommand-${index}-${authorId}`,
                        emoji
                    }
                )
            }
            // Eğer olur da bir hata çıkarsa (Kategori ismini yanlış yazmışsak vs.) döngüyü geç
            catch (_) {
                console.error(`Yardım komutunda bir hata var:`, key);
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
                `**${EMOJIS.allCommands} ${otherMessages.allCommands} (${allCommandSize})\n\n` +
                `${otherCommandDes.join("\n")}\n\n` +
                `🚀 ${messages.links.myLinks}\n` +
                `[ [${messages.links.inviteMe}](${botInviteLink}) | [${messages.links.voteMe}](${topgglink}) | [${messages.links.supportServer}](${discordInviteLink}) ]**`
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