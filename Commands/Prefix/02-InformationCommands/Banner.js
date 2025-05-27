"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: { // Komutun ismi
        tr: "banner",
        en: "banner"
    },
    id: "banner", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "banner"
        ],
        en: [
            "banner"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının bannerını gösterir",
        en: "Shows the user's banner"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>banner [@kişi veya Kişi ID'si]",
        en: "<px>banner [@user or User ID]"
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
        args,
        authorId,
        language,
        errorEmbed,
    }) {

        const {
            commands: {
                banner: messages
            }
        } = allMessages[language];

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi bannerini kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Kullanıcıyı güncelle (banner için gerekli eğer bunu yapmazsak banneri olsa bile hata verir)
        await user.fetch(true).catch(() => { });

        // Eğer banneri bulamadıysa hata döndür
        const userBanner = user.bannerURL();
        if (!userBanner) return errorEmbed(
            user.id == authorId ?
                messages.noBannerYou :
                messages.noBanner(user.id)
        )

        // Tarayıcıda aç butonu oluştur
        const allButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Open in browser")
                    .setStyle(ButtonStyle.Link)
                    .setURL(userBanner)
            );

        const embed = new EmbedBuilder()
            .setAuthor({
                name: user.displayName,
                iconURL: user.displayAvatarURL()
            })
            .setDescription(`**[ [PNG](${userBanner.replace(".gif", ".png")}) ] | [ [JPG](${userBanner.replace(/\.(png|gif)/, ".jpg")}) ] | [ ${user.avatar?.startsWith("a_") ? `[GIF](${userBanner})` : `~~GIF~~`} ] | [ [WEBP](${userBanner.replace(/\.(png|gif)/, ".webp")}) ]**`)
            .setImage(userBanner)
            .setColor("#9e02e2")
            .setTimestamp();

        return msg.reply({
            embeds: [
                embed
            ],
            components: [
                allButtons
            ]
        });

    },
};