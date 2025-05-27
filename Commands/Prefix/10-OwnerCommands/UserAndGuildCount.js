"use strict";
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "s-say",
        en: "s-say"
    },
    id: "s-say", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "s-say"
        ],
        en: [
            "s-say"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kaç kullanıcıya ve sunucuya hizmet ettiğini gösterir",
        en: "Shows how many users and servers it serves"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>s-say",
        en: "<px>s-say"
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
        msg,
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
            `• **${Util.toHumanize(guildCount, "tr")}** sunucu ve **${Util.toHumanize(userCount, "tr")}** kullanıcıya hizmet ediyorum!`
        );

    },
};