const allPermissionMessages = {
    administrator: "Yönetici",
    roleOrAdministrator(roleId) {
        return `<@&${roleId}> rolüne **veya** Yönetici`
    },
    ban: "Üyeleri Yasakla",
    roleOrBan(roleId) {
        return `<@&${roleId}> rolüne **veya** Üyeleri Yasakla`
    },
    moveMembers: "Üyeleri Taşı",
    manageMessages: "Mesajları Yönet",
    manageRoles: "Rolleri Yönet",
    manageChannels: "Kanalları Yönet",
    manageEmojisAndStickers: "Emojileri ve Stickerları Yönet",
    kick: "Üyeleri At",
    roleOrKick(roleId) {
        return `<@&${roleId}> rolüne **veya** Üyeleri At`
    },
    moderate: "Üyelere Zaman Aşımı Uygula",
    roleOrModerate(roleId) {
        return `<@&${roleId}> rolüne **veya** Üyelere Zaman Aşımı Uygula",`
    },
    manageNicknames: "Kullanıcı Adlarını Yönet",
    manageRolesOrNicknames: "Rolleri Yönet **veya** Kullanıcı Adlarını Yönet",
    manageRolesOrMoveMembers: "Rolleri Yönet **veya** Üyeleri Taşı",
    rich: "**ya** sunucuya boost basmalısın **ya da** Kullanıcı Adlarını Değiştir"
}

module.exports = allPermissionMessages;