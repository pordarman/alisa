"use strict";
const {
    Events,
    Guild
} = require("discord.js");
const database = require("../../Helpers/Database.js");
const allRandomMessages = require("../../Helpers/Random/GuildDelete");
const Util = require("../../Helpers/Util.js");

module.exports = {
    name: Events.GuildDelete,
    /**
     * 
     * @param {Guild} guild 
     */
    async execute(guild) {
        try {

            const alisaFile = await database.getFile("alisa");

            const guildId = guild.id;

            // Eğer sunucu karalistede varsa hiç mesaj göndermeden sil
            if (alisaFile.blacklistGuilds[guildId]) return;

            // Sunucudaki bütün bekleyen mesajları sil
            const guildDatabase = await database.getGuild(guildId);

            const setObject = {};
            const unsetObject = {};
            for (const key in guildDatabase.waitMessageCommands) {
                setObject[`waitMessageCommands.${key}`] = guildDatabase.waitMessageCommands[key] = {};
            }
            const unsets = ["customAfterRegister", "customLogin", "setup"];
            for (const key of unsets) {
                unsetObject[`waitMessageCommands.${key}`] = "";
                delete guildDatabase.waitMessageCommands[key];
            }

            await database.updateGuild(guildId, {
                $set: setObject,
                $unset: unsetObject
            }, true);

            const allTimeoutNames = ["mutedMembers", "jailedMembers"];

            // Bütün verilerde dön ve sunucu verilerini sil
            for (let i = 0; i < allTimeoutNames.length; i++) {
                const guildTimeoutDatas = Util.maps[allTimeoutNames[i]].get(guildId);
                if (!guildTimeoutDatas) continue;

                const values = [...guildTimeoutDatas.values()];

                for (let j = 0; j < values.length; j++) {
                    const value = values[j];
                    clearTimeout(value);
                }
            }

            const leavedTimestamp = Date.now();
            alisaFile.guildAddLeave.leave[guildId] = leavedTimestamp;

            // Sunucunun kayıt türü verisini sil
            Util.maps.registerOptions.delete(guildId);

            const [guildCounts] = await Promise.all([
                guild.client.shard.broadcastEval(client => client.guilds.cache.size),
                database.updateFile("alisa", {
                    $set: {
                        [`guildAddLeave.leave.${guildId}`]: leavedTimestamp
                    }
                })
            ])

            const guildCount = guildCounts.reduce((acc, top) => acc + top, 0);

            // Botun destek sunucusuna sunucuya girdiğine dair mesaj at
            const randomMessage = Util.random(allRandomMessages(`${guild.name} - (${guildId})`));

            return Util.webhooks.guildDelete.send(`📤 ${randomMessage} ( Toplamda **${guildCount}** sunucuya hizmet ediyorum )`);
        } catch (e) {
            console.error(e)
        }
    }
}