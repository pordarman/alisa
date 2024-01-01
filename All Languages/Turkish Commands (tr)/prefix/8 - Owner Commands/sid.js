"use strict";
const {
    shardCount,
    EMOJIS
} = require("../../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "sid", // Komutun ismi
    id: "sid", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "sid"
    ],
    description: "Girilen ID'nin bilgilerini döndürür", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>sid <ID veya isim>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        msg,
        args,
        errorEmbed,
        language
    }) {

        const idOrName = args[0];

        // Eğer bir veri girilmemişse
        if (!idOrName) return errorEmbed(`Lütfen bir ID veya isim giriniz`);

        // Bütün shardlarda teker teker dön ve bulunan veriyi döndür
        for (let i = 0; i < shardCount; i++) {
            // Veriyi bul
            const data = await msg.client.shard.broadcastEval(
                async (client, {
                    idOrName,
                    dirname,
                    isId,
                    EMOJIS,
                    language
                }) => {

                    // Herhangi bir hataya karşı komutu try içinde çalıştır
                    try {

                        const {
                            ChannelType,
                            EmbedBuilder
                        } = require("discord.js");
                        const Util = require(`${dirname}\\Helpers\\Util.js`);

                        const embed = new EmbedBuilder()
                            .setColor("Blue")
                            .setTimestamp();

                        // Eğer sunucu bulunduysa
                        const guild = client.guilds.cache.get(idOrName) || client.guilds.cache.find(
                            (guild) => guild.name === idOrName ||
                                guild.name.replace(/ +/, " ").toLocaleLowerCase(language) == idOrName.toLocaleLowerCase(language) // Eğer sunucunun isminin bir kısmını yazmışsa bile sunucuyu döndür
                        );
                        if (guild) {
                            const allMembers = await Util.getMembers({ guild });
                            const allChannels = guild.channels.cache;
                            const guildIcon = guild.iconURL();
                            const guildBanner = guild.bannerURL();
                            const botCount = allMembers.filter(member => member.user.bot).size;
                            const channelsCount = {
                                text: 0,
                                voice: 0,
                                others: 0
                            }

                            // Bütün kanallarda dolaş ve kanal sayılarını kaydet
                            allChannels.forEach(channel => {
                                switch (channel.type) {
                                    case ChannelType.GuildText:
                                        channelsCount.text += 1;
                                        break;

                                    case ChannelType.GuildVoice:
                                        channelsCount.voice += 1;
                                        break;

                                    default:
                                        channelsCount.others += 1;
                                        break;
                                }
                            });

                            return embed
                                .setTitle("Sunucu bulundu")
                                .setDescription(
                                    `Girdiğin ${isId ? "ID" : "isim"} **${guild.name}** adlı sunucuya ait`
                                )
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `📝 **Sunucu adı:** ${guild.name}\n` +
                                            `🆔 **Sunucu ID'si:** ${guild.id}\n` +
                                            `📅 **Sunucunun kurulma zamanı:** <t:${Math.round(guild.createdTimestamp / 1000)}:F> - <t:${Math.round(guild.createdTimestamp / 1000)}:R>\n` +
                                            `👥 **Kişi sayısı:** ${guild.memberCount} (${allMembers.size - botCount} Üye, ${botCount} Bot)\n` +
                                            `🎞️ **Kanal sayısı:** ${allChannels.size} (${EMOJIS.channel} ${channelsCount.text}, ${EMOJIS.voice} ${channelsCount.voice}, 🎞️ ${channelsCount.others})\n` +
                                            `${EMOJIS.role} **Rol sayısı:** ${guild.roles.cache.size}\n` +
                                            `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                    }
                                )
                                .setImage(guildBanner)
                                .setThumbnail(guildIcon);
                        }

                        // Eğer kanal bulunduysa
                        const channel = client.channels.cache.get(idOrName) || client.channels.cache.find(
                            (channel) => channel.name && (channel.name === idOrName ||
                                channel.name.replace(/ +/, " ").toLocaleLowerCase(language) == idOrName.toLocaleLowerCase(language)) // Eğer kanalın isminin bir kısmını yazmışsa bile sunucuyu döndür
                        );
                        if (channel) {
                            const allMembers = await Util.getMembers(channel);
                            const guild = channel.guild;
                            const guildIcon = guild.iconURL();
                            const guildBanner = guild.bannerURL();

                            const channelType = {
                                "0": `Yazı kanalı ${EMOJIS.channel}`,
                                "2": `Ses kanalı ${EMOJIS.voice}`,
                                "4": `Kategori 🎞️`,
                                "5": `Haber kanalı ${EMOJIS.channel}`
                            }[channel.type];

                            return embed
                                .setTitle("Kanal bulundu")
                                .setDescription(
                                    `Girdiğin ${isId ? "ID" : "isim"} **#${channel.name}** adlı kanala ait`
                                )
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `📝 **Kanal adı:** ${channel.name}\n` +
                                            `🆔 **Kanal ID'si:** ${channel.id}\n` +
                                            `❓ **Kanalın tipi:** ${channelType}\n` +
                                            `📅 **Kanalın kurulma zamanı:** <t:${Math.round(channel.createdTimestamp / 1000)}:F> - <t:${Math.round(channel.createdTimestamp / 1000)}:R>\n` +
                                            `💻 **Kanalın bulunduğu sunucu:** ${guild.name} - (${guild.id})\n` +
                                            `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                    }
                                )
                                .setImage(guildBanner)
                                .setThumbnail(guildIcon);
                        }

                        // Eğer kullanıcı bulunduysa
                        const user = client.users.cache.get(idOrName) || client.users.cache.find(
                            (user) => user.username === idOrName ||
                                user.username.toLocaleLowerCase(language) == idOrName.toLocaleLowerCase(language) // Eğer kullanıcının isminin bir kısmını yazmışsa bile sunucuyu döndür
                        );
                        if (user) {
                            const userBanner = user.bannerURL() ?? null;
                            const userAvatar = user.displayAvatarURL();

                            return embed
                                .setTitle("Kullanıcı bulundu")
                                .setDescription(
                                    `Girdiğin ${isId ? "ID" : "isim"} **${user.username}** adlı kullanıcıya ait`
                                )
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `📝 **Kullanıcı adı:** ${user.tag}\n` +
                                            `🆔 **ID'si:** ${user.id}\n` +
                                            `${user.bot ? "🤖 **Bot mu:** Bot" : "👤 **Bot mu:** İnsan"}\n` +
                                            `📅 **Hesabı oluşturma zamanı:** <t:${Math.round(user.createdTimestamp / 1000)}:F> - <t:${Math.round(user.createdTimestamp / 1000)}:R>`
                                    }
                                )
                                .setImage(userBanner)
                                .setThumbnail(userAvatar);
                        }

                        let role;

                        // Bütün sunucularda teker teker dolaş ve rol var mı yok mu kontrol et
                        for (const [_, guild] of client.guilds.cache.entries()) {
                            const guildRole = guild.roles.cache.get(idOrName) || guild.roles.cache.find(
                                (role) => role.name === idOrName ||
                                    role.name.replace(/ +/, " ").toLocaleLowerCase(language) == idOrName.toLocaleLowerCase(language) // Eğer rolün isminin bir kısmını yazmışsa bile sunucuyu döndür
                            );

                            // Eğer rol varsa rolü kaydet ve döngüyü bitir
                            if (guildRole) {
                                role = guildRole;
                                break;
                            }
                        }

                        // Eğer rol varsa
                        if (role) {
                            const guild = role.guild;

                            // Bu role sahip kullanıcıları çekmek için bütün üyeleri önbelleğe kaydet
                            const allMembers = await Util.getMembers({ guild });

                            const members = role.members;

                            return embed
                                .setTitle("Kullanıcı bulundu")
                                .setDescription(
                                    `Girdiğin ${isId ? "ID" : "isim"} **${role.name}** adlı kullanıcıya ait`
                                )
                                .addFields(
                                    {
                                        name: "Bilgileri",
                                        value: `📝 **Adı:** ${role.name}\n` +
                                            `🆔 **ID'si:** ${role.id}\n` +
                                            `🖌️ **Rolün rengi:** ${role.hexColor}\n` +
                                            `📅 **Rolün oluşturulma tarihi:** <t:${Math.round(role.createdTimestamp / 1000)}:F> - <t:${Math.round(role.createdTimestamp / 1000)}:R>\n` +
                                            `❓ **Rol kim tarafından oluşturulmuş:** ${role.managed ? "Bot 🤖" : "İnsan 👤"}\n` +
                                            `${EMOJIS.role} **Rolden bahsedilebilir mi:** ${role.mentionable ? "Evet" : "Hayır"}\n` +
                                            `${role.hoist ? "👤 **Bu rol diğer üyelerden ayrı mı:** Evet" : "🫂 **Bu rol diğer üyelerden ayrı mı:** Hayır"}\n` +
                                            `📍 **Rolün sunucudaki sırası:** ${role.position}/${role.guild.roles.cache.size}\n` +
                                            `💻 **Rolün bulunduğu sunucu:** ${guild.name} - (${guild.id})\n` +
                                            `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                    },
                                    {
                                        name: `👥 BU ROLE SAHİP KULLANICILAR (${Util.toHumanize(members.size, language)})`,
                                        value: members.size == 0 ?
                                            "Kimse bu role sahip değil.." :
                                            [...members.values()]
                                                .slice(0, Util.MAX.membersForSid)
                                                .map(member => `<@${member.user.id}>`)
                                                // Eğer 40'dan fazla kullanıcı varsa onları da belirt
                                                .join(" | ") + (members.size > Util.MAX.membersForSid ? `+${members.size - Util.MAX.membersForSid} daha...` : "")
                                    }
                                )
                                .setColor(role.hexColor ?? "#9e02e2")
                                .setThumbnail(`https://www.colorhexa.com/${role.hexColor.slice(1)}.png`)
                        }

                    } catch (error) {
                        console.log(error)
                    }
                },
                {
                    shard: i,
                    context: {
                        idOrName,
                        dirname: __dirname.replace(/\\All Languages.*/, ""),
                        isId: /^\d{17,20}$/.test(idOrName),
                        EMOJIS,
                        language
                    }
                }
            );

            // Eğer veri varsa veriyi döndür
            if (data) return msg.reply({
                embeds: [
                    data
                ]
            });
        }

        // Eğer girilen veri bir ID ise
        if (
            /^\d{17,20}$/.test(idOrName)
        ) {
            const user = await msg.client.users.fetch(idOrName).catch(() => { });
            if (user) {
                const userBanner = user.bannerURL() ?? null;
                const userAvatar = user.displayAvatarURL();

                return new EmbedBuilder()
                    .setTitle("Kullanıcı bulundu")
                    .setDescription(
                        `Girdiğin ID **${user.username}** adlı kullanıcıya ait`
                    )
                    .addFields(
                        {
                            name: "Bilgileri",
                            value: `📝 **Kullanıcı adı:** ${user.tag}\n` +
                                `🆔 **ID'si:** ${user.id}\n` +
                                `${user.bot ? "🤖 **Bot mu:** Bot" : "👤 **Bot mu:** İnsan"}\n` +
                                `📅 **Hesabı oluşturma zamanı:** <t:${Math.round(user.createdTimestamp / 1000)}:F> - <t:${Math.round(user.createdTimestamp / 1000)}:R>`
                        }
                    )
                    .setColor("Blue")
                    .setImage(userBanner)
                    .setThumbnail(userAvatar)
                    .setTimestamp();
            }
        }

        // Eğer hiçbir veri bulunamadıysa
        return msg.reply(
            `**• Yazdığın veriyle ilgili hiçbir şey bulunamadı!**`
        );

    },
};