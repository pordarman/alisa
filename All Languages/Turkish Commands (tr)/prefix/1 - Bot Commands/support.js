"use strict";
const {
    discordInviteLink,
    supportGuildId
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "destek", // Komutun ismi
    id: "destek", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "destek",
        "support"
    ],
    description: "Bot hakkında destek alırsınız", // Komutun açıklaması
    category: "Bot komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>destek", // Komutun kullanım şekli
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
        language,
    }) {

        const clientAvatar = msg.client.user.displayAvatarURL();
        const supportGuild = await Util.getGuild(msg.client, supportGuildId);
        const supportGuildIcon = supportGuild.iconURL;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: supportGuild.name,
                iconURL: supportGuildIcon
            })
            .setDescription(
                `• Görünüşe göre biraz yardıma ihtiyacın var gibi görünüyor isterseniz size biraz yardım edebilirim ne dersin?\n\n` +
                `• **[Destek sunucuma](${discordInviteLink})** gelip yetkililerden yardım etmesini isteyebilirsiniz\n\n` +
                `• Ha eğer destek sunucuma gelmeden yardım almak istiyorsanız kısaca **${prefix}kur** komutunu kullanıp bütün sorulara cevap vererek bütün kayıt sistemini hızlı bir şekilde kurabilirsiniz\n\n` +
                `• Ve mümkünse **${prefix}yardım** yazarak bütün komutlarımı gördükten sonra kullanmaya başlayınız çünkü birçok komutum işlemleriniz daha kolay ve daha pratik bir şekilde yapmanızı sağlıyor. **__Bu yüzden bütün komutlarıma bakmayı sakın unutmayınız.__**\n\n` +
                `• Eğer daha fazla yardıma ihtiyacınız varsa **[destek sunucuma](${discordInviteLink})** gelmeyi sakın unutma ^^\n\n` +
                `• Ve en önemlisi *seni seviyorum...* :)`
            )
            .setColor(msgMember.displayHexColor ?? "#9e02e2")
            .setThumbnail(clientAvatar)
            .setTimestamp()
        msg.reply({
            embeds: [
                embed
            ]
        });

    },
};