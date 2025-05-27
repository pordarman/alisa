"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util");
const os = require("os");
const pathModule = require("path");
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: { // Komutun ismi
        tr: "s",
        en: "s"

    },
    id: "s", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "s",
            "showstats",
            "ist"
        ],
        en: [
            "s",
            "showstats",
        ],

    },
    description: { // Komutun açıklaması
        tr: "Botun sunucu, kişi, rol, kanal sayısı, botun pingi ve daha fazlasını gösterir",
        en: "Shows the number of servers, people, roles, channels, bot ping and more"

    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"

    },
    usage: { // Komutun kullanım şekli
        tr: "<px>s",
        en: "<px>s"

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
        msg
    }) {

        const message = await msg.reply("Veriler alınıyor...");
        if (!message) return;

        const counts = {
            guild: 0,
            member: 0,
            bot: 0,
            role: 0,
            channels: {
                text: 0,
                voice: 0,
                category: 0,
                others: 0,
                total: 0
            },
            memory: 0
        };
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        // Bütün shardslarda dön ve verileri topla
        const allDatas = await msg.client.shard.broadcastEval(async (client, path) => {
            const pathModule = require("path");
            const Util = require(pathModule.resolve(path, "Helpers", "Util.js"));
            const {
                ChannelType
            } = require("discord.js");

            const result = {
                guild: 0,
                member: 0,
                bot: 0,
                role: 0,
                channels: {
                    text: 0,
                    voice: 0,
                    category: 0,
                    others: 0,
                    total: 0
                },
                emojis: {
                    animated: 0,
                    normal: 0,
                    total: 0
                },
                memory: 0
            };

            result.guild += client.guilds.cache.size;
            result.memory += process.memoryUsage().heapUsed;

            client.channels.cache.forEach(channel => {
                switch (channel.type) {
                    case ChannelType.GuildText:
                        result.channels.text++;
                        break;
                    case ChannelType.GuildVoice:
                        result.channels.voice++;
                        break;
                    case ChannelType.GuildCategory:
                        result.channels.category++;
                        break;
                    default:
                        result.channels.others++;
                        break;
                }
            });
            result.channels.total += client.channels.cache.size;

            // Bütün sunucularda dolaş
            await Promise.all(
                client.guilds.cache.map(async guild => {
                    const members = await Util.getMembers(guild);
                    const botSize = members.filter(member => member.user.bot).size;

                    result.member += members.size - botSize;
                    result.bot += botSize;
                    result.role += guild.roles.cache.size;
                })
            );

            return result;
        }, {
            context: __dirname.split(`${pathModule.sep}Commands`)[0]
        });

        // Bütün shardlardan gelen verileri topla
        for (let i = 0; i < allDatas.length; ++i) {
            const data = allDatas[i];
            counts.guild += data.guild;
            counts.member += data.member;
            counts.bot += data.bot;
            counts.role += data.role;
            counts.channels.text += data.channels.text;
            counts.channels.voice += data.channels.voice;
            counts.channels.category += data.channels.category;
            counts.channels.others += data.channels.others;
            counts.channels.total += data.channels.total;
            counts.memory += data.memory;
        }

        function readMemory(usedMemory) {
            function baytToMegabayt(number, fixed = 0) {
                return (number / 1024 / 1024).toFixed(fixed);
            }
            function baytToGigabayt(number, fixed = 1) {
                return (number / 1024 / 1024 / 1024).toFixed(fixed);
            }

            const gigabayt = baytToGigabayt(usedMemory);
            // Eğer bellek kullanımı 1 gb'yi aştıysa gigabayt'a çevir ve geri döndür
            return parseFloat(gigabayt) >= 1 ?
                `${gigabayt} GB` :
                `${baytToMegabayt(usedMemory)} MB`;
        }

        const clientAvatar = msg.client.user.displayAvatarURL();
        const lastUptime = Util.msToSecond(alisa.lastUptimeTimestamp);

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setAuthor({
                name: msg.client.user.username,
                iconURL: clientAvatar
            })
            .setDescription(`• **Son Yeniden Başlatılma Zamanı:** <t:${lastUptime}:F> - <t:${lastUptime}:R>`)
            .addFields(
                {
                    name: "GENEL BİLGİLER",
                    value: `**🌐 Sunucu sayısı:** ${Util.toHumanize(counts.guild)}\n` +
                        `**👥 Kullanıcı sayısı:** ${Util.toHumanize(counts.member)}\n` +
                        `**🤖 Bot sayısı:** ${Util.toHumanize(counts.bot)}\n` +
                        `**${EMOJIS.role} Rol sayısı:** ${Util.toHumanize(counts.role)}`,
                },
                {
                    name: `KANAL BİLGİLERİ (${Util.toHumanize(counts.channels.total)})`,
                    value: `${EMOJIS.channel} **Yazı kanalı:** ${Util.toHumanize(counts.channels.text)}\n` +
                        `${EMOJIS.voice} **Ses kanalı:** ${Util.toHumanize(counts.channels.voice)}\n` +
                        `🖇️ **Kategori:** ${Util.toHumanize(counts.channels.category)}\n` +
                        `🎞️ **Diğerleri:** ${Util.toHumanize(counts.channels.others)}`,
                },
                {
                    name: "BOTUN DURUMU",
                    value: `🏓 **Ping:** ${msg.client.ws.ping} ms\n` +
                        `🎚️ **Botun kullandığı bellek:** ${readMemory(counts.memory)}\n` +
                        `📡 **VDS'in kullandığı bellek:** ${readMemory(usedMemory)}\n` +
                        `🔋 **VDS'in toplam belleği:** ${readMemory(totalMemory)}`,
                },
            )
            .setTimestamp();

        await message.edit({ content: "✅ Veriler alındı!", embeds: [embed] });


    },
};