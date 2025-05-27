

/**
 * Bot sunucudan atıldığında atılacak mesajlar
 * @param {String} guildName
 * @returns {Array<String>}
 */
module.exports = function (guildName) {
    return [
        `**${guildName}** sunucusundan ayrıldım`,
        `**${guildName}** beni attılar yazıklar olsun`,
        `**${guildName}** hepsi bunun için miydi :(`,
        `**${guildName}** zaten ben burayı hak etmiyordum`,
        `**${guildName}** ben daha iyilerine layığım hıh`,
        `**${guildName}** atmasaydınız keşke...`,
        `**${guildName}** niye beni üzüyorsunuz :(`,
        `**${guildName}** kalbim kırıldı`
    ]
}