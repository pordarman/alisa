"use strict";
const {
    Events,
    Guild
} = require("discord.js");
const database = require("../../Helpers/Database");
const {
    supportGuildId,
    channelIds: {
        guildDelete: guildDeleteChannelId
    }
} = require("../../settings.json");
const {
    guildDelete
} = require("../../messages.json");
const Util = require("../../Helpers/Util");

module.exports = {
    name: Events.GuildDelete,
    /**
     * 
     * @param {Guild} guild 
     */
    async execute(guild) {
        try {

            const alisaFile = database.getFile("alisa", "other");

            const guildId = guild.id;

            // Eğer sunucu karalistede varsa hiç mesaj göndermeden sil
            if (alisaFile.blacklistGuilds[guildId]) return;

            // Sunucudaki bütün bekleyen mesajları sil
            const guildDatabase = Util.getGuildData(guild.client, guildId);
            guildDatabase.waitMessageCommands = database.defaultGuildDatabase.waitMessageCommands;
            database.writeFile(guildDatabase, guildId);

            alisaFile.guildAddRemove.remove[guildId] = Date.now();
            database.writeFile(alisaFile, "alisa", "other");

            // Sunucunun kayıt türü verisini sil
            guild.client.registerOptions.delete(guildId);

            const guildCount = (await guild.client.shard.broadcastEval(client => client.guilds.cache.size)).reduce((acc, top) => acc + top, 0);

            // Botun destek sunucusuna sunucuya girdiğine dair mesaj at
            const randomMessage = guildDelete[Math.floor(Math.random() * guildDelete.length)].replace("<s>", `${guild.name} - (${guildId})`);
            
            return Util.webhooks.guildDelete.send(`📤 ${randomMessage} ( Toplamda **${guildCount}** sunucuya hizmet ediyorum )`);
        } catch (e) {
            console.log(e)
        }
    }
}