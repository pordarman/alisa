"use strict";
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "s-say", // Komutun ismi
    id: "s-say", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "s-say"
    ],
    description: "Kaç kullanıcıya ve sunucuya hizmet ettiğini gösterir", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>s-say", // Komutun kullanım şekli
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

        const guildsAndUsers = await msg.client.shard.broadcastEval(
            client => ({ guilds: client.guilds.cache.size, users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) })
        );

        let userCount = 0;
        let guildCount = 0;

        for (let i = 0; i < guildsAndUsers.length; i++) {
            const shardInfo = guildsAndUsers[i];
            userCount += shardInfo.users;
            guildCount += shardInfo.guilds;
        }

        return msg.reply(
            `• **${Util.toHumanize(guildCount, language)}** sunucu ve **${Util.toHumanize(userCount, language)}** kullanıcıya hizmet ediyorum!`
        );

    },
};