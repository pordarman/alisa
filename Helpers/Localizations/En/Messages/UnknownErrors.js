const allUnknownErrors = {
    unknownError(error) {
        return `Umm.. An error occurred, can you try again later?\n` +
            `\`\`\`js\n` +
            `${error}\`\`\``
    }
}

module.exports = allUnknownErrors;