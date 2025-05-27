"use strict";
const {
    EmbedBuilder,
    GuildChannel,
    ChannelType,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: Events.ChannelDelete,
    /**
     * 
     * @param {GuildChannel} channel 
     */
    async execute(channel) {
        try {

            const { guild } = channel;

            // Eğer silinen kanal bir sunucuda değilse hiçbir şey döndürme
            if (!guild) return;

            const deletedChannels = [];
            const setObject = {};
            const guildId = channel.guildId;
            const guildDatabase = await database.getGuild(guildId);
            const allInformationMessages = allMessages[guildDatabase.language].others.rolesAndChannels;

            // Eğer silinen kanal bir ses kanalıysa ve silinen kanal botun gireceği ses kanalıysa
            if (channel.type == ChannelType.GuildVoice && channel.id == guildDatabase.channelIds.voice) {
                // Database'ye kaydet
                guildDatabase.channelIds.voice = "";
                await database.updateGuild(guildId, {
                    $set: {
                        "channelIds.voice": ""
                    }
                });

                deletedChannels.push(allInformationMessages.voice);

                // Sunucu sahibine mesaj gönder
                return sendGuildOwnerMessage(setObject);
            }

            // Eğer silinen kanal bir text kanalı değilse hiçbir şey döndürme
            if (channel.type != ChannelType.GuildText) return;

            const channelId = channel.id;

            const { channelIds } = guildDatabase.register;

            // Eğer silinen kanal bir kayıt kanalıysa
            if (channelIds.register == channelId) {
                channelIds.register = setObject["register.channelIds.register"] = "";
                deletedChannels.push(allInformationMessages.registerChannel)
            }

            // Eğer silinen kanal bir kayıt sonrası kanalıysa
            if (channelIds.afterRegister == channelId) {
                channelIds.afterRegister = setObject["register.channelIds.afterRegister"] = "";
                deletedChannels.push(allInformationMessages.afterRegisterChannel)
            }

            // Eğer silinen kanal bir kayıt log kanalıysa
            if (channelIds.log == channelId) {
                channelIds.log = setObject["register.channelIds.log"] = "";
                deletedChannels.push(allInformationMessages.registerLogChannel)
            }

            // Eğer silinen kanal bir jail log kanalıysa
            if (guildDatabase.jail.logChannelId == channelId) {
                guildDatabase.jail.logChannelId = setObject["jail.logChannelId"] = "";
                deletedChannels.push(allInformationMessages.jailLogChannel)
            }

            // Eğer kaydedilen kanallardan herhangi biri silinmişse databaseye kaydet ve sunucu sahibine mesaj gönder
            if (deletedChannels.length > 0) return sendGuildOwnerMessage(setObject);

            // Bu fonksiyonu 2 kerde kullanacağımız için tekrar tekrar yazmak yerine fonksiyon olarak kaydet
            async function sendGuildOwnerMessage(db) {
                const [guildOwner] = await Promise.all([
                    Util.fetchUserForce(channel.client, guild.ownerId),

                    // Database'ye kaydet
                    database.updateGuild(guildId, {
                        $set: db
                    })
                ]);

                // Eğer sunucu sahibini çekemediyse hiçbir şey döndürme
                if (!guildOwner) return;

                const {
                    embed: {
                        title,
                        channelDescription
                    }
                } = allInformationMessages;

                const informationMessage = Util.formatArray(deletedChannels, guildDatabase.language);

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        channelDescription({
                            guildName: guild.name,
                            guildId,
                            informationMessage,
                            channelName: channel.name
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
        } catch (e) {
            console.error(e);
        }
    }
}