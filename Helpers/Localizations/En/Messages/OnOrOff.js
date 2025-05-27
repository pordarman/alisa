/**
 * on ve off komutları için mesajları döndürür
 * @param {String} optionName 
 * @returns {{ alreadyOn: String, successOn: String, alreadyOff: String, successOff: String }}
 */
function allOnOffMessages(optionName) {
    return {
        alreadyOn: `${optionName} setting is already __**on**__`,
        successOn: `${optionName} setting has been successfully __**on**__!`,
        alreadyOff: `${optionName} setting is already __**off**__`,
        successOff: `${optionName} setting has been successfully __**off**__!`
    }
};

module.exports = allOnOffMessages;