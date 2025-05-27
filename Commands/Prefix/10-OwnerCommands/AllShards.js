"use strict";
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "shard",
        en: "shard"
    },
    id: "shard", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "shard",
            "shards",
            "allshards",
        ],
        en: [
            "shard",
            "shards",
            "allshards"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bütün shard'ların bilgilerini gösterir",
        en: "Shows all shard's information"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>shard",
        en: "<px>shard"
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

        const allShardsInfo = await msg.client.shard.broadcastEval(
            client => ({
                id: client.shard.ids[0],
                guildsCount: client.guilds.cache.size,
                channelsCount: client.channels.cache.size,
                usersCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                ping: client.ws.ping
            })
        );

        // Embed mesajının daha güzel gözükmesi için ekstra boşluklar bırak
        const extraSpace = "\u200b ".repeat(7);

        const clientAvatar = msg.client.user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: allShardsInfo,
            async arrayValuesFunc({
                result: {
                    id,
                    guildsCount,
                    channelsCount,
                    usersCount,
                    ping
                }
            }) {
                return {
                    name: `${extraSpace}__Shard ID #${Util.toHumanize(id, "tr")}__`,
                    value: `• **Sunucu sayısı:** ${Util.toHumanize(guildsCount, "tr")}\n` +
                        `• **Kullanıcı sayısı:** ${Util.toHumanize(usersCount, "tr")}\n` +
                        `• **Kanal sayısı:** ${Util.toHumanize(channelsCount, "tr")}\n` +
                        `• **Bot gecikmesi:** ${Util.toHumanize(ping, "tr")}`,
                    inline: true
                }
            },
            putDescriptionOrField: "field",
            embed: {
                author: {
                    name: msg.client.user.displayName,
                    iconURL: clientAvatar
                },
                thumbnail: clientAvatar,
            },
            VALUES_PER_PAGE: 9,
        });
    },
};