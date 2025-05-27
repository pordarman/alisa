const allMemberMessages = {
    memberIsHigherThanMeRoleAndName({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeRole({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin rollerini düzenlemeye yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeName({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin ismini düzenlemeye yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeMute({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişiyi susturmaya yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeUnmute({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin susturulmasını kaldırmaya yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeBan({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişiyi yasaklamaya yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeUnban({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin yasağını kaldırmaya yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeKick({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişiyi sunucudan atma yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMeSuspicious({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişiyi şüpheli yapmaya yetkim yetmiyor. Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanMe({
        memberId,
        highestRoleId
    }) {
        return `<@${memberId}> adlı kişinin rol sırası benim rol sıramdan yüksek! Lütfen <@&${highestRoleId}> adlı rolü üste çekiniz ve tekrar deneyiniz`
    },
    memberIsHigherThanYou(memberId) {
        return `<@${memberId}> adlı kişinin rol sırası sizin rol sıranızdan yüksek olduğu için bunu yapamazsınız`
    },
    isNotInGuild: {
        member: "Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(",
        bot: "Şeyyyy... Sanırım bu bot artık sunucuda değil şapşik şey seni :("
    },
    cantUseOn: {
        bot: "Bu komutu botlar üzerinde kullanamazsın şapşik şey seni :)",
        yourself: "Bu komutu kendin üzerinde kullanamazsın şapşik şey seni :)",
        owner: "Bu komutu sunucu sahibi üzerinde kullanamazsın şapşik şey seni :)",
        admin: "Bu komutu yöneticiler üzerinde kullanamazsın şapşik şey seni :)"
    },
}

module.exports = allMemberMessages;