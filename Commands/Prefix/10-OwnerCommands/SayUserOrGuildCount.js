"use strict";
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "skişi",
        en: "skişi"
    },
    id: "skişi", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "skişi",
            "ssunucu",
            "sunucu",
            "kişi"
        ],
        en: [
            "skişi",
            "ssunucu",
            "sunucu",
            "kişi"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bir kullanıcının veya sunucunun kaç komut kullandığını gösterir",
        en: "Shows how many commands a user or server has used"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>skişi <@kişi veya Kişi ID'si veya Sunucu ID'si>",
        en: "<px>skişi <@user or User ID or Guild ID>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        alisa,
        msg,
        args,
        errorEmbed,
    }) {

        // Eğer bir kişiyi etiketlemişse
        const mentionUser = msg.mentions.users.first();
        if (mentionUser) {
            const count = alisa.usersCommandUses[mentionUser.id] || 0;
            return msg.reply(`• <@${mentionUser.id}> - (${Util.escapeMarkdown(mentionUser.displayName)}) adlı kişi botun komutlarını toplamda **${Util.toHumanize(count, "tr")} kere** kullanmış`)
        }

        const guildOrUserId = args[0];

        // Eğer bir şey girmemişse
        if (!guildOrUserId) return errorEmbed(`Lütfen bir kişi veya sunucu ID'sini giriniz`);

        // Eğer etiketlediği ID bir sunucuya aitse
        const guildCommand = await Util.getGuild(msg.client, guildOrUserId);
        if (guildCommand) {
            const count = alisa.guildsCommandUses[guildCommand.id] || 0;
            return msg.reply(`• ${guildCommand.name} - (${guildCommand.id}) adlı sunucu botun komutlarını toplamda **${Util.toHumanize(count, "tr")} kere** kullanmış`)
        }

        // Eğer etiketlediği ID bir kişiya aitse
        const user = await Util.fetchUser(msg.client, guildOrUserId);
        if (user) {
            const count = alisa.usersCommandUses[user.id] || 0;
            return msg.reply(`• <@${user.id}> - (${Util.escapeMarkdown(user.displayName)}) adlı kişi botun komutlarını toplamda **${Util.toHumanize(count, "tr")} kere** kullanmış`)
        }

        // Eğer girdiği ID hiçbir şeye ait değilse
        return errorEmbed(`Lütfen bir kişi veya sunucu ID'sini giriniz`);

    },
};