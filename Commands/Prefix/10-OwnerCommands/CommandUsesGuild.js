"use strict";
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const path = require("path");

module.exports = {
    name: { // Komutun ismi
        tr: "s-sıra",
        en: "s-sıra"
    },
    id: "s-sıra", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "s-sıra",
            "ssıra"
        ],
        en: [
            "s-sıra",
            "ssıra"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Bütün sunucuları komut kullanımına veya sunucu sayısına göre sıralar",
        en: "Sorts all servers by command usage or number of servers"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>s-sıra [komut/toplam/üye/bot] [çok/az]",
        en: "<px>s-sıra [komut/toplam/üye/bot] [çok/az]"
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
    }) {

        // Hangi değere ve hangi sıraya göre sıralayacağını ayarla
        const sortTypeObject = {
            type: args[0] || "komut",
            sort: args[1] || "çok"
        }

        let sort;
        const allGuilds = (await msg.client.shard.broadcastEval(
            async (client, {
                path,
                alisa
            }) => {
                const pathModule = require("path");
                const Util = require(pathModule.resolve(path, "Helpers", "Util.js"));

                const guilds = await Promise.all(
                    client.guilds.cache.map(async (guild) => {
                        const allMembers = await Util.getMembers(guild);

                        let userCount = 0;
                        let botCount = 0;

                        allMembers.forEach(member => {
                            if (member.user.bot) botCount++;
                            else userCount++;
                        });

                        return {
                            id: guild.id,
                            name: guild.name,
                            memberCount: allMembers.size,
                            userCount,
                            botCount,
                            commandCount: alisa.guildsCommandUses[guild.id] || 0
                        }
                    })
                );

                return guilds;
            },
            {
                context: {
                    path: __dirname.split(`${path.sep}Commands`)[0],
                    alisa
                }
            }
        )).flat();

        // Hangi değere göre sıralayacağını ayarla
        switch (sortTypeObject.type) {
            case "komut":
            case "k":
            case "kod":
            case "komutlar":
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return b.commandCount - a.commandCount
                    } :
                    (a, b) => {
                        return a.commandCount - b.commandCount
                    }
                break;

            case "bot":
            case "botlar":
            case "b":
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return b.botCount - a.botCount
                    } :
                    (a, b) => {
                        return a.botCount - b.botCount
                    }
                break;

            case "üye":
            case "kişi":
            case "u":
            case "kullanıcı":
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return b.userCount - a.userCount
                    } :
                    (a, b) => {
                        return a.userCount - b.userCount
                    }
                break;

            default:
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return b.memberCount - a.memberCount
                    } :
                    (a, b) => {
                        return a.memberCount - b.memberCount
                    }
                break;
        }

        // Sırala
        allGuilds.sort(sort);

        const clientAvatar = msg.client.user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: allGuilds,
            async arrayValuesFunc({
                result: {
                    id,
                    name,
                    userCount,
                    botCount,
                    commandCount
                },
                index
            }) {
                return `• \`#${index + 1}\` **${name} - (${id}) =>** 👤 ${userCount}, 🤖 ${botCount} [🗂️ ${commandCount}]`
            },
            embed: {
                author: {
                    name: msg.client.user.tag,
                    iconURL: clientAvatar
                },
            },
            VALUES_PER_PAGE: 15,
            arrowTimeout: 1000 * 60 * 20 // 20 dakika
        });

    },
};