const allMemberMessages = {
    memberIsHigherThanMeRoleAndName({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to edit the name and roles of the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeRole({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to edit the roles of the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeName({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to edit the name of the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeMute({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to mute the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeUnmute({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to unmute the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeBan({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to ban the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeUnban({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to unban the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeKick({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to kick the person named <@${memberId}>. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMeSuspicious({
        memberId,
        highestRoleId
    }) {
        return `I don't have permission to make the person named <@${memberId}> suspicious. Please move the role named <@&${highestRoleId}> up and try again`
    },
    memberIsHigherThanMe({
        memberId,
        highestRoleId
    }) {
        return `The role rank of the person named <@${memberId}> is higher than the rank of my role! Please Move the role named <@&${highestRoleId}> to the top and try again`
    },
    memberIsHigherThanYou(memberId) {
        return `You can't do this because the role rank of the person named <@${memberId}> is higher than your role rank`
    },
    isNotInGuild: {
        member: "Umm... I think this person is no longer in the server you silly thing :(",
        bot: "Umm... I think this bot is no longer in the server you silly thing :("
    },
    cantUseOn: {
        bot: "You can't use this command on bots you silly thing :)",
        yourself: "You can't use this command on yourself you silly thing :)",
        owner: "You can't use this command on the server owner you silly thing :)",
        admin: "You can't use this command on administrators you silly thing :)"
    },
};

module.exports = allMemberMessages;