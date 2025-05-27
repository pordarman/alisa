"use strict";
const database = require("../../../Helpers/Database.js");
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");
const {
    EMOJIS
} = require("../../../settings.json");

module.exports = {
    name: { // Komutun ismi
        tr: "sıfırla",
        en: "reset"
    },
    id: "sıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sıfırla",
            "verisil",
            "verilerisil",
            "deletedatas",
            "deletedata"
        ],
        en: [
            "reset",
            "deletedatas",
            "deletedata"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bu sunucudaki bütün verileri (afk sistemi hariç) sıfırlar",
        en: "This resets all data on the server (except the afk system)"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sıfırla",
        en: "<px>reset"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Komutun çalıştırıldığı fonksiyon
     * @param {import("../../../Typedef").ExportsRunCommands} params - Komutun parametreleri
     */
    async execute({
        msg,
        guildDatabase,
        guildId,
        guild,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                sıfırla: messages,
            },
            messageArrows: messageArrowsMessages
        } = allMessages[language];

        // Eğer kişi sunucu sahibi değilse hata döndür
        if (guild.ownerId != authorId) return errorEmbed(messages.notOwner);

        const embed = new EmbedBuilder()
            .setTitle(messages.attentionEmbed.title)
            .setDescription(messages.attentionEmbed.description)
            .setColor("#6d0000")
            .setFooter({
                text: messages.attentionEmbed.footer
            });

        const yesButton = new ButtonBuilder()
            .setEmoji(EMOJIS.yes)
            .setStyle(ButtonStyle.Success)
            .setCustomId("COMMAND_YES");

        const noButton = new ButtonBuilder()
            .setEmoji(EMOJIS.no)
            .setStyle(ButtonStyle.Danger)
            .setCustomId("COMMAND_NO");

        const actionRow = new ActionRowBuilder()
            .addComponents(yesButton, noButton);

        const waitMessage = await msg.reply({
            embeds: [embed],
            components: [actionRow],
            withResponse: true
        });

        // Eğer bir hata olurda mesajı atamazsa hiçbir şey döndürme
        if (!waitMessage) return;

        const waitComponents = waitMessage.createMessageComponentCollector({
            filter: (button) => button.user.id == authorId,
            time: 1000 * 60 * 2 // 2 dakika
        });

        // Eğer butona tıklarsa
        waitComponents.on("collect", async (button) => {
            let content;
            switch (button.customId) {
                case "COMMAND_NO":
                    content = messages.transactionCanceled;
                    break;

                case "COMMAND_YES":
                    // afk, dil ve prefix verisi hariç diğer bütün verileri sil
                    const tempDatas = {
                        afk: {
                            ...guildDatabase.afk
                        },
                        prefix: guildDatabase.prefix,
                        language: guildDatabase.language
                    };
                    for (const key in database.defaultGuildDatabase) {
                        guildDatabase[key] = database.defaultGuildDatabase[key];
                    }
                    for (const key in tempDatas) {
                        guildDatabase[key] = tempDatas[key];
                    }

                    await database.updateGuild(guildId, {
                        $set: guildDatabase
                    });

                    content = messages.dataResetSuccess;
                    break;
            }

            return waitMessage.edit({
                content,
                embeds: [],
                components: []
            });
        })

        // Süre biterse kullanıcının anlaması için mesajı düzenle ve butonları deaktif et
        waitComponents.on("end", () => {
            const channel = msg.channel;

            // Eğer kanal veya mesaj silinmişse hiçbir şey yapma
            if (
                !channel ||
                !channel.messages.cache.has(waitMessage.id)
            ) return;

            // İki butonu da deaktif et
            yesButton.setDisabled(true);
            noButton.setDisabled(true);

            return waitMessage.edit({
                content: `${messageArrowsMessages.inactive}\n${waitMessage.content}`, // Eğer süre biterse mesajın sonuna inaktif olduğunu belirten bir emoji ekler
                components: [new ActionRowBuilder().addComponents(yesButton, noButton)],
                embeds: waitMessage.embeds
            });
        });
    },
};