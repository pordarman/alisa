const allMessages = {
    notAuthor(authorId) {
        return `This menu can only be used by the person who used the command (<@${authorId}>) :(`
    },
    notFoundCategory: `We can't get help commands right now, please try again later!`,
    embedDeleted(prefix) {
        return `This menu is no longer useful because the embed shown in the message has been deleted. Please create a new message by typing **${prefix}help**`;
    }
}

module.exports = allMessages;