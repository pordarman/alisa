"use strict";
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "banner", // Komutun ismi
    id: "banner", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "banner"
    ],
    description: "Shows the user's banner", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>banner <@user or User ID>", // Komutun kullanım şekli
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
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi bannerini kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        // Kullanıcıyı güncelle (banner için gerekli eğer bunu yapmazsak banneri olsa bile hata verir)
        await user.fetch(true).catch(() => { });

        // Eğer banneri bulamadıysa hata döndür
        const userBanner = user.bannerURL();
        if (!userBanner) return errorEmbed(
            user.id == authorId ?
                "You do not have a banner :(" :
                "The person you tagged or whose ID you entered does not have a banner :("
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
            .setDescription(`**[ [PNG](${userBanner.replace(".gif", ".png")}) ] | [ [JPG](${userBanner.replace(/\.png|\.gif/, ".jpg")}) ] | [ ${userBanner.includes(".gif") ? `[GIF](${userBanner})` : `~~GIF~~`} ] | [ [WEBP](${userBanner.replace(/\.png|\.gif/, ".webp")}) ]**`)
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