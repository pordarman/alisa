

/**
 * Bot sunucuya eklendiğinde atılacak mesajlar
 * @param {String} guildName
 * @returns {Array<String>}
 */
module.exports = function (guildName) {
    return [
        `**${guildName}** sunucusuna eklendim`,
        `**${guildName}** sunucusuna ayak bastım`,
        `**${guildName}** burada hava baya hoşmuş`,
        `**${guildName}** yeni sunucudan selamlaaarrrr`,
        `**${guildName}** sizde gelin burası çok güzel`,
        `**${guildName}** yeni yerleri gezmeyi seviyorum be`,
        `**${guildName}** sunucusundan gizli bir görev için çağırıldım`,
        `**${guildName}** sunucusu beni gizli bir operasyon için çağırdı`
    ]
}