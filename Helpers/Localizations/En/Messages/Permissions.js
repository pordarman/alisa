const allPermissionMessages = {
    administrator: "Administrator",
    roleOrAdministrator(roleId) {
        return `<@&${roleId}> role **or** Administrator`
    },
    ban: "Ban Members",
    roleOrBan(roleId) {
        return `<@&${roleId}> role **or** Ban Members`
    },
    moveMembers: "Move Members",
    manageMessages: "Manage Messages",
    manageRoles: "Manage Roles",
    manageChannels: "Manage Channels",
    manageEmojisAndStickers: "Manage Emojis and Stickers",
    kick: "Kick Members",
    roleOrKick(roleId) {
        return `<@&${roleId}> role **or** Kick Members`
    },
    moderate: "Timeout Members",
    roleOrModerate(roleId) {
        return `<@&${roleId}> role **or** Timeout Members",`
    },
    manageNicknames: "Manage Nicknames",
    manageRolesOrNicknames: "Manage Roles **or** Manage Nicknames",
    manageRolesOrMoveMembers: "Manage Roles **or** Move Members",
    rich: "**either** you should boost the server **or** Change Username"
};

module.exports = allPermissionMessages;