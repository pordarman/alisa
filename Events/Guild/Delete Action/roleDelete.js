"use strict";
const {
    EmbedBuilder,
    Role,
    Events
} = require("discord.js");
const database = require("../../../Helpers/Database");
const Util = require("../../../Helpers/Util");

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
            const guildDatabase = Util.getGuildData(role.client, guildId);

            // Bot birden fazla dil destekleyeceği için şimdi bütün mesajları sunucunun diline göre değiştir
            const {
                bot,
                boy,
                girl,
                normal,
                unregister,
                banAuthRole,
                vipAuthRole,
                registerAuth,
                muteAuthRole,
                jailAuthRole,
                kickAuthRole,
                vipRole,
                jailRole,
                embed: {
                    title,
                    roleDescription,
                    and
                }
            } = Util.rolesAndChannelMessages[guildDatabase.language];

            const roleId = role.id;
            const deletedRoles = [];

            const roleIdsRegister = guildDatabase.register.roleIds;
            const roleIdsModeration = guildDatabase.moderation.roleIds;
            const jail = guildDatabase.jail;
            const roleIdsOther = guildDatabase.roleIds;

            // Eğer silinen rol bir bot rolüyse
            const indexOfBotRole = roleIdsRegister.bot.indexOf(roleId);
            if (indexOfBotRole != -1) {
                roleIdsRegister.bot.splice(indexOfBotRole, 1);
                deletedRoles.push(bot.single);
            }

            // Eğer silinen rol bir erkek rolüyse
            const indexOfBoyRole = roleIdsRegister.boy.indexOf(roleId);
            if (indexOfBoyRole != -1) {
                roleIdsRegister.boy.splice(indexOfBoyRole, 1);
                deletedRoles.push(boy.single);
            }

            // Eğer silinen rol bir kız rolüyse
            const indexOfGirlRole = roleIdsRegister.girl.indexOf(roleId);
            if (indexOfGirlRole != -1) {
                roleIdsRegister.girl.splice(indexOfGirlRole, 1);
                deletedRoles.push(girl.single);
            }

            // Eğer silinen rol bir üye rolüyse
            const indexOfNormalRole = roleIdsRegister.normal.indexOf(roleId);
            if (indexOfNormalRole != -1) {
                roleIdsRegister.normal.splice(indexOfNormalRole, 1);
                deletedRoles.push(normal.single);
            }

            // Eğer silinen rol bir kayıt yetkili rolüyse
            if (roleIdsRegister.registerAuth == roleId) {
                roleIdsRegister.registerAuth = "";
                deletedRoles.push(registerAuth);
            }

            // Eğer silinen rol bir kayıtsız rolüyse
            if (roleIdsRegister.unregister == roleId) {
                roleIdsRegister.unregister = "";
                deletedRoles.push(unregister);
            }

            // Eğer silinen rol bir ban yetkili rolüyse
            if (roleIdsModeration.banAuth == roleId) {
                roleIdsModeration.banAuth = "";
                deletedRoles.push(banAuthRole);
            }

            // Eğer silinen rol bir kick yetkili rolüyse
            if (roleIdsModeration.kickAuth == roleId) {
                roleIdsModeration.kickAuth = "";
                deletedRoles.push(kickAuthRole);
            }

            // Eğer silinen rol bir mute yetkili rolüyse
            if (roleIdsModeration.muteAuth == roleId) {
                roleIdsModeration.muteAuth = "";
                deletedRoles.push(muteAuthRole);
            }

            // Eğer silinen rol bir vip rolüyse
            if (roleIdsOther.vip == roleId) {
                roleIdsOther.vip = "";
                deletedRoles.push(vipRole);
            }

            // Eğer silinen rol bir vip yetkili rolüyse
            if (roleIdsOther.vipAuth == roleId) {
                roleIdsOther.vipAuth = "";
                deletedRoles.push(vipAuthRole);
            }

            // Eğer silinen rol bir jail rolüyse
            if (jail.roleId == roleId) {
                jail.roleId = "";
                deletedRoles.push(jailRole);
            }

            // Eğer silinen rol bir jail yetkili rolüyse
            if (jail.authRoleId == roleId) {
                jail.authRoleId = "";
                deletedRoles.push(jailAuthRole);
            }

            // Eğer kaydedilen rollerden herhangi biri silinmişse databaseye kaydet ve sunucu sahibine mesaj gönder
            if (deletedRoles.length > 0) {
                // Database'ye kaydet
                database.writeFile(guildDatabase, guildId);

                const guildOwner = await Util.fetchUserForce(role.client, guild.ownerId);

                // Eğer sunucu sahibini çekemediyse hiçbir şey döndürme
                if (!guildOwner) return;

                const lastElement = deletedChannels.pop();
                const informationMessage = deletedChannels.length ? `${deletedChannels.join(", ")} ${and} ${lastElement}` : lastElement;

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        roleDescription({
                            guild,
                            guildId,
                            informationMessage,
                            role
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
            console.log(e);
        }
    }
}