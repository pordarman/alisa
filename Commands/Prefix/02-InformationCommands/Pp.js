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
        tr: "pp",
        en: "pp"
    },
    id: "pp", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "pp",
            "profilfotoğrafı",
            "profilepicture",
            "avatar",
            "avatargör",
            "av",
            "image",
            "img"
        ],
        en: [
            "pp",
            "profilepicture",
            "avatar",
            "image",
            "img"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcının profil fotoğrafını gösterir",
        en: "Shows the user's profile photo"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Bilgi komutları",
        en: "Information commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>pp [@kişi veya Kişi ID'si]",
        en: "<px>pp [@user or User ID]"
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
        language,
    }) {

        const {
            commands: {
                pp: messages
            }
        } = allMessages[language];

        // Kullanıcıyı etiketlemişse önce kullanıcıyı eğer etiketlememişse kendi fotoğrafını kontrol et
        const user = msg.mentions.users.first() || await Util.fetchUser(msg.client, args[0]) || msg.author;

        let isMemberHasAvatar = false;

        // Bu obje alttaki fonksiyona yardım etmek amaçlı yazılmıştır
        const messageObject = {
            embeds: [],
            components: []
        }

        // Aynı kodu tekrar tekrar yazmak yerine buradan yazdır
        function createEmbed(imageURL, isMemberOrUser) {
            // Tarayıcıda aç butonu oluştur
            const allButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(`${messages.openInBrowser}${isMemberHasAvatar ? ` (${isMemberOrUser == "member" ? "Guild" : "Discord"})` : ""}`)
                        .setStyle(ButtonStyle.Link)
                        .setURL(imageURL)
                );

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: user.displayName,
                    iconURL: imageURL
                })
                .setDescription(`**[ [PNG](${imageURL.replace(".gif", ".png")}) ] | [ [JPG](${imageURL.replace(/\.(png|gif)/, ".jpg")}) ] | [ ${user.avatar?.startsWith("a_") ? `[GIF](${imageURL})` : `~~GIF~~`} ] | [ [WEBP](${imageURL.replace(/\.(png|gif)/, ".webp")}) ]**`)
                .setImage(imageURL)
                .setColor("#9e02e2")
                .setTimestamp();

            messageObject.embeds.push(embed);
            messageObject.components.push(allButtons);
        }

        // İlk önce kullanıcı sunucuda mı kontrol et
        const member = await Util.fetchMemberForce(msg.guild, user.id);
        if (member) {
            // Sunucudaki profil fotoğrafını kontrol et varsa embed'e ekle
            const guildAvatar = member.avatarURL();
            if (guildAvatar) {
                isMemberHasAvatar = true;
                createEmbed(guildAvatar, "member");
            }
        }

        // Kullanıcının discord fotoğrafını da embed'e ekle
        const userAvatar = user.displayAvatarURL();
        createEmbed(userAvatar, "user");

        // En son ise yukarıda tanımladığımız messageObject nesnesini yaz
        return msg.reply(messageObject);

    },
};