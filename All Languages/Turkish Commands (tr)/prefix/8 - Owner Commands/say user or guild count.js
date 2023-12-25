"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");


module.exports = {
    name: "skişi", // Komutun ismi
    id: "skişi", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "skişi",
        "ssunucu",
        "sunucu",
        "kişi"
    ],
    description: "Bir kullanıcının veya sunucunun kaç komut kullandığını gösterir", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>skişi <@kişi veya Kişi ID'si veya Sunucu ID'si>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
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

        // Eğer bir kişiyi etiketlemişse
        const mentionUser = msg.mentions.users.first();
        if (mentionUser) {
            const count = alisa.usersCommandUses[mentionUser.id] || 0;
            return msg.reply(`• <@${mentionUser.id}> - (${Util.recreateString(mentionuser.displayName)}) adlı kişi botun komutlarını toplamda **${Util.toHumanize(count, language)} kere** kullanmış`)
        }

        const guildOrUserId = args[0];

        // Eğer bir şey girmemişse
        if (!guildOrUserId) return errorEmbed(`Lütfen bir kişi veya sunucu ID'sini giriniz`);

        // Eğer etiketlediği ID bir sunucuya aitse
        const guildCommand = await Util.getGuild(msg.client, guildOrUserId);
        if (guildCommand) {
            const count = alisa.guildsCommandUses[guildCommand.id] || 0;
            return msg.reply(`• ${guildCommand.name} - (${guildCommand.id}) adlı sunucu botun komutlarını toplamda **${Util.toHumanize(count, language)} kere** kullanmış`)
        }

        // Eğer etiketlediği ID bir kişiya aitse
        const user = await Util.fetchUser(msg.client, guildOrUserId);
        if (user) {
            const count = alisa.usersCommandUses[user.id] || 0;
            return msg.reply(`• <@${user.id}> - (${Util.recreateString(user.displayName)}) adlı kişi botun komutlarını toplamda **${Util.toHumanize(count, language)} kere** kullanmış`)
        }

        // Eğer girdiği ID hiçbir şeye ait değilse
        return errorEmbed(`Lütfen bir kişi veya sunucu ID'sini giriniz`);

    },
};