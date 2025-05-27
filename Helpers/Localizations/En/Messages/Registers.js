const {
    EMOJIS,
    mainBotId
} = require("../../../../settings.json");
const allOtherMessages = require("./Others");

const registerTypeToText = {
    boy: `Boy ${EMOJIS.boy}`,
    girl: `Girl ${EMOJIS.girl}`,
    member: `Member ${EMOJIS.member}`,
    bot: `Bot ${EMOJIS.bot}`,
}

const registerMessages = {
    commandNames: {
        auth: "authrole",
        boy: "boyrole",
        girl: "girlrole",
        member: "memberrole",
        botRole: "botrole",
        unregisterRole: "unregisterrole",
        registerChannel: "registerchannel",
    },
    roleNames: {
        auth: "authorized to record users",
        boy: "boy",
        girl: "girl",
        member: "member",
        unregister: "unregistered",
    },
    registerChannelName: "register",
    noRegister({
        hasAdmin,
        prefix,
    }) {
        return `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (hasAdmin ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
    },
    registerTypeIs: {
        member({
            prefix,
            hasAdmin
        }) {
            return `My recording type is set to __**Member Registration**__! Please use \`${prefix}member\` command` +
                (hasAdmin ?
                    `\n\n• If you want to register as male or female, you can write **${prefix}registertype gender**` :
                    "")
        },
        gender({
            prefix,
            hasAdmin
        }) {
            return `My record type is set to __**Gender**__! Please use \`${prefix}boy\` or \`${prefix}girl\` command` +
                (hasAdmin ?
                    `\n\n• If you do not want to register as a member, you can write **${prefix}registertype member**` :
                    "")
        }
    },
    isNotRegisterChannel(channelId) {
        return `Please make registrations in the registration channel <#${channelId}>`
    },
    cantRegisterBotAsMember: {
        startString: "You can't register a bot using this command\n\n",
        existBotRole({
            prefix,
            botId
        }) {
            return this.startString + `• If you want to register the bot, you can write **${prefix}bot ${botId}**`
        },
        notExistBotRole(prefix) {
            return this.startString + `• If you want to register the bot, you must first set a bot role with **${prefix}bot-role**`
        },
        notExistBotRoleAndNotAdmin() {
            return this.startString + `• If you want to register the bot, ask the authorities to set up a bot role`
        }
    },
    cantRegisterMemberAsBot({
        prefix,
        registerType
    }) {
        return `You can't register someone as a bot, you stupid thing\n\n` +
            `• If you want to register a person! Please use **${registerType == "member" ?
                `${prefix}member` :
                `${prefix}boy **or** ${prefix}girl`
            }** commands`
    },
    notInGuild(memberId) {
        return `• <@${memberId}> has left the server while the transaction was taking place, so the transaction has been canceled`
    },
    notRegisterBefore: "Wellyy... You cannot use this command because this person has not registered on this server before :(",
    whileRegister: {
        you: `${allOtherMessages.waitThere} You cannot register with both button and command at the same time!`,
        other: `${allOtherMessages.waitThere} Someone else is currently registering!`,
    },
    whileChangeName: {
        you: `${allOtherMessages.waitThere} You cannot change your name with both button and command at the same time!`,
        other: `${allOtherMessages.waitThere} Someone else is currently changing their name!`,
    },
    alreadyRegister(memberId) {
        return `<@${memberId}> is already registered`
    },
    alreadyRegisterBot(memberId) {
        return `<@${memberId}> bot is already registered`
    },
    enterName({
        prefix,
        memberId,
        commandName
    }) {
        return `Please enter the name of the person you will register (You can disable this error by typing **${prefix}namerequired off**)\n\n` +
            `**Example**\n` +
            `• ${prefix}${commandName} ${memberId} Fearless Crazy 20\n` +
            `• ${prefix}${commandName} <@${memberId}> Fearless Crazy 20\n` +
            `• ${prefix}${commandName} Fearless Crazy 20 <@${memberId}>`
    },
    again: {
        differentType: "Heyyy, wait there! This person was previously registered as **Member**, but currently my Registration type is __**Gender**__ so you cannot use this command",
        noAge: "No age was entered in this user's previous registration and the age requirement is active on this server! Please register the user normally",
        underAge({
            age,
            ageLimit
        }) {
            return `In this user's previous registration, his age was entered as **${age}**, but now the server's age limit is **${ageLimit}**! Please register the user normally`
        },
        discordNameError: "Username exceeds 32 characters in length! Please register the user normally"
    },
    enterAge: `${allOtherMessages.waitThere} You must enter a valid age when registering on this server!`,
    underAge(ageLimit) {
        return `${allOtherMessages.waitThere} You cannot register anyone under the age of **${ageLimit}** on this server!`
    },
    discordNameError: "Server name cannot exceed 32 characters! Please reduce the number of characters",
    buttonLabels: {
        changeName: "Change name",
        changeGender: "Change gender",
        unregister: "Kick unregistered",
    },
    writeMembersName({
        authorId,
        memberId,
        isAgeRequired,
        isNameRequired,
        type
    }) {
        return `${EMOJIS[type]} <@${authorId}>, Please write **only the name${isAgeRequired ? " and age" : ""}** of the person <@${memberId}> you want to register as a message` +
            (isNameRequired ? "" : `\n\n*• If you want to register without a name, you can write __**No name**__ *`);
    },
    enterOnlyName({
        authorId,
        memberId
    }) {
        return `• 📝 <@${authorId}>, Please write **ONLY THE NAME** of the person named <@${memberId}> whose name you want to change`
    },
    successChangeName({
        authorId,
        memberId,
        memberName
    }) {
        return `• I changed the name of <@${memberId}> to **${memberName}**. Be more careful next time <@${authorId}> :)`
    },
    embedRegister: {
        author: "Recorded",
        botsHaveNoRank: "Bots have no rank :)",
        description: {
            alreadyRegister({
                memberId,
                registerCount,
                prefix
            }) {
                return `• Since <@${memberId}> has been registered on this server **${registerCount}** times before, registration points were not added (**${prefix}names ${memberId}**)`
            },
            congrats({
                authorId,
                newRank
            }) {
                return `• <@${authorId}> Congratulations, you have been promoted to **${newRank}**! 🎉`
            },
            giveNewRole({
                authorId,
                rankCount,
                roleId
            }) {
                return `• <@${authorId}> Congratulations, you have been given the role <@&${roleId}> for registering **${rankCount}** times in total! 🎉`
            }
        },
        fields({
            authorId,
            rank,
            registerCount,
            memberId,
            newName,
            givenRoles
        }) {
            return [
                {
                    name: "`Registrar`",
                    value: `> 👤 **Name:** <@${authorId}>\n` +
                        `> 🔰 **Rank:** ${rank || "No rank"}\n` +
                        `> 📈 **Register count:** ${registerCount}`,
                    inline: true
                },
                {
                    name: "`Registered`",
                    value: `> 👤 **Name:** <@${memberId}>\n` +
                        `> 📝 **New name:** ${newName}\n` +
                        `> ${EMOJIS.role} **Given role(s):** ${givenRoles}`,
                    inline: true
                }
            ]
        },
    },
    embedRegisterBot: {
        description: `**• Bot automatically registered ${EMOJIS.yes}**`,
        noBotRole: `I could not automatically register the bot because no bot role was set on this server`
    },
    embedAfterRegister: {
        title: "Welcome to our server",
        description({
            memberId,
            givenRoles
        }) {
            return `${EMOJIS.crazy} **• <@${memberId}> joined us with the roles ${givenRoles}**`
        },
        fields({
            authorId,
            authorName,
            memberId,
            memberName,
        }) {
            return {
                name: "Registration information",
                value: `**• Registrar:** <@${authorId}> - ${authorName}\n` +
                    `**• Registered person:** <@${memberId}> - ${memberName}`
            }
        },
        footer: "Number of registrations of the official"
    },
    embedLog: {
        description({
            registerType,
            totalRegisterCount,
            authorId,
            authorName,
            authorRegisterCounts: {
                total,
                boy,
                girl,
                member,
                bot
            },
            commandOrButton,
            registerAt,
            memberId,
            memberName,
            isMemberHasUnregisterRole,
            takenRole,
            givenRoles,
            newName,
            type,
            memberPrevNamesLength
        }) {
            return `**• A total of ${totalRegisterCount} people have been registered on the server!**\n\n` +
                `🧰 **REGISTERING AUTHORITY**\n` +
                `**• Name:** <@${authorId}> - ${authorName}\n` +
                (
                    authorId == mainBotId ?
                        `**• Register count:** ${bot} - (${EMOJIS.bot} ${bot})\n` :
                        `**• Register count:** ${total} - (${registerType == "gender" ? `${EMOJIS.boy} ${boy}, ${EMOJIS.girl} ${girl}` : `${EMOJIS.member} ${member}`}, ${EMOJIS.bot} ${bot})\n`
                ) +
                `**• How did the official record it:** ${commandOrButton}\n` +
                `**• Registration time:** <t:${registerAt}:F> - <t:${registerAt}:R>\n\n` +
                `👤 **REGISTERED MEMBER**\n` +
                `**• Name:** <@${memberId}> - ${memberName}\n` +
                `**• Role taken:** ${isMemberHasUnregisterRole ? `<@&${takenRole}>` : "The member had no unregistered role"}\n` +
                `**• Given role(s):** ${givenRoles}\n` +
                `**• New name:** ${newName}\n` +
                `**• Registration type:** ${registerTypeToText[type]}\n` +
                `**• Has the member been registered before:** ${memberPrevNamesLength > 0 ? `Yes ${memberPrevNamesLength} times` : "No"}`
        },
        command: "Using command",
        button: "Using button",
        auto: "Automatic",
    }
};

module.exports = registerMessages;