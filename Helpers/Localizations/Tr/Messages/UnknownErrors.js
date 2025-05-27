const allUnknownErrors = {
    unknownError(error) {
        return `Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n` +
            `\`\`\`js\n` +
            `${error}\`\`\``
    }
}

module.exports = allUnknownErrors;