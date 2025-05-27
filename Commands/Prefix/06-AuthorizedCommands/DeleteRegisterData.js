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
        tr: "kayıtsıfırla",
        en: "deleteregister"
    },
    id: "kayıtsıfırla", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "kayıtsıfırla",
            "kayıtsil",
            "kayıt-sıfırla",
            "kayıt-sil",
            "deleteregister"
        ],
        en: [
            "deleteregister"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bütün kayıt verilerini siler",
        en: "Deletes all register data"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Yetkili komutları",
        en: "Authorized commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>kayıtsıfırla",
        en: "<px>deleteregister"
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
        guildDatabase,
        guildId,
        msgMember,
        prefix,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                kayıtsıfırla: messages,
            },
            messageArrows: messageArrowsMessages
        } = allMessages[language];

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const embed = new EmbedBuilder()
            .setTitle(messages.embed.title)
            .setDescription(
                messages.embed.description(prefix)
            )
            .setColor("#a80303")
            .setFooter({
                text: messages.embed.footer
            })
            .setTimestamp();

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
            time: 1000 * 45 // 45 saniye
        });

        // Eğer butona tıklarsa
        waitComponents.on("collect", async (button) => {
            let content;
            switch (button.customId) {
                case "COMMAND_NO":
                    content = messages.transactionCanceled;
                    break;

                case "COMMAND_YES":
                    // Database'den rol ve kanal ID'lerini sil
                    const tempData = { ...guildDatabase.register };
                    guildDatabase.register = database.defaultGuildDatabase.register;

                    // Silinmeyecek verileri geri yükle
                    for (const key of ["authorizedInfos", "lastRegisters", "prevNamesOfMembers"]) {
                        guildDatabase.register[key] = tempData[key];
                    }

                    await database.updateGuild(guildId, {
                        $set: {
                            "register": guildDatabase.register
                        }
                    });

                    content = messages.success;
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