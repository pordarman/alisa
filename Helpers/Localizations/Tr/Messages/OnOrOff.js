/**
 * on ve off komutları için mesajları döndürür
 * @param {String} optionName 
 * @returns {{ alreadyOn: String, successOn: String, alreadyOff: String, successOff: String }}
 */
function allOnOffMessages(optionName) {
    return {
        alreadyOn: `${optionName} ayarım zaten __**açık**__ durumda`,
        successOn: `${optionName} ayarım başarıyla açıldı!`,
        alreadyOff: `${optionName} ayarım zaten __**kapalı**__ durumda`,
        successOff: `${optionName} ayarım başarıyla kapatıldı!`
    }
}

module.exports = allOnOffMessages;