const Util = require("../../../Util.js");

const allRoleMessages = {
     tagAnotherRole: "Please tag another role",
     boosterRole: "The role you tagged is a role given only by discord",
     alreadyReset(roleName) {
          return `${roleName} role(s) has already been reset`
     },
     successReset(roleName) {
          return `${roleName} role(s) has been successfully reset`
     },
     successSet({
          roleName,
          roleIds
     }) {
          return typeof roleIds == "string" ?
               `${roleName} role has been successfully set as <@&${roleIds}>` :
               `${roleName} role(s) have been successfully set as [${Util.mapAndJoin(roleIds, roleId => `<@&${roleId?.id || roleId}>`, " | ")}]`
     },
     ifYouSet({
          prefix,
          commandName,
          roleName
     }) {
          return `• To set the ${roleName} role, type **${prefix}${commandName} @role**\n` +
               `• To reset, type **${prefix}${commandName} reset**`
     },
     ifYouSetMulti({
          prefix,
          commandName,
          roleName
     }) {
          return `• To set the ${roleName} roles, type **${prefix}${commandName} @role @role @role**\n` +
               `• To reset, type **${prefix}${commandName} reset**`
     },
     botRole: "I can't give roles created by bots to others",
     sameRole(roleName) {
          return `${roleName} role is already the same as the role you tagged`;
     },
     errorRole({
          roleId,
          roleName
     }) {
          return `The role named [<@&${roleId}>] that you tagged is the ${roleName} role in this server. ${this.tagAnotherRole}`;
     },
     roleIsHigherThanMe({
          roleId,
          highestRoleId
     }) {
          return `The position of the role named <@&${roleId}> is higher than my role's position! Please move the role named <@&${highestRoleId}> up and try again`
     },
     rankRoleIsHigherThanMe({
          memberId,
          roleId,
          highestRoleId
     }) {
          return `• An error occurred while assigning the rank role <@&${roleId}> to <@${memberId}>! Please move the role named <@&${highestRoleId}> up and try again`
     },
     rolesAreHigherThanMe({
          roleIds,
          highestRoleId
     }) {
          return `The position of the role(s) named [${roleIds}] is higher than my role's position! Please move the role named <@&${highestRoleId}> up and try again`
     },
     roleNotSet({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
               extraContent = "",
          } = {}
     }) {
          return `In this server, ${roleName} role is __not set__` +
               (
                    hasAdmin ?
                         `\n\n• To set, type **${prefix}${commandName} @role**${extraContent}` :
                         ""
               )
     },
     rolesNotSet({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
               extraContent = "",
          } = {}
     }) {
          return `In this server, ${roleName} roles are __not set__` +
               (
                    hasAdmin ?
                         `\n\n• To set, type **${prefix}${commandName} @role**${extraContent}` :
                         ""
               )
     },
     roleNotSetRegister({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
          } = {}
     }) {
          return this.roleNotSet({
               roleName,
               hasAdmin,
               hasAdminText: {
                    prefix,
                    commandName,
                    extraContent: ` or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command`,
               }
          })
     },
     rolesNotSetRegister({
          roleName,
          hasAdmin,
          hasAdminText: {
               prefix,
               commandName,
          } = {}
     }) {
          return this.rolesNotSet({
               roleName,
               hasAdmin,
               hasAdminText: {
                    prefix,
                    commandName,
                    extraContent: ` or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command`,
               }
          })
     },
     maxRoleError(maxRoleCount) {
          return `Hey hey heyyy don't you think you tagged too many roles? You can set up to **${maxRoleCount}** roles`
     }
}

module.exports = allRoleMessages;