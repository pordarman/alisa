"use strict";
const {
    GuildMember,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database");
const Util = require("../../../Helpers/Util");

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

            const guildDatabase = Util.getGuildData(member.client, guildId);

            // Kullanıcının log bilgilerini güncelle
            const userLogs = guildDatabase.userLogs[member.id] ??= [];
            userLogs.unshift({
                type: "leaveGuild",
                timestamp: NOW_TIME
            });

            database.writeFile(guildDatabase, guildId);
        } catch (e) {
            console.log(e)
        }
    }
}