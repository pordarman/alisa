"use strict";
const {
    EmbedBuilder,
    Role,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const allMessages = require("../../../Helpers/Localizations/Index.js");

module.exports = {
    name: Events.GuildRoleDelete,
    /**
     * 
     * @param {Role} role 
     */
    async execute(role) {
        try {

            // Eğer silinen rol bir bot rolüyse hiçbir şey döndürme
            if (role.managed) return;

            const guild = role.guild;
            const guildId = guild.id;
            const guildDatabase = await database.getGuild(guildId);

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const {
                bot,
                boy,
                girl,
                member,
                unregister,
                banAuthRole,
                vipAuthRole,
                registerAuth,
                muteAuthRole,
                jailAuthRole,
                kickAuthRole,
                vipRole,
                jailRole,
                thRankRole,
                embed: {
                    title,
                    roleDescription
                }
            } = allMessages[guildDatabase.language].others.rolesAndChannels;

            const roleId = role.id;
            const deletedRoles = [];
            const setGuildData = {};
            const unsetObject = {};

            const roleIdsRegister = guildDatabase.register.roleIds;
            const roleIdsModeration = guildDatabase.moderation.roleIds;
            const jail = guildDatabase.jail;
            const roleIdsOther = guildDatabase.roleIds;

            // Eğer silinen rol bir bot rolüyse
            const indexOfBotRole = roleIdsRegister.bot.indexOf(roleId);
            if (indexOfBotRole != -1) {
                roleIdsRegister.bot.splice(indexOfBotRole, 1);
                deletedRoles.push(bot.single);
                setGuildData["register.roleIds.bot"] = roleIdsRegister.bot;
            }

            // Eğer silinen rol bir erkek rolüyse
            const indexOfBoyRole = roleIdsRegister.boy.indexOf(roleId);
            if (indexOfBoyRole != -1) {
                roleIdsRegister.boy.splice(indexOfBoyRole, 1);
                deletedRoles.push(boy.single);
                setGuildData["register.roleIds.boy"] = roleIdsRegister.boy;
            }

            // Eğer silinen rol bir kız rolüyse
            const indexOfGirlRole = roleIdsRegister.girl.indexOf(roleId);
            if (indexOfGirlRole != -1) {
                roleIdsRegister.girl.splice(indexOfGirlRole, 1);
                deletedRoles.push(girl.single);
                setGuildData["register.roleIds.girl"] = roleIdsRegister.girl;
            }

            // Eğer silinen rol bir üye rolüyse
            const indexOfMemberRole = roleIdsRegister.member.indexOf(roleId);
            if (indexOfMemberRole != -1) {
                roleIdsRegister.member.splice(indexOfMemberRole, 1);
                deletedRoles.push(member.single);
                setGuildData["register.roleIds.member"] = roleIdsRegister.member;
            }

            // Eğer silinen rol bir kayıt yetkili rolüyse
            if (roleIdsRegister.registerAuth == roleId) {
                roleIdsRegister.registerAuth = setGuildData["register.roleIds.registerAuth"] = "";
                deletedRoles.push(registerAuth);
            }

            // Eğer silinen rol bir kayıtsız rolüyse
            if (roleIdsRegister.unregister == roleId) {
                roleIdsRegister.unregister = setGuildData["register.roleIds.unregister"] = "";
                deletedRoles.push(unregister);
            }

            // Eğer silinen rol bir ban yetkili rolüyse
            if (roleIdsModeration.banAuth == roleId) {
                roleIdsModeration.banAuth = setGuildData["moderation.roleIds.banAuth"] = "";
                deletedRoles.push(banAuthRole);
            }

            // Eğer silinen rol bir kick yetkili rolüyse
            if (roleIdsModeration.kickAuth == roleId) {
                roleIdsModeration.kickAuth = setGuildData["moderation.roleIds.kickAuth"] = "";
                deletedRoles.push(kickAuthRole);
            }

            // Eğer silinen rol bir mute yetkili rolüyse
            if (roleIdsModeration.muteAuth == roleId) {
                roleIdsModeration.muteAuth = setGuildData["moderation.roleIds.muteAuth"] = "";
                deletedRoles.push(muteAuthRole);
            }

            // Eğer silinen rol bir vip rolüyse
            if (roleIdsOther.vip == roleId) {
                roleIdsOther.vip = setGuildData["roleIds.vip"] = "";
                deletedRoles.push(vipRole);
            }

            // Eğer silinen rol bir vip yetkili rolüyse
            if (roleIdsOther.vipAuth == roleId) {
                roleIdsOther.vipAuth = setGuildData["roleIds.vipAuth"] = "";
                deletedRoles.push(vipAuthRole);
            }

            // Eğer silinen rol bir jail rolüyse
            if (jail.roleId == roleId) {
                jail.roleId = setGuildData["jail.roleId"] = "";
                deletedRoles.push(jailRole);
            }

            // Eğer silinen rol bir jail yetkili rolüyse
            if (jail.authRoleId == roleId) {
                jail.authRoleId = setGuildData["jail.authRoleId"] = "";
                deletedRoles.push(jailAuthRole);
            }

            // Eğer silinen rol bir kayıt rankı rolüyse
            for (const rankCount in guildDatabase.register.rankRoles) {
                if (guildDatabase.register.rankRoles[rankCount] == roleId) {
                    guildDatabase.register.rankRoles[rankCount] = unsetObject[`register.rankRoles.${rankCount}`] = "";
                    deletedRoles.push(thRankRole(rankCount));
                    break;
                }
            }

            // Eğer kaydedilen rollerden herhangi biri silinmişse databaseye kaydet ve sunucu sahibine mesaj gönder
            if (deletedRoles.length > 0) {
                const [guildOwner] = await Promise.all([
                    Util.fetchUserForce(role.client, guild.ownerId),

                    // Database'ye kaydet
                    database.updateGuild(guildId, {
                        $set: setGuildData,
                        $unset: unsetObject
                    })
                ]);

                // Eğer sunucu sahibini çekemediyse hiçbir şey döndürme
                if (!guildOwner) return;

                const informationMessage = Util.formatArray(deletedRoles, guildDatabase.language);

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        roleDescription({
                            guildName: guild.name,
                            guildId,
                            informationMessage,
                            roleName: role.name
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