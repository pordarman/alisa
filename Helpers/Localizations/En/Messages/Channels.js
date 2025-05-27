const allChannelMessages = {
    alreadyReset(channelName) {
        return `${channelName} channel has already been reset`
    },
    successReset(channelName) {
        return `${channelName} channel successfully reset`
    },
    successSet({
        channelName,
        channelId
    }) {
        return `${channelName} channel has been successfully set to <#${channelId}>`
    },
    ifYouSet({
        prefix,
        commandName,
        channelName
    }) {
        return `• To set ${channelName} channel **${prefix}${commandName} #channel**\n` +
            `• To reset, you can type **${prefix}${commandName} reset**`
    },
    sameChannel(channelName) {
        return `${channelName} channel is the same as the channel you have already tagged`
    },
    notTextChannel: `The channel you entered is not a text channel! Please tag a text channel`,
    notVoiceChannel: `The channel you entered is not a voice channel! Please tag a voice channel`,
    channelNotSet({
        channelName,
        hasAdmin,
        hasAdminText: {
            prefix,
            commandName,
            extraContent = "",
        } = {}
    }) {
        return `${channelName} channel is __not set__ in this server` +
            (
                hasAdmin ?
                    `\n\n• To set, type **${prefix}${commandName} #channel**${extraContent}` :
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
                extraContent: ` or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command`,
            }
        })
    },
    registerChannelNoSet({
        prefix,
        hasAdmin
    }) {
        return `There is __no register channel__ set in this server` +
            (hasAdmin ?
                `\n\n• To set, type **${prefix}registerchannel #channel** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
    }
};

module.exports = allChannelMessages;