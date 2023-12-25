"use strict";
const {
    EmbedBuilder,
    GuildChannel,
    ChannelType,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database");
const Util = require("../../../Helpers/Util");

module.exports = {
    name: Events.ChannelDelete,
    /**
     * 
     * @param {GuildChannel} channel 
     */
    async execute(channel) {
        try {
            const startedTimestamp = Date.now();

            const { guild } = channel;

            // Eğer silinen kanal bir sunucuda değilse hiçbir şey döndürme
            if (!guild) return;

            const deletedChannels = [];

            // Eğer silinen kanal bir ses kanalıysa ve silinen kanal botun gireceği ses kanalıysa
            if (channel.type == ChannelType.GuildVoice) {
                const guildId = channel.guildId;
                const guildDatabase = Util.getGuildData(channel.client, guildId);

                // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
                const allMessages = Util.rolesAndChannelMessages[guildDatabase.language];

                if (channel.id == guildDatabase.channelIds.voice) {
                    // Database'ye kaydet
                    guildDatabase.channelIds.voice = "";
                    database.writeFile(guildDatabase, guildId);

                    // Eğer interval ayarlanmışsa interval'i kaldır
                    const interval = channel.client.guildVoices.get(guildId);
                    if (typeof interval == "function") {
                        channel.client.guildVoices.delete(guildId);
                        clearInterval(interval);
                    }

                    deletedChannels.push(allMessages.voice);

                    // Sunucu sahibine mesaj gönder
                    return sendGuildOwnerMessage();
                }
            }

            // Eğer silinen kanal bir text kanalı değilse hiçbir şey döndürme
            if (channel.type != ChannelType.GuildText) return;

            const guildId = channel.guildId;
            const guildDatabase = Util.getGuildData(channel.client, guildId);

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const allMessages = Util.rolesAndChannelMessages[guildDatabase.language];

            const channelId = channel.id;

            const { channelIds } = guildDatabase.register;

            // Eğer silinen kanal bir kayıt kanalıysa
            if (channelIds.register == channelId) {
                channelIds.register = "";
                deletedChannels.push(allMessages.registerChannel)
            }

            // Eğer silinen kanal bir kayıt sonrası kanalıysa
            if (channelIds.afterRegister == channelId) {
                channelIds.afterRegister = "";
                deletedChannels.push(allMessages.afterRegisterChannel)
            }

            // Eğer silinen kanal bir kayıt log kanalıysa
            if (channelIds.log == channelId) {
                channelIds.log = "";
                deletedChannels.push(allMessages.registerLogChannel)
            }

            // Eğer silinen kanal bir jail log kanalıysa
            if (guildDatabase.jail.logChannelId == channelId) {
                guildDatabase.jail.logChannelId = "";
                deletedChannels.push(allMessages.jailLogChannel)
            }

            // Sunucu sahibine mesaj gönder
            return sendGuildOwnerMessage();

            // Bu fonksiyonu 2 kerde kullanacağımız için tekrar tekrar yazmak yerine fonksiyon olarak kaydet
            async function sendGuildOwnerMessage() {
                // Eğer kaydedilen kanallardan herhangi biri silinmişse databaseye kaydet ve sunucu sahibine mesaj gönder
                if (deletedChannels.length > 0) {
                    // Database'ye kaydet
                    database.writeFile(guildDatabase, guildId);

                    const guildOwner = await Util.fetchUserForce(channel.client, guild.ownerId);

                    // Eğer sunucu sahibini çekemediyse hiçbir şey döndürme
                    if (!guildOwner) return;

                    const {
                        embed: {
                            title,
                            channelDescription,
                            and
                        }
                    } = allMessages;

                    const lastElement = deletedChannels.pop();
                    const informationMessage = deletedChannels.length ? `${deletedChannels.join(", ")} ${and} ${lastElement}` : lastElement;

                    const embed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(
                            channelDescription({
                                guild,
                                guildId,
                                informationMessage,
                                channel
                            })
                        )
                        .setColor("Blue")
                        .setTimestamp();

                    guildOwner.send({
                        embeds: [
                            embed
                        ]
                    });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}