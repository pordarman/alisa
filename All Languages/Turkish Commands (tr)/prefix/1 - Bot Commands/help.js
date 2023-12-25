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
    name: "yardım", // Komutun ismi
    id: "yardım", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "yardım",
        "komutlar",
        "help"
    ],
    description: "Yardım menüsünü gösterir", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>yardım", // Komutun kullanım şekli
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
        guild,
        args,
        prefix,
        guildId,
        authorId,
        errorEmbed,
        isOwner,
        language,
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL()

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`helpcommand`)
            .setPlaceholder("Bir şey seçilmedi...");

        const allCommandSize = msg.client.categoryCommands[language].get("Tüm komutlar").length;

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
                    case "Tüm komutlar":
                        // Tüm komutları daha önceden gösterdiğimiz için Tüm komutları geçiyoruz
                        break;

                    case "Sahip komutları": {
                        // Eğer komutu kullanan kişi geliştirici değilse "Sahip komutları" verisini geç
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
                `**${EMOJIS.allCommands} Tüm komutlar (${allCommandSize})\n\n` +
                `${otherCommandDes.join("\n")}\n\n` +
                `🚀 Bağlantılarım\n` +
                `[ [Beni davet et](${botInviteLink}) | [Oy ver](https://top.gg/bot/${guildMe.id}/vote) | [Destek sunucum](${discordInviteLink}) ]**`
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