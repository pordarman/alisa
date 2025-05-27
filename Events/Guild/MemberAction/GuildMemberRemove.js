"use strict";
const {
    GuildMember,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: Events.GuildMemberRemove,
    /**
     * 
     * @param {GuildMember} member 
     */
    async execute(member) {
        try {

            const NOW_TIME = Date.now();
            const guildId = member.guild.id;

            const guildDatabase = await database.getGuild(guildId);

            // Kullanıcının log bilgilerini güncelle
            const userLogs = guildDatabase.userLogs[member.id] ??= [];
            const userLogObject = {
                type: "leaveGuild",
                timestamp: NOW_TIME
            };
            userLogs.unshift(userLogObject);

            await database.updateGuild(guildId, {
                $push: {
                    [`userLogs.${member.id}`]: {
                        $each: [userLogObject],
                        $position: 0,
                    }
                }
            });

        } catch (e) {
            console.error(e)
        }
    }
}