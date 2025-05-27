"use strict";
const {
    shardCount,
    EMOJIS
} = require("../../../settings.json");
const {
    EmbedBuilder
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");
const path = require("path");

module.exports = {
    name: { // Komutun ismi
        tr: "sid",
        en: "sid"
    },
    id: "sid", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "sid",
        ],
        en: [
            "sid",
        ]
    },
    description: { // Komutun açıklaması
        tr: "Girilen ID'nin bilgilerini döndürür",
        en: "Returns the information of the entered ID"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>sid <ID veya isim>",
        en: "<px>sid <ID or name>"
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
        prefix,
        errorEmbed,
        language
    }) {

        let idOrName = Util.getContentWithoutCommandName(msg.content, prefix, this.aliases[language]);

        // Eğer bir veri girilmemişse
        if (!idOrName) return errorEmbed(
            `Lütfen bir ID veya isim giriniz (Özel arama yapmak için <tip:rol>, <tip:kullanıcı> gibi belirtebilirsiniz)`,
            "warn",
            1000 * 30 // 30 saniye sonra mesajı sil
        );

        // Eğer mesajda tip belirtiliyorsa tipi al ve veriyi temizle
        let type;
        idOrName = idOrName.replace(/<tip:[^>]+>/i, (match) => {
            type = match.slice(5, -1).toLowerCase();
            return "";
        }).trim();

        let typeContent;

        // Eğer belirtilen bir tip varsa sadece o tipleri dene
        switch (type) {
            case "guild":
            case "sunucu":
            case "server":
                typeContent = "Sunucu";
            case "user":
            case "kullanıcı":
            case "member":
            case "üye":
            case "kişi":
            case "person":
                typeContent = "Kullanıcı";
            case "channel":
            case "kanal":
                typeContent = "Kanal";
            case "role":
            case "rol":
                typeContent = "Rol";
            default:
                typeContent = "Veri";
        }

        const message = await msg.reply(`${typeContent} aranıyor...`);

        // Eğer bir hata olur da mesaj atılamazsa hiçbir şey yapma
        if (!message) return;

        // Bütün shardlarda teker teker dön ve bulunan veriyi döndür
        for (let i = 0; i < shardCount; i++) {

            const [_, data] = await Promise.all([

                message.edit(`${typeContent} aranıyor... (Shard ${i + 1}/${shardCount})`),

                // Veriyi bul
                msg.client.shard.broadcastEval(
                    async (client, {
                        idOrName,
                        dirname,
                        EMOJIS,
                        type
                    }) => {

                        // Herhangi bir hataya karşı komutu try içinde çalıştır
                        try {

                            const path = require("path");
                            const {
                                ChannelType,
                                EmbedBuilder,
                                ActivityType
                            } = require("discord.js");
                            const Util = require(path.join(dirname, "Helpers", "Util.js"));

                            const embed = new EmbedBuilder()
                                .setColor("Blue")
                                .setTimestamp();

                            // Girilen verinin ID olup olmadığını kontrol et
                            const isId = /^\d{17,20}$/.test(idOrName);

                            // Eğer belirtilen bir tip varsa sadece o tipleri dene
                            switch (type) {
                                case "Sunucu":
                                    return await findGuild();
                                case "Kullanıcı":
                                    return await findUser();
                                case "Kanal":
                                    return await findChannel();
                                case "Rol":
                                    return await findRole();

                                // Eğer aranacak herhangi bir tip belirtilmemişse bütün tipleri dene
                                default:
                                    return await findAnything();
                            }

                            // Sunucu bulma fonksiyonu
                            async function findGuild() {
                                const guild = isId ? client.guilds.cache.get(idOrName) : client.guilds.cache.find(
                                    (guild) => guild.name === idOrName ||
                                        guild.name.replace(/ +/, " ").toLocaleLowerCase("tr").includes(idOrName.toLocaleLowerCase("tr")) // Eğer sunucunun isminin bir kısmını yazmışsa bile sunucuyu döndür
                                );

                                // Eğer sunucu bulunduysa
                                if (guild) {
                                    const allMembers = await Util.getMembers(guild);
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

                                    const createdTimestampSeconds = Util.msToSecond(guild.createdTimestamp);

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
                                                    `📅 **Sunucunun kurulma zamanı:** <t:${createdTimestampSeconds}:F> - <t:${createdTimestampSeconds}:R>\n` +
                                                    `👥 **Kişi sayısı:** ${guild.memberCount} (${allMembers.size - botCount} Üye, ${botCount} Bot)\n` +
                                                    `🎞️ **Kanal sayısı:** ${allChannels.size} (${EMOJIS.channel} ${channelsCount.text}, ${EMOJIS.voice} ${channelsCount.voice}, 🎞️ ${channelsCount.others})\n` +
                                                    `${EMOJIS.role} **Rol sayısı:** ${guild.roles.cache.size}\n` +
                                                    `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                            }
                                        )
                                        .setImage(guildBanner)
                                        .setThumbnail(guildIcon);
                                }
                            }

                            // Kanal bulma fonksiyonu
                            async function findChannel() {
                                const channel = isId ? client.channels.cache.get(idOrName) : client.channels.cache.find(
                                    (channel) => channel.name && (channel.name === idOrName ||
                                        channel.name.replace(/ +/, " ").toLocaleLowerCase("tr").includes(idOrName.toLocaleLowerCase("tr"))) // Eğer kanalın isminin bir kısmını yazmışsa bile sunucuyu döndür
                                );

                                // Eğer kanal bulunduysa
                                if (channel) {
                                    const allMembers = await Util.getMembers(channel.guild);
                                    const guild = channel.guild;
                                    const guildIcon = guild.iconURL();
                                    const guildBanner = guild.bannerURL();

                                    const channelType = {
                                        "0": `Yazı kanalı ${EMOJIS.channel}`,
                                        "2": `Ses kanalı ${EMOJIS.voice}`,
                                        "4": `Kategori 🎞️`,
                                        "5": `Haber kanalı ${EMOJIS.channel}`
                                    }[channel.type];

                                    const createdTimestampSeconds = Util.msToSecond(channel.createdTimestamp);

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
                                                    `📅 **Kanalın kurulma zamanı:** <t:${createdTimestampSeconds}:F> - <t:${createdTimestampSeconds}:R>\n` +
                                                    `💻 **Kanalın bulunduğu sunucu:** ${guild.name} - (${guild.id})\n` +
                                                    `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                            }
                                        )
                                        .setImage(guildBanner)
                                        .setThumbnail(guildIcon);
                                }
                            }

                            // Kullanıcı bulma fonksiyonu
                            async function findUser() {
                                let user;
                                let member;

                                // Bütün sunucularda teker teker dolaş ve kullanıcı var mı yok mu kontrol et
                                for (const [_, guild] of client.guilds.cache.entries()) {
                                    const members = await Util.getMembers(guild);
                                    const guildUser = isId ? members.get(idOrName) : members.find(
                                        (member) => member.user.username === idOrName ||
                                            member.user.username.replace(/ +/, " ").toLocaleLowerCase("tr").includes(idOrName.toLocaleLowerCase("tr")) // Eğer kullanıcının isminin bir kısmını yazmışsa bile sunucuyu döndür
                                    );

                                    // Eğer kullanıcı varsa kullanıcıyı kaydet ve döngüyü bitir
                                    if (guildUser) {
                                        member = guildUser;
                                        user = guildUser.user;
                                        break;
                                    }
                                };

                                if (user) {
                                    const fromArray = [];

                                    const status = {
                                        online: `${EMOJIS.online} Çevrimiçi`,
                                        idle: `${EMOJIS.idle} Boşta`,
                                        dnd: `${EMOJIS.dnd} Rahatsız etmeyin`,
                                        offline: `${EMOJIS.offline} Çevrimdışı`
                                    }[member.presence?.status ?? "offline"];

                                    const presences = [];

                                    if (member.presence) {
                                        if (member.presence.clientStatus?.desktop) fromArray.push("Bilgisayardan");
                                        if (member.presence.clientStatus?.mobile) fromArray.push("Telefondan");
                                        if (member.presence.clientStatus?.web) fromArray.push("İnternetten");

                                        if (member.presence?.activities) {
                                            for (const memberActivity of member.presence?.activities) {
                                                switch (memberActivity.type) {
                                                    case ActivityType.Custom:
                                                        presences.push(`(${memberActivity.state})`);
                                                        break;

                                                    case ActivityType.Listening:
                                                        presences.push(`${memberActivity.name} - ${memberActivity.details} dinliyor`);
                                                        break;

                                                    case ActivityType.Playing:
                                                        presences.push(`${memberActivity.name} oynuyor`);
                                                        break;

                                                    case ActivityType.Streaming:
                                                        presences.push(`[${memberActivity.name}](${memberActivity.url}) yayında`);
                                                        break;

                                                    case ActivityType.Watching:
                                                        presences.push(`${memberActivity.name} izliyor`);
                                                        break;

                                                    case ActivityType.Competing:
                                                        presences.push(`Yarışıyor: ${memberActivity.name}`);
                                                        break;
                                                }
                                            }
                                            if (presences.length == 0) {
                                                presences.push("Üye şu anda hiçbir şey yapmıyor");
                                            }
                                        }
                                    }
                                    if (fromArray.length == 0) {
                                        fromArray.push("Bilinmiyor");
                                    }
                                    if (presences.length == 0) {
                                        presences.push("Üye şu anda çevrimdışı olduğu için aktivite bilgisi alınamadı");
                                    }

                                    await user.fetch(true).catch(() => { });
                                    const userBanner = user.bannerURL() || null;
                                    const userAvatar = user.displayAvatarURL();

                                    const createdTimestampSeconds = Util.msToSecond(user.createdTimestamp);

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
                                                    `📅 **Hesabı oluşturma zamanı:** <t:${createdTimestampSeconds}:F> - <t:${createdTimestampSeconds}:R>\n` +
                                                    `💻 **Ortak sunucu var mı:** Evet\n` +
                                                    `❓ **Durumu:** ${status}\n` +
                                                    `☎️ **Nereden bağlanıyor**: ${Util.formatArray(fromArray, "tr")}\n` +
                                                    `🎮 **Aktiviteleri:** ${Util.formatArray(presences, "tr")}`
                                            }
                                        )
                                        .setImage(userBanner)
                                        .setThumbnail(userAvatar);
                                }
                            }

                            // Rol bulma fonksiyonu
                            async function findRole() {
                                let role;

                                // Bütün sunucularda teker teker dolaş ve rol var mı yok mu kontrol et
                                for (const [_, guild] of client.guilds.cache.entries()) {
                                    const guildRole = isId ? guild.roles.cache.get(idOrName) : guild.roles.cache.find(
                                        (role) => role.name === idOrName ||
                                            role.name.replace(/ +/, " ").toLocaleLowerCase("tr").includes(idOrName.toLocaleLowerCase("tr")) // Eğer rolün isminin bir kısmını yazmışsa bile sunucuyu döndür
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
                                    const allMembers = await Util.getMembers(guild);

                                    const members = role.members;

                                    const createdTimestampSeconds = Util.msToSecond(role.createdTimestamp);

                                    return embed
                                        .setTitle("Rol bulundu")
                                        .setDescription(
                                            `Girdiğin ${isId ? "ID" : "isim"} **${role.name}** adlı role ait`
                                        )
                                        .addFields(
                                            {
                                                name: "Bilgileri",
                                                value: `📝 **Adı:** ${role.name}\n` +
                                                    `🆔 **ID'si:** ${role.id}\n` +
                                                    `🖌️ **Rolün rengi:** ${role.hexColor}\n` +
                                                    `📅 **Rolün oluşturulma tarihi:** <t:${createdTimestampSeconds}:F> - <t:${createdTimestampSeconds}:R>\n` +
                                                    `❓ **Rol kim tarafından oluşturulmuş:** ${role.managed ? "Bot 🤖" : "İnsan 👤"}\n` +
                                                    `${EMOJIS.role} **Rolden bahsedilebilir mi:** ${role.mentionable ? "Evet" : "Hayır"}\n` +
                                                    `${role.hoist ? "👤 **Bu rol diğer üyelerden ayrı mı:** Evet" : "🫂 **Bu rol diğer üyelerden ayrı mı:** Hayır"}\n` +
                                                    `📍 **Rolün sunucudaki sırası:** ${role.position}/${role.guild.roles.cache.size}\n` +
                                                    `💻 **Rolün bulunduğu sunucu:** ${guild.name} - (${guild.id})\n` +
                                                    `👑 **Sunucu sahibi:** <@${guild.ownerId}> | ${allMembers.get(guild.ownerId).user.tag}`
                                            },
                                            {
                                                name: `👥 BU ROLE SAHİP KULLANICILAR (${Util.toHumanize(members.size, "tr")})`,
                                                value: members.size == 0 ?
                                                    "Kimse bu role sahip değil.." :
                                                    Util.sliceMapAndJoin(
                                                        [...members.values()],
                                                        0,
                                                        Util.MAX.membersForSid,
                                                        member => `<@${member.user.id}>`,
                                                        " | "
                                                    )
                                                    // Eğer 40'dan fazla kullanıcı varsa onları da belirt
                                                    + (members.size > Util.MAX.membersForSid ? `+${members.size - Util.MAX.membersForSid} daha...` : "")
                                            }
                                        )
                                        .setColor(role.hexColor ?? "#9e02e2")
                                        .setThumbnail(`https://www.colorhexa.com/${role.hexColor.slice(1)}.png`)
                                }
                            }

                            async function findAnything() {
                                return await findGuild() || await findUser() || await findChannel() || await findRole();
                            }

                        } catch (error) {
                            console.error(error)
                        }
                    },
                    {
                        shard: i,
                        context: {
                            idOrName,
                            dirname: __dirname.split(`${path.sep}Commands`)[0],
                            EMOJIS,
                            type: typeContent
                        }
                    }
                )
            ]);

            // Eğer veri varsa veriyi döndür
            if (data) return message.edit({
                embeds: [
                    data
                ],
                content: null
            });
        }

        // Şimdi ise üyeyi fetch ile çek ve eğer varsa üyenin bilgilerini döndür
        const user = await msg.client.users.fetch(idOrName).catch(() => { });
        if (user) {
            await user.fetch().catch(() => { });
            const userBanner = user.bannerURL() || null;
            const userAvatar = user.displayAvatarURL();

            const createdTimestampSeconds = Util.msToSecond(user.createdTimestamp);

            const embed = new EmbedBuilder()
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
                            `📅 **Hesabı oluşturma zamanı:** <t:${createdTimestampSeconds}:F> - <t:${createdTimestampSeconds}:R>\n` +
                            `💻 **Ortak sunucu var mı:** Hayır\n` +
                            `❓ **Durumu:** Bilinmiyor\n` +
                            `☎️ **Nereden bağlanıyor**: Bilinmiyor\n` +
                            `🎮 **Aktiviteleri:** Bilinmiyor`
                    }
                )
                .setImage(userBanner)
                .setThumbnail(userAvatar);

            return message.edit({
                embeds: [
                    embed
                ],
                content: null
            });
        }

        // Eğer hiçbir veri bulunamadıysa
        return message.edit(
            `**• Yazdığın veriyle ilgili hiçbir ${typeContent.toLocaleLowerCase("tr")} bulunamadı!**`
        );

    },
};