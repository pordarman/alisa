"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const {
    User
} = require("discord.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "karaliste",
        en: "blacklist"
    },
    id: "karaliste", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "karaliste",
            "blacklist",
            "kl"
        ],
        en: [
            "blacklist",
            "kl"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Bir kullanıcıyı veya sunucuyu karalisteye ekler veya çıkarırsınız",
        en: "Add or remove a user or server to the blacklist"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>karaliste <ekle/çıkar/liste> <Kullanıcı/Sunucu ID> [Sebep]",
        en: "<px>blacklist <add/remove/list> <User/Server ID> [Reason]"
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
        prefix,
        authorId,
    }) {

        const type = args[0];

        async function findUserOrGuild(id) {
            // İlk önce sunucuyu ara eğer öyle bir sunucu yoksa kullanıcıyı ara
            return await msg.client.shard.broadcastEval((client, id) => client.guilds.cache.get(id), { context: id, shard: Util.shardId(id) }) ||
                await Util.fetchUser(msg.client, id);
        }

        switch (type) {
            case "ekle":
            case "add":
            case "a":
            case "e": {
                const userOrGuild = msg.mentions.users.first() || await findUserOrGuild(args[1]);
                if (!userOrGuild) return msg.reply("Geçerli bir kullanıcı veya sunucu ID'si giriniz");

                const reason = args.join(" ").replace(new RegExp(`(ekle|add|a|e|<@!?${userOrGuild.id}>|${userOrGuild})`, "i"), "").trim();

                let content;

                // Eğer kullanıcı ise
                if (userOrGuild instanceof User) {
                    // Eğer kullanıcı zaten karalistede ise
                    if (alisa.blacklistUsers[userOrGuild.id]) return msg.reply("Bu kişi zaten karalistede __bulunuyor__!");

                    alisa.blacklistUsers[userOrGuild.id] = {
                        addedTimestamp: Date.now(),
                        reason,
                        isSee: false,
                        ownerId: authorId
                    };
                    content = `**${userOrGuild.tag} - (${userOrGuild.id})** adlı kişi başarıyla kara listeye alındı!`
                }
                // Eğer sunucu ise
                else {

                    // Eğer sunucu zaten karalistede ise
                    if (alisa.blacklistGuilds[userOrGuild.id]) return msg.reply("Bu sunucu zaten karalistede __bulunuyor__!");

                    alisa.blacklistGuilds[userOrGuild.id] = {
                        addedTimestamp: Date.now(),
                        reason,
                        ownerId: authorId
                    };
                    content = `**${userOrGuild.name} - (${userOrGuild.id})** sunucu başarıyla kara listeye alındı!`;

                    await msg.client.shard.broadcastEval((client, guildId) => {
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) guild.leave();
                    }, { context: userOrGuild.id, shard: Util.shardId(userOrGuild.id) });
                }

                return msg.reply(content);
            }

            case "çıkar":
            case "ç":
            case "k": {
                const userOrGuild = msg.mentions.users.first() || await findUserOrGuild(args[1]);
                if (!userOrGuild) return msg.reply("Geçerli bir kullanıcı veya sunucu ID'si giriniz");

                let content;

                // Eğer kullanıcı ise
                if (userOrGuild instanceof User) {
                    // Eğer kullanıcı zaten karalistede değil ise
                    if (!alisa.blacklistUsers[userOrGuild.id]) return msg.reply("Bu kişi zaten karalistede __bulunmuyor__!");

                    delete alisa.blacklistUsers[userOrGuild.id];
                    content = `**${userOrGuild.tag} - (${userOrGuild.id})** adlı kişi başarıyla kara listeden çıkarıldı!`
                }
                // Eğer sunucu ise
                else {

                    // Eğer sunucu zaten karalistede değil ise
                    if (!alisa.blacklistGuilds[userOrGuild.id]) return msg.reply("Bu sunucu zaten karalistede __bulunmuyor__!");

                    delete alisa.blacklistGuilds[userOrGuild.id];
                    content = `**${userOrGuild.name} - (${userOrGuild.id})** sunucu başarıyla kara listeden çıkarıldı!`
                }

                return msg.reply(content);
            }

            case "liste":
            case "list": {
                const allBlacklistUsers = Object.entries(alisa.blacklistUsers);
                const allBlacklistGuilds = Object.entries(alisa.blacklistGuilds);

                const allBlacklist = [...allBlacklistUsers, ...allBlacklistGuilds].sort((a, b) => b[1].addedTimestamp - a[1].addedTimestamp);

                // Eğer kara listede hiç kimse yoksa
                if (!allBlacklist.length) return msg.reply("Kara listede hiç kimse bulunmuyor! Oleyy 🎉");

                const clientAvatar = msg.client.user.displayAvatarURL();

                return createMessageArrows({
                    msg,
                    array: allBlacklist,
                    async arrayValuesFunc({
                        result: [id, {
                            reason,
                            ownerId,
                            addedTimestamp
                        }],
                        index,
                        length
                    }) {
                        const userOrGuild = await findUserOrGuild(id);
                        let name, emoji;

                        if (userOrGuild instanceof User) {
                            name = userOrGuild.tag;
                            emoji = "👤";
                        } else {
                            name = "Sunucu";
                            emoji = "🏰";
                        };

                        // Milisaniyeyi saniyeye çevir
                        addedTimestamp = Util.msToSecond(addedTimestamp);

                        return `• \`${length - index}\` ${emoji} **${name} - (${id})**\n` +
                            `• **Sebep:** ${reason || "Sebep belirtilmemiş"}\n` +
                            `• **Ekleyen:** <@${ownerId}> - (${ownerId})\n` +
                            `• **Eklenme Tarihi:** <t:${addedTimestamp}:F> - <t:${addedTimestamp}:R>`;
                    },
                    embed: {
                        author: {
                            name: msg.client.user.tag,
                            iconURL: clientAvatar
                        },
                        description: `**• Kara listede toplam ${allBlacklist.length} kişi/sunucu bulunuyor**`,
                        thumbnail: clientAvatar,
                    },
                    pageJoin: "\n\n",
                    arrowTimeout: 1000 * 60 * 10 // 10 dakika
                });
            }

            default:
                return msg.reply(
                    `Lütfen geçerli bir işlem belirtiniz\n\n` +
                    `**• ${prefix}kl ekle <Kullanıcı/Sunucu ID> [Sebep]**\n` +
                    `**• ${prefix}kl çıkar <Kullanıcı/Sunucu ID> [Sebep]**\n` +
                    `**• ${prefix}kl liste**`
                );
        }

    },
};