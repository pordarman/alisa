const allChannelMessages = {
    alreadyReset(channelName) {
        return `${channelName} kanalı zaten sıfırlanmış durumda`
    },
    successReset(channelName) {
        return `${channelName} kanalı başarıyla sıfırlandı`
    },
    successSet({
        channelName,
        channelId
    }) {
        return `${channelName} kanalı başarıyla <#${channelId}> olarak ayarlandı`
    },
    sameChannel(channelName) {
        return `${channelName} kanalı zaten etiketlediğiniz kanalla aynı`
    },
    ifYouSet({
        prefix,
        commandName,
        channelName
    }) {
        return `• ${channelName} kanalını ayarlamak için **${prefix}${commandName} #kanal**\n` +
            `• Sıfırlamak için ise **${prefix}${commandName} sıfırla** yazabilirsiniz`
    },
    notTextChannel: `Girdiğiniz kanal bir metin kanalı değil! Lütfen bir metin kanalı etiketleyiniz`,
    notVoiceChannel: `Girdiğiniz kanal bir ses kanalı değil! Lütfen bir ses kanalı etiketleyiniz`,
    channelNotSet({
        channelName,
        hasAdmin,
        hasAdminText: {
            prefix,
            commandName,
            extraContent = "",
        } = {}
    }) {
        return `Bu sunucuda ${channelName} kanalı __ayarlanmamış__` +
            (
                hasAdmin ?
                    `\n\n• Ayarlamak için **${prefix}${commandName} #kanal** yazabilirsiniz${extraContent}` :
                    ""
            )
    },
    channelNotSetRegister({
        channelName,
        hasAdmin,
        hasAdminText: {
            prefix,
            commandName,
        } = {}
    }) {
        return this.channelNotSet({
            channelName,
            hasAdmin,
            hasAdminText: {
                prefix,
                commandName,
                extraContent: ` veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz`,
            }
        })
    },
    registerChannelNoSet({
        prefix,
        hasAdmin
    }) {
        return `Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__` +
            (hasAdmin ?
                `\n\n• Ayarlamak için **${prefix}kayıtkanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` :
                "")
    }
}

module.exports = allChannelMessages;