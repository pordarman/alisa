
const allMessages = {
    notAuthor(authorId) {
        return `Only the person using the command (<@${authorId}>) can use this button :(`
    },
    embedDeleted(prefix) {
        return `These buttons are no longer useful because the embed shown in the message has been deleted. Please create a new message by typing **${prefix}help**`
    },
}

module.exports = allMessages;