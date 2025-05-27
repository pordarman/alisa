const Util = require("../../../Util.js");
const Time = require("../../../Time");
const {
    prefix: defaultPrefix,
    discordInviteLink,
    botInviteLink,
    ownerId,
    EMOJIS
} = require("../../../../settings.json");
const {
    GuildDefaultMessageNotifications
} = require("discord.js");

// Dil
const language = "en";

const allMessages = {
    afk: {
        success: `${EMOJIS.yes} You have successfully set your AFK status!`,
    },
    alisa: {
        times: "times",
        unknown: "Unknown",
        enterOption(prefix) {
            return `Please enter an option\n\n` +
                `**🗒️ Enterable options**\n` +
                `**• ${prefix}alisa lb =>** People who use the bot's commands the most\n` +
                `**• ${prefix}alisa total =>** Number of registrations made so far\n` +
                `**• ${prefix}alisa commands =>** Shows how many times commands have been used\n` +
                `**• ${prefix}alisa guilds =>** Ranking of all logging servers\n` +
                `**• ${prefix}alisa who =>** Who is Alisa???`
        },
        lb: {
            description({
                length,
                userIndex,
                commandUses
            }) {
                return `• People who use the bot's commands the most\n` +
                    `• You are in **${userIndex}** place among **${length}** people! (**__${commandUses}__ usage**) 🎉`
            }
        },
        commands: {
            description(totalUsageCount) {
                return `The bot's commands were used a total of ${totalUsageCount} times`
            }
        },
        total: {
            registered: "REGISTERED",
            type: "REGISTER TYPE",
            gender: "Gender",
            member: "Member Register",
            most: "8 servers with the most registrations"
        },
        guilds: {
            embed: {
                description({
                    length,
                    guildIndex,
                    total
                }) {
                    return `**• Ranking of servers with the most registrations __(${length} servers)__**\n` +
                        (
                            guildIndex == -1 ?
                                `• Server ranking not found!` :
                                `• This server is exactly ${guildIndex}. next! (**__${total}__ registration**) 🎉`
                        )
                }
            }
        },
        who: {
            who: "who",
            description({
                username,
                createdTimestamp,
                prefix,
                lastOneDay,
                length
            }) {
                return `• ${username} created as a sweet bot on **<t:${createdTimestamp}:F>**\n\n` +
                    `• ${username} was actually created as a helper for my first public bot, but later I realized that I enjoyed dealing with this bot more and closed my first bot\n\n` +
                    `• I bring a different feature or optimization to the bot almost every day so that the bot never loses its speed\n\n` +
                    `• In addition, thanks to your suggestions, we are bringing many new and advanced features to the bot, and many of the bot's commands came thanks to your suggestions. **(${prefix}voice command, jail system, etc.)**\n\n` +
                    `• In the last 24 hours, **${lastOneDay}** has been added to the server for a total of **${length}**!`
            },
            footer: "I'm glad to have you <3"
        }
    },
    ban: {
        successBan({
            authorName,
            reason
        }) {
            return `Forbidding: ${authorName} | Reason: ${reason || "Reason not stated"}`
        },
        successMsg({
            userName,
            userId,
            penaltyNumber,
            guildMember
        }) {
            return `${EMOJIS.yes} **${userName} - (${userId})** successfully banned from the server, enjoy 🥳${penaltyNumber ? ` **Penalty number:** \`#${penaltyNumber}\`` : ""}${!guildMember ? " - *( This person was not on the server )*" : ""}`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                userDisplayName,
                reason,
                penaltyNumber,
                banAt
            }) {
                return `**${EMOJIS.ban} <@${userId}> has been __permanently banned from the server**\n\n` +
                    `🧰 **AUTHORITY WHO BANNED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Ban date:** <t:${banAt}:F> - <t:${banAt}:R>\n\n` +
                    `👤 **BANNED MEMBER**\n` +
                    `**• Name:** <@${userId}> - ${userDisplayName}\n` +
                    `**• Reason:** ${reason || "Reason not stated"}` +
                    (penaltyNumber ?
                        `\n• **Penalty number:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        error(error) {
            return "I could not ban the member you want to ban from the server :(\n\n" +
                "**Reason:**" +
                `• ${error}`
        }
    },
    banner: {
        noBanner(userId) {
            return `There is no banner for <@${userId}> :(`
        },
        noBannerYou: "You don't have a banner yet :(",
    },
    bototo: {
        optionName: "Automatically register bots",
        enter(prefix) {
            return `• To turn on the automatic bot registration setting, you can type **${prefix}botauto on**\n\n` +
                `• To close it, you can type **${prefix}botauto off**`
        }
    },
    davet: {
        invite: "Here you go, you silly thing :)",
        inviteButtons: {
            invite: "Invite me",
            vote: "Vote me",
            support: "My support server"
        }
    },
    değiştir: {
        commandOnlyGender: "This command is only for those who register with __**Gender**__",
        dontHaveBoyOrGirlRole(memberId) {
            return `<@${memberId}> does not have both boy or girl roles!`
        },
        selectGenderContent: "The person you tag has both a boy and a girl role. Please select which role you would like me to assign from the buttons below",
        successTo: {
            boy(memberId) {
                return `• ♻️ ${EMOJIS.boy} I took the girl role from <@${memberId}> and gave him the boy role`;
            },
            girl(memberId) {
                return `• ♻️ ${EMOJIS.girl} I took the boy role from <@${memberId}> and gave him the girl role`;
            },
        },
    },
    destek: {
        description(prefix) {
            return `• Looks like you need some help, I can help you out if you want?\n\n` +
                `• You can come to **[My support server](${discordInviteLink})** and ask the authorities to help\n\n` +
                `• By the way, if you want to get help without coming to my support server, you can quickly setup the entire registration system by using the **${prefix}setup** command and answering all the questions\n\n` +
                `• And if possible, start using **${prefix}help** after seeing all my commands, because many of my commands make your operations easier and more practical. **__So don't forget to check out all my commands.__**\n\n` +
                `• If you need more help, don't forget to come to my **[Support server](${discordInviteLink})** ^^\n\n` +
                `• And most importantly *I love you...* :)`
        }
    },
    dil: {
        already: "You're already using **English 🇬🇧** language right now you silly thing :)",
        changed: "Botun dili başarıyla **Türkçe 🇹🇷** olarak değiştirildi",
        enter(prefix) {
            return `Please enter the language that the bot will change for guild\n\n` +
                `**Currently available languages:**\n` +
                `• ${prefix}lang turkish\n` +
                `• ${prefix}lang english`;
        }
    },
    emoji: {
        enter(prefix) {
            return `Please specify an emoji\n\n` +
                `**Example**\n` +
                `• ${prefix}emoji ${EMOJIS.alisa}\n` +
                `• ${prefix}emoji 123456789012345678\n` +
                `• ${prefix}emoji alisa`
        },
        notFound: "The specified emoji was not found",
        animated: "Animated",
        notAnimated: "Not animated",
        embedDescription({
            emojiName,
            emojiId,
            createdTimestampInSecond,
            authorOfEmojiTag,
            authorOfEmojiId,
            emojiType,
            emojiImage,
            emojiTypeEmoji,
            emojiRawName
        }) {
            return `• Information about the emoji named **${emojiName}**\n\n` +
                `📝 **Emoji name:** ${emojiName}\n` +
                `🆔 **Emoji ID:** ${emojiId}\n` +
                `🗓️ **Emoji creation date:** <t:${createdTimestampInSecond}:F> - <t:${createdTimestampInSecond}:R>\n` +
                `👤 **Emoji creator:** ${authorOfEmojiTag} (${authorOfEmojiId})\n` +
                `${emojiTypeEmoji} **Emoji type:** ${emojiType}\n` +
                `🌐 **Emoji URL:** [Click here](${emojiImage})\n` +
                `📌 **Raw emoji:** \`${emojiRawName}\``
        }
    },
    emojiekle: {
        enter(prefix) {
            return `Please enter the emoji and its name\n\n` +
                `**Example**\n` +
                `• ${prefix}createmoji ${EMOJIS.drink} Ham\n` +
                `• ${prefix}createmoji https://cdn.discordapp.com/emojis/1178353610518708264.png?size=4096 Ham`
        },
        invalidType: "The type of image you entered is not a valid image! Please change the image type to jpg, jpeg, png or gif",
        enterName: "Please enter a name for the emoji you want to add. You can only use letters, numbers and underscores when entering the name, the rest will be deleted",
        tooLongName: "The emoji name cannot be too long! The emoji name must be less than **32** characters",
        sameName: "There is already an emoji with this name",
        tooMuchEmoji: "The server's emoji limit has been reached! Please delete an emoji from the server and try again",
        invalidForm: "The emoji name, emoji URL or image you entered is too large! Please enter a valid emoji name or emoji URL",
        invalidEmoji: "The emoji you entered is not a valid emoji! Please enter a valid emoji",
        maxSize: "The emoji you want to add is too big! The emoji size must be less than **256kb**",
        adding: "Adding emoji to server...",
        success(emoji) {
            return `• ${emoji} has been successfully added to the server ${EMOJIS.yes}`
        },
    },
    günlüközel: {
        anothers: "Hey, wait there! Another official is currently setting the after register message",
        cancel: "The transaction has been canceled",
        resets: {
            already: `Customized message after registration is not already set`,
            success: `${EMOJIS.yes} Customized message after registration successfully reset`
        },
        tooMuchCharacter(maxLength) {
            return `There are too many characters! Your message must be less than **${maxLength}** characters!`
        },
        success: `${EMOJIS.yes} Customized message after registration has been set successfully\n\n` +
            `**It will look like this**`,
        givenRoles: "__**GIVEN ROLES**__ (Those with this role will not be notified)",
        embed: {
            title: "Now is the time to think",
            description({
                clientUserId,
                recreateClientName,
                guildTag,
                memberCount,
                memberCountEmojis,
                authorId,
                recreateAuthorName
            }) {
                return `• To cancel **cancel**\n` +
                    `• To reset, you can type **reset**\n\n` +
                    `**If you want your post-registration message to be unboxed, just write <unboxed> at the beginning of your message!**\n\n` +
                    `**Variables**\n` +
                    `**• <member>** => Tags registered person - ( <@${clientUserId}> )\n` +
                    `**• <memberName>** => Writes the name of the registered person - ( ${recreateClientName} )\n` +
                    `**• <memberId>** => Writes the registered person's ID - ( ${clientUserId} )\n` +
                    `**• <role>** => Tags the given role (those with this role will not be notified) - ( @Roles )\n` +
                    `**• <tag>** => Writes the tag(s) of the server - ( ${guildTag || "**NO TAG**"} )\n` +
                    `**• <total>** => Writes the number of people on the server - ( ${memberCount} )\n` +
                    `**• <emojiTotal>** => Writes the number of people on the server with emojis - ( ${memberCountEmojis} )\n` +
                    `**• <registerAuth>** => Tags Registrar - ( <@${authorId}> )\n` +
                    `**• <authName>** => Writes the entire name of the Registrar - ( ${recreateAuthorName} )\n` +
                    `**• <authId>** => Writes the ID of the Registrar - ( ${authorId} )\n` +
                    `**• <registercount>** => Writes the number of records of the Registrar - ( 888 )`
            },
            footer: "You have 16 minutes to respond"
        }
    },
    hata: {
        enterMessage: "Please write the error you want to report",
        success: "📢 **Your error message has been received and forwarded to my owner. Thank you for your support 💗**"
    },
    isim: {
        success: "The name of the person you tagged has been successfully changed",
        enter({
            prefix,
            memberId
        }) {
            return `Please enter the name of the person whose name you will change\n\n` +
                `**Example**\n` +
                `• ${prefix}n ${memberId} Fearless Crazy 20\n` +
                `• ${prefix}n <@${memberId}> Fearless Crazy 20\n` +
                `• ${prefix}n Fearless Crazy 20 <@${memberId}>`
        },
        sameName(memberId) {
            return `<@${memberId}>'s name is already the same as the name you wrote`
        }
    },
    "isim-özel": {
        register: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `You can make the name of the registered person more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}customnames register reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Adds the name you entered - ( ${userDisplayName} )\n` +
                    `**• <age>** => If you entered the age, it adds the age, if not, it does not add anything - ( 20 )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}customnames register <tag> <name> [<age>]\n` +
                    `• ${prefix}customnames register ♫ <name> | <age> <tag>`
            },
            reset: {
                already: "The user's name to be edited during registration has already been reset",
                success: "The user's name to be edited during registration has been successfully reset!"
            },
            success: "The user's name to be edited during registration has been successfully updated!\n\n" +
                "**It will look like this**"
        },
        registerbot: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `You can make the registered __bot's__ name more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}customnames registerbot reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Adds the name you entered - ( ${userDisplayName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}customnames registerbot <tag> <name>\n` +
                    `• ${prefix}customnames registerbot ♫ <name> | <tag>`
            },
            reset: {
                already: "The bot's name to be edited during registration has already been reset",
                success: "The bot's name to be edited during registration has been successfully reset!"
            },
            success: "The bot's name to be edited during registration has been successfully updated!\n\n" +
                "**It will look like this**"
        },
        login: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `You can make the name of the person entering the server more beautiful by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}customnames login reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Writes the user's name - ( ${userDisplayName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}customnames login <tag> <name>\n` +
                    `• ${prefix}customnames login ♫ <name> | <tag>`
            },
            reset: {
                already: "The user's name to be edited when entering the server has already been reset",
                success: "The user's name to be edited when entering the server has been successfully reset!"
            },
            success: "The user's name to be edited when entering the server has been successfully updated!\n\n" +
                "**It will look like this**"
        },
        loginbot: {
            enter({
                prefix,
                guildTag,
                userDisplayName
            }) {
                return `You can make the bot's name more beautiful when entering the server by using the variables here :)\n` +
                    `• If you want to reset it, you can type **${prefix}customnames loginbot reset**\n\n` +
                    `**Variables**\n` +
                    `**• <tag>** => Adds the server's tag - ( ${guildTag || "No tag"} )\n` +
                    `**• <name>** => Writes the bot's name - ( ${userDisplayName} )\n\n` +
                    `**Example**\n` +
                    `• ${prefix}customnames loginbot <tag> <name>\n` +
                    `• ${prefix}customnames loginbot ♫ <name> | <tag>`
            },
            reset: {
                already: "The bot's name to be edited when entering the server has already been reset",
                success: "The bot's name to be edited when entering the server has been successfully reset!"
            },
            success: "The bot's name to be edited when entering the server has been successfully updated!\n\n" +
                "**It will look like this**"
        },
        enter(prefix) {
            return `• To edit the new user's name, enter **${prefix}customnames login**\n` +
                `• To edit someone's name after registering **${prefix}customnames register**\n\n` +
                `• To edit the name of the new __bot__ **${prefix}customnames loginbot**\n` +
                `• To edit the name of a __bot__ after registering it, you can type **${prefix}customnames registerbot**`
        }
    },
    isimler: {
        missingDatas: "The table can't be displayed because the person you tagged has never been registered before",
        registrar: "Registrar",
        embedDescription({
            userId,
            length
        }) {
            return `**• A total of __${length}__ name histories for <@${userId}> were found**`
        }
    },
    isimzorunlu: {
        optionName: "Name requirement",
        enter(prefix) {
            return `• To turn on the name requirement setting, you can type **${prefix}namerequired on**\n\n` +
                `• To close it, you can type **${prefix}namerequired off**`
        }
    },
    istatistik: {
        buttonLabels: {
            invite: "Invite me",
            vote: "Vote me",
            support: "My support server"
        },
        loading(points) {
            return `${EMOJIS.loading} **Data is being received, please wait a moment${points}**`;
        },
        lastReboot(timestamp) {
            return `⏲️ **Last reboot:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
        },
        botInformation: {
            name: "BOT INFORMATION",
            value({
                clientUsername,
                id,
                createdTimestamp,
                usedMemory,
                usedRamPercent
            }) {
                return `✏️ **My username:** ${clientUsername}\n` +
                    `🆔 **Discord ID:** ${id}\n` +
                    `📅 **My founding date:** <t:${createdTimestamp}:F>\n` +
                    `🎚️ **RAM usage:** ${usedMemory} - %${usedRamPercent}`;
            }
        },
        delayInformation: {
            name: "MY DELAY INFORMATION",
            value({
                wsPing,
                messageSendPing,
                messageEditPing,
                databasePing
            }) {
                return `📡 **Bot's main delay:** ${wsPing} ms\n` +
                    `📨 **Message delay:** ${messageSendPing} ms\n` +
                    `📄 **Message edit delay:** ${messageEditPing} ms\n` +
                    `📁 **Database latency:** ${databasePing} ms`;
            }
        },
        developers: {
            name: "MY DEVELOPERS",
            value(ownerDisplayName) {
                return `👑 **${ownerDisplayName} - ${ownerId}** (Producer)`;
            }
        },
        serverInformation: {
            name: "SERVER INFORMATION",
            value({
                guildsCount,
                usersCount,
                channelsCount,
                rolesCount
            }) {
                return `💻 **Number of servers:** ${guildsCount}\n` +
                    `👥 **Number of users:** ${usersCount}\n` +
                    `${EMOJIS.channel} **Number of channels:** ${channelsCount}\n` +
                    `${EMOJIS.role} **Number of roles:** ${rolesCount}`;
            }
        },
        versions: {
            name: "VERSIONS",
            value({
                nodeVersion,
                discordVersion,
                databaseVersion,
                botVersion
            }) {
                return `🎛️ **Node.js version:** ${nodeVersion}\n` +
                    `🔨 **Discord.js version:** v${discordVersion}\n` +
                    `📒 **Database version:** v${databaseVersion}\n` +
                    `${EMOJIS.alisa} **Alisa version:** v${botVersion}`;
            }
        },
        vdsInformation: {
            name: "VDS INFORMATION",
            value({
                vdsName,
                operatingSystemVersion,
                cpuModel,
                totalRam,
                freeRam
            }) {
                return `📝 **VDS name:** ${vdsName}\n` +
                    `🖥️ **Operatin system version:** ${operatingSystemVersion}\n` +
                    `🎞️ **CPU:** ${cpuModel}\n` +
                    `🔋 **Total ram:** ${totalRam} (**Free:** ${freeRam})`;
            }
        }
    },
    jail: {
        already: "This person is already jailed",
        jailed({
            memberId,
            reason
        }) {
            return `${EMOJIS.yes} <@${memberId}> has been jailed for __**${reason || "Reason not specified"}**__`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason
            }) {
                return `**🔇 Member <@${memberId}> jailed**\n\n` +
                    `🧰 **AUTHORITY THAT JAILED**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **PERSON THAT JAILED**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Given role:** <@&${jailRoleId}>\n` +
                    `**• Reason:** ${reason || "Reason not specified"}`
            }
        }
    },
    jailson: {
        cantShow: {
            user: "The table can't be displayed because the person you tagged has never been jailed before",
            guild: "The table can't be displayed because no one has been jailed on this server before"
        },
        total: {
            user(userId) {
                return `<@${userId}>'s total`
            },
            guild: "Total on this server"
        },
        embed: {
            title({
                text,
                length
            }) {
                return `**• ${text} __${length}__ jail information found**`
            },
            description({
                length,
                index,
                isTempJailed,
                isJailed,
                authorId,
                user,
                timestamp,
                reason,
                duration
            }) {
                return `• \`#${length - index}\` ${isTempJailed ? "⏰ " : ""}${isJailed ? "📥" : "📤"} <@${authorId}> ${user ? `<@${user.id}> ` : ""}| <t:${timestamp}:F>${isJailed ?
                    `\n└> **Reason:** ${Util.truncatedString(reason || "Reason not stated", 50)}`
                    : ""
                    }${isTempJailed ?
                        `\n└> **Duration:** ${duration}`
                        : ""
                    }`
            }
        },
    },
    kayıtayar: {
        on: {
            already: "My register setting is already __**on**__ so you can do all registration operations",
            success: "My register setting has been successfully opened, now you can do all registration operations"
        },
        off: {
            already: "My register setting is already __**off**__ so you cannot do all recording operations",
            success: "My register setting has been closed successfully. From now on, you will not be able to perform any registration operations"
        },
        enter(prefix) {
            return `• You can type **${prefix}registersetting open** to open my registry setting\n\n` +
                `• To close it, you can type **${prefix}registersetting close**`
        }
    },
    kayıtbilgi: {
        roleNotSet: "Role not setted ❗",
        channelNotSet: "Channel not setted ❗",
        on: "On",
        off: "Off",
        set: "Setted",
        notSet: "Not setted ❗",
        fieldsName: {
            roles: "ROLES",
            channels: "CHANNELS",
            others: "OTHERS"
        },
        registerType: {
            member: "Registration by member 👤",
            gender: "Registration by gender 👫",
            string: "Record type",
            setting: "Record setting"
        },
        registerSettings: {
            can: "You can register",
            cant: "You cannot record",
        },
        roles: {
            member: "Role(s) to be given to members",
            boy: "Role(s) to be given to boys",
            girl: "Role(s) to be given to girls",
            bot: "Role(s) to be given to bots",
            registerAuth: "Official who registers members",
            unregister: "Role to be taken after registering members"
        },
        channels: {
            register: "Record channel",
            afterRegister: "Channel to send a message after registration",
            log: "Record log channel",
        },
        others: {
            tag: {
                string: "Server specific tag",
                notSet: "Tag not setted ❗"
            },
            symbol: {
                string: "Symbol to be placed between names",
                notSet: "Symbol not setted ❗"
            },
            mentionAuth: "Mention the registration authority when someone is logged in",
            botAuto: "Automatically register bots",
            autoCorrect: "Autocorrect names",
            ageRequired: "Age requirement",
            nameRequired: "Name requirement",
            customLoginMessage: "Customized login message",
            customAfterRegisterMessage: "Customized log message",
            autoName: "Auto name",
            membersName: "User's name",
            afterRegisterName: "After saving someone it will look like this"
        }
    },
    kayıtsıfırla: {
        embed: {
            title: "Attention",
            description(prefix) {
                return `Are you sure you want to reset all your registration information? Before resetting, you can review your registration settings by typing **${prefix}registration-info**\n\n` +
                    `• **NOTE!!** The things you will delete now are the server's tag, symbol, names to be edited, private messages, and role and channel IDs. Things like recent recordings will not be deleted\n\n` +
                    `• If you want to delete it, write **yes**, otherwise write **no**`
            },
            footer: "You have 45 seconds to respond"
        },
        success: "I have successfully reset your registration information on this server",
        cancel: "The transaction has been canceled"
    },
    kayıtsız: {
        already: "Heyyy, wait there! This person is already unregistered",
        success(memberId) {
            return `• ⚒️ I took all the roles from <@${memberId}> and gave him/her the unregistered role successfully`
        },
        successButton({
            authorId,
            memberId
        }) {
            return `• ⚒️ <@${authorId}>, I took all the roles from <@${memberId}> and gave him/her the unregistered role successfully`
        }
    },
    kayıtsızlar: {
        nooneHasUnregistered: "No one is unregistered on this server yey!",
        unregisters: "Unregistered members",
        unregister: "Unregistered"
    },
    kayıttür: {
        member: {
            already: "My register type is already __**Member Registration**__",
            success: `My register type is successfully changed to "Member Registration"!`
        },
        gender: {
            already: "My record type is already __**Gender**__",
            success: `My record type is successfully changed to "Gender"!`
        },
        enter(prefix) {
            return `• To change the register type to "Member Registration" **${prefix}registertype member**\n\n` +
                `• To set "Gender" you can type **${prefix}registertype gender**`
        }
    },
    kick: {
        successKick({
            authorName,
            reason
        }) {
            return `Authorized: ${authorName} | Reason: ${reason || "Reason not stated"}`
        },
        successMsg({
            userName,
            userId,
            penaltyNumber
        }) {
            return `${EMOJIS.yes} **${userName} - (${userId})** successfully kicked from the server, enjoy 🥳${penaltyNumber ? ` **Penalty number:** \`#${penaltyNumber}\`` : ""}`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                userDisplayName,
                reason,
                penaltyNumber,
                kickAt
            }) {
                return `**👟 <@${userId}> has been kicked from the server**\n\n` +
                    `🧰 **AUTHORITY WHO KICKED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Kick date:** <t:${kickAt}:F> - <t:${kickAt}:R>\n\n` +
                    `👤 **KICKED MEMBER**\n` +
                    `**• Name:** <@${userId}> - ${userDisplayName}\n` +
                    `**• Reason:** ${reason || "Reason not stated"}` +
                    (penaltyNumber ?
                        `\n• **Penalty number:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        error(error) {
            return "I could not kick the member you want to kick from the server :(\n\n" +
                "**Reason:**" +
                `• ${error}`
        }
    },
    kişilog: {
        noData: "No data to show because the person you tagged has not been processed before",
        typeToText(input) {
            return {
                unregister: `⚒️ Kicked to __unregistered__ by <@${input.authorId}>`,
                changeName: `📝 Renamed to **${input.newName}** by <@${input.authorId}>`,
                changeRoles: `⚒️ Gender converted to **${input.to == "bot" ? `${EMOJIS.boy} boy` : `${EMOJIS.girl} girl`}** by <@${input.authorId}>`,
                jail: `${EMOJIS.jail} Posted by __jaile__ <@${input.authorId}>`,
                unjail: `${EMOJIS.party} Released from Jail by <@${input.authorId}>`,
                tempjail: `⏰ ${input.isJailed ? `Jailed for ${Time.duration(input.duration, language)}**` : "Removed from Jail"} by <@${input.authorId}>`,
                mute: `🔇 Muted for **${Time.duration(input.duration, language)}** by <@${input.authorId}>`,
                unmute: `🔊 Unmuted by <@${input.authorId}>`,
                joinGuild: `📥 Login to the server`,
                leaveGuild: `📤 Logged out of the server`,
                suspicious: `⛔ Posted to __suspect__ by <@${input.authorId}>`,
                ban: `${EMOJIS.ban} Banned for __**${input.reason || "No reason"}**__ by <@${input.authorId}>`,
                unban: `${EMOJIS.eat} Unbanned by <@${input.authorId}>`,
                kick: `${EMOJIS.f} Kicked for __**${input.reason || "No reason"}**__ by <@${input.authorId}>`,
                register: {
                    boy: `${EMOJIS.boy} Registered as **Male** by <@${input.authorId}>`,
                    girl: `${EMOJIS.girl} Registered as **Female** by <@${input.authorId}>`,
                    member: `${EMOJIS.member} Registered as **Member** by <@${input.authorId}>`,
                    bot: `${EMOJIS.bot} Registered as **Bot** by <@${input.authorId}>`
                }[input.gender]
            }[input.type];
        },
        description({
            userId,
            length,
        }) {
            return `**• <@${userId}> has a total of __${length}__ log records**`
        }
    },
    komut: {
        enter: "Please enter a command name!",
        notFound(commandName) {
            return `I couldn't find the command named **${commandName}**, please make sure you typed the name of the command correctly`
        },
        commandInfo({
            name,
            aliases,
            cooldown,
            description,
            category,
            usage,
            ownerOnly,
            isPremium,
            categoryEmoji,
            language
        }) {
            return `**‼️ The [] sign shown when using the command means "optional" and the <> sign means "mandatory"**\n\n` +
                `✏️ **Name of the command:** ${name[language]}\n` +
                `⏳ **Command waiting time:** ${cooldown} second\n` +
                `📝 **Description of the command:** ${description[language]}\n` +
                `${categoryEmoji} **Category of the command:** ${category[language]}\n\n` +
                `📍 **Usage of the command:** ${usage}\n` +
                `🌐 **Other uses of the command:** ${aliases}\n\n` +
                `👑 **Is the command owner specific:** ${ownerOnly ? "Yes" : "No"}\n` +
                `${EMOJIS.premiumCommands} **Is the command a premium command:** ${isPremium ? "Yes" : "No"}`
        }
    },
    kullanıcıbilgi: {
        isBot(bot) {
            return bot ? `🤖 **Is the member a bot:** Yes` : `👤 **Is the member a bot:** No`;
        },
        presenceInfos: {
            statusValue({
                statusEmoji,
                statusText,
                from,
                activity
            }) {
                return `${statusEmoji} **Status:** ${statusText}\n` +
                    `❓ **Connected from:** ${from}\n` +
                    `📌 **Activity:** ${activity}`
            },
            activities: {
                playing(game) {
                    return `Playing ${game}`
                },
                listening(platform, music) {
                    return `Listening ${platform} - ${music}`
                },
                watching(movie) {
                    return `Watching ${movie}`
                },
                streaming(stream, url) {
                    return `Streaming [${stream}](${url})`
                },
                userOffline: "User's activity cannot be displayed because user is offline"
            },
            from: {
                net: "Web",
                mobile: "Mobile",
                desktop: "Desktop",
                unknown: "Unknwon"
            },
            statusText: {
                online: "Online",
                idle: "Idle",
                dnd: "Do not disturb",
                offline: "Offline"
            },
        },
        guildInfos: {
            joined(timestamp) {
                return `📆 **Date of joining the server:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
            },
            boosted(timestamp) {
                return `${EMOJIS.boostUsers} **Date the server was boosted:** <t:${timestamp}:F> - <t:${timestamp}:R>`;
            },
            highestRole(roleId) {
                return `💎 **Highest role on the server:** <@&${roleId}>`
            },
            nickname(nickname) {
                return `✏️ **Name on server:** ${nickname ?? "It has no name on the server"}`
            },
            currentChannel(channelId) {
                return `🔊 **Current channel:** <#${channelId}>`
            },
            titles: {
                basic: "BASIC INFORMATIONS",
                guild: "GUILD INFORMATIONS",
                status: "STATUS",
                photos: "PHOTOS",
                roles: "ROLES"
            },
            photos: {
                profile: "Profile photo",
                guildProfile: "Presenter profile photo",
                banner: "Banner"
            },
            basicValue({
                memberId,
                isUserBot,
                createdTimestamp
            }) {
                return `🆔 **Member's ID:** ${memberId}\n` +
                    `${isUserBot}\n` +
                    `📅 **Account creation date:** <t:${createdTimestamp}:F> - <t:${createdTimestamp}:R>`
            },
            roles: "ROLES",
            moreRoles: "more roles"
        }
    },
    kur: {
        allErrors: {
            cancel: `❗ The transaction has been canceled`,
            numberOfRemainingAttempts(numberOfRemain) {
                return `‼️ Please answer the questions correctly - __*( **${numberOfRemain}** left )*__`;
            },
            maxRole: `${EMOJIS.no} Hey hey heyyy, did you tag a few too many roles? Please tag fewer roles and try again`,
            dontKnow: `• I-I don't know how I can do this...\n`,
        },
        allRegisterMessages: {
            registerChannel: `${EMOJIS.channel} On which channel will the recordings be made? Pleage tag a channel`,
            afterRegisterChannel: `${EMOJIS.channel} Which channel will be the channel after register? It is recommended that the after recording channel be a chat channel. If you do not want to set the channel after register, you can type \`skip\`. Pleage tag a channel`,
            registerLogChannel: `${EMOJIS.channel} Which channel will be the register log channel? If you do not want to set the register log channel, you can type \`skip\`. Pleage tag a channel`,
            registerAuthRole: `${EMOJIS.role} Which role will be the authorized person who registers the members? Please tag a role`,
            unregisterRole: `${EMOJIS.role} What role will be taken after registering the members or what role will I give them when they join the server? In short, what will be the indifferent role? Please tag a role`,
            registerType: `❓ Will your register type be **Member** or **Gender**?`,
            memberRoles: `${EMOJIS.member} What role(s) will be assigned to members? Please tag the role(s)`,
            girlRoles: `${EMOJIS.girl} What role(s) will the girls be given? Please tag the role(s)`,
            boyRoles: `${EMOJIS.boy} What role(s) will be assigned to men? Please tag the role(s)`,
            botRoles: `${EMOJIS.bot} What role(s) will be given to bots? If you don't want to set it, you can type \`skip\`. Please tag the role(s)`,
            tag(exampleName) {
                return `📝 What should be the tag to put in front of the names? If you do not want to set a tag, you can write \`skip\`\n` +
                    `• If you set the tag to **♫** it will look like this **${exampleName}**`;
            },
            symbol(exampleName) {
                return `📝 What symbol should be placed between the names? If you don't want to set a symbol you can type \`skip\`\n` +
                    `‼️ Symbols will not be placed in bot names \n` +
                    `• If you set the symbol to **|** it will look like this **${exampleName}**`;
            },
            guildAddName(exampleName) {
                return `📝 When someone enters the server, what should be their username? If you do not want to set the username, you can type \`skip\`\n` +
                    `‼️ Autoname will not be placed in the names of the bots\n` +
                    `• If you set the autoname to **<tag> <name>** it will look like this **${exampleName}**`;
            }
        },
        already: "You cannot start the registration process again while the registration process is in progress",
        cancelAndClose: `• To cancel the transaction, you can type **cancel** or **close**\n` +
            `• If you want to return to the previous question, you can write **back**`,
        usersName: "User's Name",
    },
    kurallar: {
        embed: {
            author: "Alisa rules",
            description: `**Before you start using [Alisa](${botInviteLink}), you must read and accept the following rules.**\n\n` +
                `🌐 **General Usage Rules**\n` +
                `• Do not use Alisa's commands to harm or disturb other users\n` +
                `• Copying, duplicating or creating fake accounts in Alisa's name is prohibited\n` +
                `• If you have any questions or requests for help, you can reach our **[Support Server](${discordInviteLink})**\n\n` +
                `🚫 **Spamming and Flooding is Prohibited**\n` +
                `├> Repeating the same command over and over or pressing the same command quickly is considered spam\n` +
                `├> It is prohibited to spam the bot by clicking the bot's buttons quickly\n` +
                `└> Spammers may be automatically warned and temporarily or permanently banned\n\n` +
                `🔒 **Bot Security and Vulnerabilities**\n` +
                `• Actions that disrupt, manipulate or exploit Alisa's system are prohibited\n` +
                `• Such situations will disrupt Alisa's operation and negatively affect the experience of other users\n` +
                `• Those who find a vulnerability, please report the situation to the administrators on the support server and contribute to the solution process\n\n` +
                `⚠️ **Other Important Rules**\n` +
                `• Alisa's commands are designed to be fun, helpful and fair to use\n` +
                `• Avoid abusing commands in a way that negatively affects another user's experience\n` +
                `• Those who do not comply with these rules may be automatically punished by Alisa\n\n` +
                `**Everyone who uses the bot is deemed to have read and accepted these rules! We wish you a pleasant use!**\n\n` +
                `||*Your smile is as bright and beautiful as the stars... 💖*||`

        }
    },
    kilit: {
        already: "This channel is already locked",
        success(channelId) {
            return `• 🔒 <#${channelId}> has been successfully locked`
        },
    },
    kilitaç: {
        already: "This channel is already unlocked",
        success(channelId) {
            return `• 🔓 <#${channelId}> has been successfully unlocked`
        },
    },
    mesajliste: {
        embedDescription({
            authorMessageCount,
            authorPosition
        }) {
            return `• All people who sent messages to the server\n` +
                `• You are **${authorPosition}.** ranked! (**__${authorMessageCount}__ messages**) 🎉`
        }
    },
    mute: {
        enter({
            prefix,
            memberId
        }) {
            return `Please enter a time\n\n` +
                `**Example**\n` +
                `• ${prefix}mute <@${memberId}> 1 day, 5 hours, 6 minutes and 30 seconds, rest your mind for a while\n` +
                `• ${prefix}mute <@${memberId}> 30 minutes`
        },
        wrongTime: "Please enter a time between a minimum of 1 second and a maximum of 27 days",
        successMute({
            authorDisplayName,
            muteTime,
            reason
        }) {
            return `Authority: ${authorDisplayName} | Duration: ${muteTime} | Reason: ${reason}`
        },
        successMsg({
            memberId,
            msToHumanize,
            reason,
            penaltyNumber
        }) {
            return `${EMOJIS.yes} <@${memberId}> was banned from text and voice channels for **${msToHumanize}** for __**${reason || "No reason given"}**__!${penaltyNumber ? ` **Penalty number:** \`#${penaltyNumber}\`` : ""}`
        },
        embedMute: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                muteAt,
                memberDisplayName,
                reason,
                msToHumanize,
                muteOpenAt,
                penaltyNumber
            }) {
                return `**🔇 Member <@${memberId}> has been __temporarily__ silenced**\n\n` +
                    `🧰 **AUTHORITY WHO MUTED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Mute date:** <t:${muteAt}:F> - <t:${muteAt}:R>\n\n` +
                    `👤 **MUTED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Reason to be silenced:** ${reason || "Reason not stated"}\n` +
                    `**• Silencing duration:** ${msToHumanize}\n` +
                    `**• Date when the mute will be opened:** <t:${muteOpenAt}:F> - <t:${muteOpenAt}:R>` +
                    (penaltyNumber ?
                        `\n• **Penalty number:** \`#${penaltyNumber}\`` :
                        "")
            }
        },
        unmute(memberId) {
            return `• Successfully unmuted <@${memberId}>!`
        },
        embedUnmute: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                muteAt,
                memberDisplayName,
                reason,
                msToHumanize,
                penaltyNumber
            }) {
                return `**🔊 Member <@${memberId}> has been unmuted**\n\n` +
                    `🧰 **AUTHORITY WHO UNMUTED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **UNMUTED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Reason to be silenced:** ${reason || "Reason not stated"}\n` +
                    `**• Silencing duration:** ${msToHumanize}\n` +
                    `**• Date of the silencing:** <t:${muteAt}:F> - <t:${muteAt}:R>` +
                    (penaltyNumber ?
                        `\n• **Penalty number:** \`#${penaltyNumber}\`` :
                        "")
            }
        }
    },
    otocevap: {
        sendMessage: "Now, when the user writes this message, what will I write??",
        success: {
            description: "Your auto message has been successfully set! I gave an example of how to use the message below",
            send: "The message the user will send",
            trigger: "The message I will send"
        },
        restart: {
            description: "Due to the bot being restarted, the **Auto response setting** command you used before has been restarted\n\n",
            trigger: "Now please write the trigger message",
            send: "Now, when the user writes this message, what will I write??"
        },
        set: {
            trigger: 'Please write the message to be triggered\n\n**• If you don\'t know what this means: for example, if you want the bot to write "hi" when someone writes "hello", write "hello" to the trigger'
        },
        remove: {
            trigger(prefix) {
                return `Please enter a **trigger** message data\n\n` +
                    `**Example:**\n` +
                    `• ${prefix}autoresponse remove hey\n` +
                    `• ${prefix}autoresponse remove hello`
            },
            noData: "No auto-response data found for the data you entered",
            success(message) {
                return `The auto-response data named **${message}** has been successfully removed`
            }
        },
        list: {
            noData: "The table can't be displayed because there is no auto-response data in this server",
            description(length) {
                return `• There are currently __${length}__ auto-response data in the bot`
            },
            timestamp: "Added date"
        },
        enter(prefix) {
            return `Please enter an option\n\n` +
                `**🗒️ Enterable options**\n` +
                `**• ${prefix}autoresponse add =>** Adds a new autoresponse data\n` +
                `**• ${prefix}autoresponse remove =>** Removes the specified autoresponse data\n` +
                `**• ${prefix}autoresponse list =>** Shows the entire autoresponse list`
        }
    },
    otodüzeltme: {
        optionName: "Autocorrect",
        enter(prefix) {
            return `• To turn on the autocorrect setting, you can type **${prefix}autocorrect on**\n\n` +
                `• To close it, you can type **${prefix}autocorrect off**`
        }
    },
    otoşüpheli: {
        optionName: "Auto suspicious",
        enter(prefix) {
            return `• To turn on the auto suspicious setting, you can type **${prefix}autosuspicious on**\n\n` +
                `• To close it, you can type **${prefix}autosuspicious off**`
        }
    },
    oy: {
        voteMessage(link) {
            return `[Click here](${link} "You will vote for me, won't you?") to vote for me!!!`
        }
    },
    öneri: {
        enterMessage: "Please write your suggestions about the bot",
        success: "💬 **Your suggestion has been taken and forwarded to my owner. Thank you for your support 💗**"
    },
    özel: {
        anothers: "Hey, wait there! Another official is currently setting the login message",
        cancel: "The transaction has been canceled",
        resets: {
            already: `Customized login message is not already set`,
            success: `${EMOJIS.yes} Customized login message successfully reset`
        },
        tooMuchCharacter(maxLength) {
            return `There are too many characters! Your message must be less than **${maxLength}** characters!`
        },
        success(prefix) {
            return `${EMOJIS.yes} The customized login message has been set successfully. You can type **${prefix}fake** to see how it looks`
        },
        embed: {
            title: "Now is the time to think",
            description({
                guildName,
                registerAuthRoleId,
                authorId,
                authorDisplayName,
                memberCount,
                memberCountEmojis,
                createdTimestampSecond,
                createdTimestampString,
                security
            }) {
                return `• To cancel **cancel**\n` +
                    `• To reset, you can type **reset**\n\n` +
                    `**If you want your intro message to be unboxed, just write <unboxed> at the beginning of your message!**\n\n` +
                    `**Variables**\n` +
                    `**• <guildName>** => Writes the server name - ( ${guildName} ) \n` +
                    `**• <role>** => Tags the registrar role - ( ${registerAuthRoleId ? `<@&${registerAuthRoleId}>` : "__**ROLE NOT SET**__"} )\n` +
                    `**• <member>** => Tags the incoming person - ( <@${authorId}> )\n` +
                    `**• <memberName>** => Writes the name of the incoming person - ( ${authorDisplayName} )\n` +
                    `**• <memberId>** => Writes the ID of the incoming person - ( ${authorId} )\n` +
                    `**• <total>** => Writes the total number of members of the server - ( ${memberCount} )\n` +
                    `**• <emojiTotal>** => Writes the total number of members of the server with emojis - ( ${memberCountEmojis} )\n` +
                    `**• <date>** => Writes the establishment date of the account - ( <t:${createdTimestampSecond}:F> )\n` +
                    `**• <date2>** => Writes the establishment date of the account - ( <t:${createdTimestampSecond}:R> )\n` +
                    `**• <date3>** => Writes the establishment date of the account - ( ${createdTimestampString} )\n` +
                    `**• <security>** => Indicates whether it is secure or not - ( ${security} )`
            },
            footer: "You have 16 minutes to respond"
        }
    },
    partner: {
        partner: "Partner",
        noMember: "There is no member with the partner role",
        allPartner: "All partner officials",
        partnerRole: "Partner roles",
        notifNoGone: "*• **Roles and members** above __did not receive__ notification*",
        nooneHasRole: "Wellyy.. No one has the partner role",
        enterFull(prefix) {
            return `• To set the partner role **${prefix}partner set**\n` +
                `• To reset the partner role **${prefix}partner reset**\n` +
                `• To tag all partner members **${prefix}partner tag**\n` +
                `• To view all partner members without tagging **${prefix}partner view**\n` +
                `• To see the partner role **${prefix}partner role**`
        }
    },
    pp: {
        openInBrowser: "Open in browser"
    },
    premium: {
        options(prefix) {
            return `• **${prefix}pre use <code> =>** Allows you to use an official premium code obtained from the authorities\n` +
                `• **${prefix}pre change <code> <guildId> =>** Allows you to transfer the premium features of a server to another server\n` +
                `• **${prefix}pre time =>** Shows the premium time of this server\n` +
                `• **${prefix}pre features =>** Used to see the features specific to Premium\n` +
                `• **${prefix}pre price =>** Used to see premium prices`
        },
        enter(options) {
            return `Please enter an option\n\n` +
                `**🗒️ Enterable options**\n` +
                `${options}`
        },
        noCode({
            prefix,
            randomCode,
        }) {
            return `Please enter the premium command you received from the authorities\n\n` +
                `**Example**\n` +
                `• ${prefix}pre use ${randomCode}`
        },
        noCodeFound(premiumCode) {
            return `I couldn't find the premium code corresponding to **${premiumCode}**!\n\n` +
                `• If you purchased premium and can't activate it, you can come to __[My Support Server](${discordInviteLink})__ and get support from the authorities`
        },
        notOwner(premiumAuthorId) {
            return `Only the person who purchased this premium code (<@${premiumAuthorId}>) can use it you silly thing :(`;
        },
        codeWorked(guildName) {
            return `Premium code has been successfully activated and can be used! ${guildName} server now has __very, very special advantagesp__!!`;
        },
        use: {
            codeAlreadyUsed({
                premiumCode,
                guildName,
                prefix
            }) {
                return `The premium code corresponding to **${premiumCode}** already has a server ( ${guildName} )\n\n` +
                    `• If you want to transfer your premium to another server, you can transfer your premium to another server by typing **${prefix}pre change**`
            },
            guildAlreadyHasPremium(guildName) {
                return `Wellyy... ${guildName} server already has a premium, you silly thing :(`;
            },
            codeIsExpired(guildName) {
                return `• Heyy, I see that ${guildName} server seems to have run out of premium :(\n\n` +
                    `• If you are satisfied with the premium or want to buy it again, you can come to my support server.!!\n\n` +
                    `• ${discordInviteLink}`
            }
        },
        change: {
            codeIsNotUsed({
                prefix,
                premiumCode,
                randomCode
            }) {
                return `The premium code **${premiumCode}** has never been used in any server\n\n` +
                    `• If you want to use the premium code, you can write **${prefix}pre use**\n\n` +
                    `**Example**\n` +
                    `• ${prefix}pre use ${randomCode}`
            },
            enterGuildId: "Enter the ID of the server to which you will transfer the premium features",
            guildAlreadyUsesPremium(guildName) {
                return `The premium code you entered is already used on ${guildName}`;
            },
            guildAlreadyHasPremium(guildName) {
                return `Wellyy... **${guildName}** server already has a premium, you silly thing :(`;
            }
        },
        time: {
            noPremium: "There is no premium defined for this server :(",
            premiumNeverEnds: "The premium on this server will **NEVER** end oleyy!! 🎉",
            premiumEndsAt(expiresTimestampInSecond) {
                return `The premium on this server will expire on **<t:${expiresTimestampInSecond}:F> - <t:${expiresTimestampInSecond}:R>**\n` +
                    `So it will end after __${Time.duration(expiresTimestampInSecond, language, { toNow: true })}__`;
            }
        },
        features: {
            description(prefix) {
                return `• To find out the price information, you can write **${prefix}pre price**\n\n` +
                    `• Heyy, I see you're thinking of buying premium, then you've come to the right place\n\n` +
                    `__**• Let me briefly tell you about the premium features.**__\n` +
                    ` ├> You can use it as you wish without any waiting period for any command\n` +
                    ` ├> You can make your server a better place with many premium-specific commands\n` +
                    ` ├> You can see the features coming to the bot before other users\n` +
                    ` ├> After your premium ends, none of your data will be deleted and you can use it without setting anything when you get premium again\n` +
                    ` ├> You have a special role on my support server :3\n` +
                    ` └> And if you don't like it within 1 week, your money will be refunded immediately.!\n\n` +
                    `• If you want to get premium, just come to __**[My Support Server](${discordInviteLink})**__ and open a ticket\n\n` +
                    `• And most importantly *I love you..* 💗`
            }
        },
        price: {
            description({
                prefix,
                premium
            }) {
                return `${premium ? "• Heyyy I see that premium is already activated on this server!\n\n" : ""}` +
                    `• To learn about premium features, you can write **${prefix}pre features**\n\n` +
                    `• If you don't like it within 1 week, your money will be refunded.!\n\n` +
                    `• **1 month =>** __5__ Dollars 💵\n` +
                    `• **3 month =>** __12__ Dollars 💵\n` +
                    `• **6 month =>** __20__ Dollars 💵\n` +
                    `• **Unlimited =>** __40__ Dollars 💵\n\n` +
                    `• We only accept **Papara and IBAN** as payment\n\n` +
                    `• If you want to get premium, just come to __**[My Support Server](${discordInviteLink})**__ and open a ticket`
            }
        }
    },
    prefix: {
        enter(prefix) {
            return `Please write new prefix\n\n` +
                `**Example:**\n` +
                `• ${prefix}prefix a!` +
                `• ${prefix}prefix reset (resets prefix to default value **(${defaultPrefix})**)`
        },
        samePrefix: "The prefix of the bot is already the same as the prefix you are trying to change, you silly thing :)",
        noLongerThan5: "Your prefix length can't be longer than 5!",
        embed: {
            description(newPrefix) {
                return newPrefix == defaultPrefix ?
                    `Your prefix has been successfully reset to default value **(${defaultPrefix})**!` :
                    `Your prefix has been successfully changed to **${newPrefix}**!`
            },
            field: {
                name: "Example",
                value({
                    newPrefix,
                    userTag
                }) {
                    return `\`\`\`css\n` +
                        `${newPrefix}help\n` +
                        `${newPrefix}prefix\n` +
                        `${newPrefix}support\n` +
                        `@${userTag} help\n\`\`\``
                }
            }
        }
    },
    rank: {
        botError: "Bots have no rank :)",
        rankMessages: {
            author: {
                yourRank: "Your rank",
                congratulations() {
                    return "You are at the highest rank possible"
                },
                youNeedThis: "you"
            },
            other: {
                yourRank: "Rank",
                congratulations(userId) {
                    return `<@${userId}> has the highest rank available`
                },
                youNeedThis: "he/she"
            },
            noRank(rank) {
                return `No rank`
            },
            toReach({
                nextRank,
                moreRegisterEmoji,
                doIt
            }) {
                return `To reach **${nextRank}** rank ${doIt} need to complete ${moreRegisterEmoji} more register`
            }
        }
    },
    rankrol: {
        enter(prefix) {
            return `• To add a new role **${prefix}rankrole add**\n` +
                `• To remove the added role **${prefix}rankrole remove**\n` +
                `• To change the added role **${prefix}rankrole change**\n` +
                `• To list the roles **${prefix}rankrole list**\n` +
                `• To remove all of them you can write **${prefix}rankrole reset**`
        },
        enterAdd(prefix) {
            return `Please specify a role and the number of records to be given (The number entered must be between 1-9999)\n\n` +
                `**Example:**\n` +
                `• ${prefix}ranrole add @role 5\n` +
                `• ${prefix}ranrole add 100 @SuperRegister`

        },
        enterRemove(prefix) {
            return `Please specify the role you want to remove (The number entered must be between 1-9999)\n\n` +
                `**Example:**\n` +
                `• ${prefix}ranrole remove @role\n` +
                `• ${prefix}ranrole remove 100`

        },
        enterChange(prefix) {
            return `Please specify the role you want to change (The number entered must be between 1-9999)\n\n` +
                `**Example:**\n` +
                `• ${prefix}ranrole change @role 5\n` +
                `• ${prefix}ranrole change 100 @Super Recorder`
        },
        roleAlreadyExists(rankCount) {
            return `The role you entered has already been added (given to the ${rankCount}. registration number)`
        },
        roleIsAlreadySame: "The role you entered is already the same",
        negativeNumber: "You cannot enter a negative number",
        numberAlreadyExists(rankRoleId) {
            return `The person who reaches the number you entered has already been given the role <@&${rankRoleId}>`
        },
        successAdd({
            rankCount,
            rankRoleId
        }) {
            return `**${rankCount}.** people who reach the number of records will be given the role <@&${rankRoleId}>`
        },
        successRemove(rankRoleId) {
            return `The role <@&${rankRoleId}> has been successfully removed`
        },
        successChange({
            rankCount,
            rankRoleId
        }) {
            return `The role <@&${rankRoleId}> will be given to the **${rankCount}.** person who reaches the number of records`
        },
        successReset: "All roles have been successfully removed",
        noNumberOrRoleData: "No data was found that matches the number or roles you entered",
        noNumberData: "No data was found that matches the number you entered",
        noData: "There are no ranked roles on this server"
    },
    rolal: {
        noRole: "Please tag a role or roles",
        noRoleToGive: "The person does not have any of the roles you tagged",
        boosterRole: "One of the roles you tagged is the role given to the server after it is boosted"
    },
    rolver: {
        noRole: "Please tag a role or roles",
        noRoleToGive: "The person has all the roles you tagged",
        boosterRole: "One of the roles you tagged is the role given to the server after it is boosted"
    },
    say: {
        error({
            prefix,
            hasAdmin
        }) {
            return `Wellyy... Nothing is __set__ to be shown in the **${prefix}count** command on this server` +
                (
                    hasAdmin ?
                        `\n\n• If you want to change the count settings, you can type **${prefix}count-settings**` :
                        ""
                )
        },
        serverInformation: {
            name: "__Server information__",
            value({
                datas: {
                    registerType,
                    total,
                    online,
                    registered,
                    boy,
                    girl,
                    unregister,
                    voice,
                    vip,
                    jail,
                    boostMembers,
                    boostCount,
                    numberToFormat
                },
                openOrCloseDatas
            }) {
                const result = [];

                if (openOrCloseDatas.total) result.push(`There are ${numberToFormat(total)} people on the server`);
                if (openOrCloseDatas.status) result.push(`There are ${numberToFormat(online)} people online out of ${numberToFormat(total)} people on the server`);
                if (openOrCloseDatas.registered) result.push(
                    (registerType == "member" ?
                        `There are ${numberToFormat(registered)} members` :
                        `There are ${numberToFormat(boy)} male members, ${numberToFormat(girl)} female members`) +
                    ` and ${numberToFormat(unregister)} unregistered members on the server`
                );
                if (openOrCloseDatas.voice) result.push(`Voice channels have ${numberToFormat(voice)} members on the server`);
                if (openOrCloseDatas.boostCount) result.push(`There are ${numberToFormat(boostCount)} boost and ${numberToFormat(boostMembers)} boost members on the server`);
                if (openOrCloseDatas.vip) result.push(`There are ${numberToFormat(vip)} vip members on the server`);
                if (openOrCloseDatas.jail) result.push(`There are ${numberToFormat(jail)} people are in jail on the server`);

                return result;
            }
        },
        authInformation: {
            name: "__Authorities information__",
            value({
                datas: {
                    registerAuth,
                    jailAuth,
                    vipAuth,
                    banAuth,
                    kickAuth,
                    muteAuth,
                    numberToFormat
                },
                openOrCloseDatas
            }) {
                const result = [];

                if (openOrCloseDatas.registerAuth) result.push(`There are ${numberToFormat(registerAuth)} registration authorities on the server`);
                if (openOrCloseDatas.jailAuth) result.push(`There are ${numberToFormat(jailAuth)} jail authorities on the server`);
                if (openOrCloseDatas.vipAuth) result.push(`There are ${numberToFormat(vipAuth)} vip officials on the server`);
                if (openOrCloseDatas.banAuth) result.push(`There are ${numberToFormat(banAuth)} ban authority on the server`);
                if (openOrCloseDatas.kickAuth) result.push(`There are ${numberToFormat(kickAuth)} kick authorities on the server`);
                if (openOrCloseDatas.muteAuth) result.push(`There are ${numberToFormat(muteAuth)} mute authorities on the server`);

                return result;
            }
        },
        description(prefix) {
            return `**• To change the count settings, you can type __${prefix}count-settings__**`
        }
    },
    "say-ayarlar": {
        options({
            prefix,
            registerType
        }) {
            return `**• ${prefix}count-setting [emoji/noemoji]**\n\n` +
                `**• ${prefix}count-setting [add/remove] total =>** Shows the number of members on the server\n` +
                `**• ${prefix}count-setting [add/remove] status =>** Shows the number of members with online status on the server\n` +
                `**• ${prefix}count-setting [add/remove] member =>** Shows how many ${registerType == "member" ? "member" : "boy, girl"} and unregistered members are on the server\n` +
                `**• ${prefix}count-setting [add/remove] tagged =>** Shows the number of tagged members on the server\n` +
                `**• ${prefix}count-setting [add/remove] voice =>** Shows how many people are on voice channels\n` +
                `**• ${prefix}count-setting [add/remove] boost =>** Shows how many boosts and how many people pressed boosts on the server\n` +
                `**• ${prefix}count-setting [add/remove] vip =>** Shows the number of VIP members on the server\n` +
                `**• ${prefix}count-setting [add/remove] registerauth =>** Shows the number of members with the registrar role on the server\n` +
                `**• ${prefix}count-setting [add/remove] jail =>** Shows the number of members with the jail role on the server\n` +
                `**• ${prefix}count-setting [add/remove] jailauth =>** Shows the number of members with the jail authority role on the server\n` +
                `**• ${prefix}count-setting [add/remove] banauth =>** Shows the number of members with the ban authority role on the server\n` +
                `**• ${prefix}count-setting [add/remove] kickauth =>** Shows the number of members with the kick authority role on the server`;
        },
        dataToString: {
            total: "Total number of members on the server",
            registered: "Number of registered and unregistered members",
            tagged: "Number of tagged members",
            voice: "Number of members in the voice",
            boostCount: "Number of boosts on the server",
            vip: "Number of VIP members",
            registerAuth: "Number of registration authority members",
            jail: "Number of jail members",
            jailAuth: "Number of jail authority members",
            vipAuth: "Number of VIP authorized members",
            banAuth: "Number of banned authorized members",
            kickAuth: "Number of kick authorized members",
            muteAuth: "Number of mute authorized members",
            status: "Number of members with online status",
        },
        enterOption(options) {
            return `Please enter an option\n\n` +
                `**🗒️ Enterable options**\n` +
                `${options}`;
        },
        add: {
            alreadyShow({
                prefix,
                data
            }) {
                return `I am already showing the __${data}__ that you wrote in the **${prefix}count** command`
            },
            show({
                prefix,
                data,
                showCommands
            }) {
                return `In **${prefix}count** command, I now also show __${data}__!!\n\n` +
                    `**Data to be displayed in the count command**\n` +
                    `• ${showCommands}`
            }
        },
        remove: {
            notShow({
                prefix,
                data
            }) {
                return `I am not already showing the __${data}__ that you wrote in the **${prefix}count** command`
            },
            show({
                prefix,
                data,
                showCommands
            }) {
                return `I no longer show __${data}__ in **${prefix}count** command!!\n\n` +
                    `**Data to be displayed in the count command**\n` +
                    `• ${showCommands}`
            }
        },
        emoji: {
            alreadyEmoji(prefix) {
                return `On this server, my **${prefix}count** emoji setting is already __with emoji__`
            },
            successEmoji(prefix) {
                return `My **${prefix}count** command on this server is now __emoji__!`
            },
            alreadyNoEmoji(prefix) {
                return `On this server, my **${prefix}count** emoji setting is already __emojiless__`
            },
            successNoEmoji(prefix) {
                return `My **${prefix}count** command on this server is now without __emoji__!`
            }
        }
    },
    sembol: {
        enter(prefix) {
            return `• To set the symbol **${prefix}symbol <Your symbol>**\n\n` +
                `• To reset, you can type **${prefix}symbol reset**`
        },
        alreadyReset: "The symbol to be placed between the names has already been reset",
        successReset: "The symbol to be placed between the names has been successfully reset",
        maxError(maxLength) {
            return `There are too many characters! Your symbol must be less than **${maxLength}** characters!`
        },
        sameSymbol: "The symbol to be placed between the names is the same as the symbol you have already written",
        success({
            symbol,
            example
        }) {
            return `The symbol to be placed between names has been successfully set to **${symbol}**\n\n` +
                `**Example:**\n` +
                `${example}`
        }
    },
    seskanal: {
        remove: {
            already: "You haven't already determined a voice channel for me to join",
            success: "Voice channel removed successfully"
        },
        toSet(prefix) {
            return `Please tag an voice channel, enter the channel ID\n\n` +
                `• If you want to remove a voice channel you created, you can type **${prefix}setvoice remove**`;
        },
        set: {
            dontHavePermission: "I do not have permission to join the channel you tagged :(",
            success(voiceChannelId) {
                return `📥 I'm logged in to <#${voiceChannelId}>!`;
            }
        }
    },
    sesliste: {
        embedDescription({
            authorDuration,
            authorPosition
        }) {
            return `• All people who entered the voice are people\n` +
                `• You are **${authorPosition}.**! (**__${authorDuration}__**) 🎉`
        }
    },
    ship: {
        noMember: "Uhh... It seems like there's no one here but you... Or it seems like no one can see this channel but you... Both are as bad as each other...",
        randomMessages: {
            0: [
                "This relationship has no chance... ever.",
                "You two are like sworn enemies >:(",
                "Nope, this will never work. NEVER!",
                "Wish you never met... this is bad.",
                "You two were NOT meant to be :(",
                "This is a total disaster... abort mission!",
                "Seeing you two together is just... awkward.",
                "Please don't try this again... it's hopeless."
            ],
            1: [
                "There might be something there, but... it's complicated.",
                "Hmm, you could get a little closer, maybe?",
                "It could work... or it could totally crash.",
                "With time, this might evolve... but it's a tough road.",
                "You probably shouldn't start anything... just saying.",
                "You don't seem to like each other that much."
            ],
            2: [
                "There's potential here, pay attention!",
                "You two could work out, give it a shot!",
                "You might like each other after all, who knows?",
                "Is there something between you two? Go on, try it!",
                "There’s a tiny spark... but is it enough?",
                "Seems worth a try, go for it!"
            ],
            3: [
                "Not bad, but something feels... off.",
                "The spark is kind of weak here.",
                "Is it just me, or does this feel a little cold?",
                "It could get better with time, but for now... meh.",
                "There's some progress, but don't get too excited.",
                "Taking the first step might be tough, but why not try?"
            ],
            4: [
                "Slowly heating up... let's see what happens!",
                "There's potential, but you need more effort.",
                "It could be better, but there's hope. Keep going.",
                "Sparks are starting to fly, just a little.",
                "A bit of light... but it's a long journey ahead.",
                "Keep at it! Your efforts might just pay off."
            ],
            5: [
                "This relationship is balanced. Not great, but not bad either!",
                "There's not much emotion here, but there's still hope!",
                "The potential is there, but it's going to take some effort...",
                "We're somewhere in the middle, let's see where it goes.",
                "50/50! Could work out, could not.",
                "It's a coin toss! Good luck :)"
            ],
            6: [
                "This relationship looks promising! Go for it!",
                "You two are pretty close, keep pushing forward!",
                "I can feel the chemistry between you! Keep it up!",
                "This could grow into something special. Just a bit more effort!",
                "You're halfway there! Don't stop now!",
                "You're close, but there's room to grow."
            ],
            7: [
                "This is looking great, woohoo!",
                "You two complete each other, awesome!",
                "The sparks are flying!",
                "Your bond is getting stronger, keep at it!",
                "You’re almost perfect together, this is going places!",
                "This relationship is solid, full speed ahead!"
            ],
            8: [
                "You two could be an amazing couple! Yay!",
                "You were made for each other, incredible!",
                "This relationship is strong, keep it going!",
                "You've truly found each other, fantastic!",
                "Such great chemistry! Keep it up!",
                "This relationship is on a roll!"
            ],
            9: [
                "This relationship is absolutely perfect!",
                "It's like you're tied together, don't let go!",
                "There's an amazing bond between you, keep it going!",
                "You're the perfect couple, no doubt!",
                "The stars are shining for this relationship!",
                "This is rock solid, you're awesome!"
            ],
            10: [
                "This relationship is flawless, truly perfect!",
                "No one can tear you apart, you're incredible together!",
                "You were meant for each other, magnificent!",
                "This is pure chemistry! What a power couple!",
                "Together forever, you're perfect!",
                "You're the ultimate pair! Everything is just perfect!"
            ],
            self: [
                "This is the best relationship you'll ever have... with yourself! You're amazing! 💖",
                "Your harmony with yourself is pure perfection! Everything about you is awesome! 🌟",
                "No one can be as perfect as you. You're a fantastic duo with yourself! 🔥",
                "You and you. Could there be a better combo? Of course not! 😎",
                "Your relationship with yourself is legendary! You're number one! 🏆",
                "No other pair in the world can be as perfectly in sync as you and yourself! 🌈",
                "Who else could fit you as perfectly as you do? You're flawless! 💯",
                "You're always the best! Your self-harmony shines as bright as the stars! ✨",
                "You've made a stellar pair... with yourself! Only you could pull this off! 🌟",
                "This relationship is a perfect 10/10! No one else could match you like you do! 💪"
            ]
        },
        embed: {
            title: "Ship Result",
            content: {
                you(authorId) {
                    return `<@${authorId}>, testing your compatibility with... yourself?`
                },
                other({
                    authorId,
                    memberId
                }) {
                    return `<@${authorId}> and <@${memberId}>, checking your compatibility?`
                }
            },
            description: {
                you({
                    randomMessage,
                    randomHearts
                }) {
                    return `• **Your self-compatibility**: **1000000**/10\n\n` +
                        `• **${randomMessage}**\n` +
                        `${randomHearts}`
                },
                other({
                    authorOrMemberTag,
                    memberTag,
                    randomShip,
                    randomMessage,
                    shipResult
                }) {
                    return `• **${authorOrMemberTag}** and **${memberTag}** compatibility: **${randomShip}**/10\n\n` +
                        `• **${randomMessage}**\n` +
                        `${shipResult}`
                }
            },
            footer: {
                you: "Always love yourself <3",
                other: "No matter what, I love you both <3"
            }
        }
    },
    sıfırla: {
        confirmationMessage: "Are you sure you want to reset all data on the server (except the AFK system)?",
        dataResetSuccess: "I have successfully reset **ALL** your data on this server",
        transactionCanceled: "The transaction has been canceled",
        notOwner: "You must be a **server owner** to use this command, you silly thing :(",
        attentionEmbed: {
            title: "ATTENTION!!",
            description: `• Are you sure you want to reset/delete all saves, set roles and channels, save history, jail info and settings, and **EVERYTHING** else? \n\n` +
                `• If you want to delete it, write **yes**, if not, write **no**\n\n` +
                `**Attention!!** This process is permanent and can't be undone! Please think carefully...`,
            footer: "You have 2 minutes to respond"
        }
    },
    sıra: {
        rank: {
            author({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} **<@${userId}> ${Util.toHumanize(total || 0, language)} Number of registrations • ${Util.getUserRank(total, language) || "You have no rank"}**`
            },
            alisa({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(total || 0, language)}** Number of my registrations **•** Bots have no rank :)`
            },
            user({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} <@${userId}> **${Util.toHumanize(total || 0, language)}** Number of registrations **•** ${Util.getUserRank(total, language) || "No rank"}`
            }
        },
        noRecord: "The table can't be displayed because no one has been registered on this server before",
        embedDescription({
            length,
            userRank
        }) {
            return `**📈 Server registration order!** ${userRank ? `\n**👑 You are ranked ${length} among ${userRank} people**` : ""}`
        }
    },
    sil: {
        enter(prefix) {
            return `Please enter a valid __number__\n\n` +
                `**Example**\n` +
                `• ${prefix}del 15\n` +
                `• ${prefix}del 500`
        },
        zeroError: "How can I delete 0 messages, you silly thing :)",
        maxError(max) {
            return `The number value you enter must be less than __${max}__!`
        },
        deleting: "Deleting messages...",
        successDelete({
            authorId,
            deleteCount
        }) {
            return `• <@${authorId}>, __**${deleteCount}**__ messages deleted successfully!`
        },
        successButError({
            authorId,
            deleteCount
        }) {
            return `• <@${authorId}>, __**${deleteCount}**__ messages were deleted successfully, but I do not have permission to delete previous messages :(`
        }
    },
    snipe: {
        noData: {
            channel: "Message information cannot be found because no messages have been deleted in this channel before",
            user: "Message information cannot be found because no messages have been deleted by this user before"
        },
        messageUnknown: "> *Message unknown???*",
        data: {
            image: "Picture",
            video: "Video",
            audio: "Sound",
            text: "Text",
            font: "Font",
            others: "Other"
        },
        titles: {
            content: "Content of the message",
            description({
                snipeAuthor,
                extraInformation,
                createdTimestamp,
                deletedTimestamp
            }) {
                return `• **Post owner:** <@${snipeAuthor}>${extraInformation ?
                    (`\n\n**The message contained the following contents::**\n` +
                        `${extraInformation}`) :
                    ""}\n\n` +
                    `• **Time the message was written <t:${createdTimestamp}:R>**\n` +
                    `• **Message deletion time <t:${deletedTimestamp}:R>**`
            }
        }
    },
    sonkayıtlar: {
        noRecords: "The table can't be displayed because the person you tagged has never recorded before",
        noRecordsUser: "The table can't be displayed because no records have been made on this server before",
        totalUser(userId) {
            return `<@${userId}>'s total`
        },
        totalGuild: "Total on this server",
        recordFound: "records found"
    },
    spotify: {
        botError: "You didn't really think to look at the bots' statistics, did you?",
        offline(memberId) {
            return `• <@${memberId}> is currently offline so I can't see their status`

        },
        notListening(memberId) {
            return `• <@${memberId}> is not currently listening to spotify`

        },
        embed: {
            description(memberId) {
                return `• <@${memberId}> is currently listening to spotify`

            },
            fields: {
                names: {
                    musicName: "🎵 Music name",
                    artistsNames(artists) {
                        return `👥 ${artists.length > 1 ? "Artists" : "Artist's"} name${artists.length > 1 ? ` (${artists.length})` : ""}`
                    },
                    albumName: "📝 Album name",
                    duration: "⏰ Music duration",
                }
            }
        }
    },
    statayar: {
        on: {
            already: "The statistics system is already active on this server",
            success: "The statistics system has been successfully activated on this server"
        },
        off: {
            already: "The statistics system is already disabled on this server",
            attentionEmbed: {
                title: "ATTENTION!!",
                description: `• Are you sure you want to disable the statistics system on this server? If you do this, all statistics data will be deleted and cannot be restored\n\n` +
                    `• If you want to disable it, write **yes**, if not, write **no**\n\n` +
                    `**Attention!!** This process is permanent and can't be undone! Please think carefully...`,
                footer: "You have 2 minutes to respond"
            },
            success: "The statistics system has been successfully disabled on this server"
        },
        enter(prefix) {
            return `• To enable the statistics system, you can type **${prefix}statsettings on**\n` +
                `• To disable it, you can type **${prefix}statsettings off**`
        }
    },
    sunucubilgi: {
        basicInformation({
            guildId,
            createdTimestampWithSeconds,
            defaultMessageNotifications
        }) {
            return [
                `🆔 **ID of the server:** ${guildId}`,
                `📅 **Server installation date:** <t:${createdTimestampWithSeconds}:F> - <t:${createdTimestampWithSeconds}:R>`,
                `🔔 **Server default message notifications:** ${defaultMessageNotifications == GuildDefaultMessageNotifications.AllMessages ? "All messages 📬" : `Tags only ${EMOJIS.role}`}`
            ];
        },
        vanityData(data) {
            return `✉️ **Presenter's special invitation:** https://discord.gg/${data.code} - (${data.uses})`;
        },
        afkChannel({
            afkChannelId,
            afkTimeout
        }) {
            return `🔇 **AFK channel:** <#${afkChannelId}> (${afkTimeout})`;
        },
        rulesChannel(rulesChannelId) {
            return `${EMOJIS.rules} **Rules channel:** <#${rulesChannelId}>`;
        },
        owner(ownerId) {
            return `👑 **Owner of the server:** <@${ownerId}> - (${ownerId})`;
        },
        titles: {
            basicInformation: "BASIC INFORMATIONS",
            channels: "CHANNELS",
            members: "MEMBERS",
            status: "STATUS",
            emojis: "EMOJIES",
            boost: "BOOST INFORMATION",
            photos: "PHOTOS",
            roles: "ROLES"
        },
        statusCount: {
            online: "Online",
            idle: "Idle",
            dnd: "Do not disturb",
            offline: "Offline"
        },
        channelsCount: {
            text: "Text channel",
            voice: "Voice channel",
            category: "Category",
            others: "Other channels"
        },
        membersCount: {
            members: "Number of members",
            bots: "Number of bots"
        },
        emojisCount: {
            notanimated: "Number of not animated emojis",
            animated: "Number of animated emojis"
        },
        boost: {
            users: "Number of people pressing Boost",
            count: "Number of boosts pressed",
            level: "Boost level"
        },
        photos: {
            profile: "Profile photo",
            banner: "Banner",
            splash: "invitation background",
            discoverySplash: "Explore background"
        },
        moreRole: "more role..."
    },
    sunucutoplam: {
        top3Register: {
            author({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} **<@${userId}> ${Util.toHumanize(total || 0, language)} Number of registrations • ${Util.getUserRank(total, language) || "You have no rank"}**`
            },
            alisa({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} ${EMOJIS.alisa} <@${userId}> **${Util.toHumanize(total || 0, language)}** Number of my registrations **•** Bots have no rank :)`
            },
            user({
                userId,
                total,
                indexEmoji
            }) {
                return `• ${indexEmoji} <@${userId}> **${Util.toHumanize(total || 0, language)}** Number of registrations **•** ${Util.getUserRank(total, language) || "No rank"}`
            }
        },
        recorded: {
            title: "RECORDED"
        },
        registrationActivity: {
            title: "REGISTRATION ACTIVITY OF THE SERVER",
            last1Hour: "Last 1 hour",
            last1Day: "Last 1 day",
            last1Week: "Last 1 week",
            last1Month: "Last 1 month"
        },
        last5Records: "Last 5 records",
        top3RegisteredPeople: "Top 3 registered people"
    },
    şüpheli: {
        alreadySuspect: "Heyyy, wait there! This person has already been placed under suspicion",
        success({
            memberId,
            authorId
        }) {
            return `• ⛔ <@${memberId}> was posted to Suspect by <@${authorId}>!`
        }
    },
    şüphelizaman: {
        alreadyReset: "The time required for new users entering the server to be viewed as suspicious has been reset",
        successReset: "The time required for new users entering the server to be viewed as suspicious has been successfully reset",
        enter(prefix) {
            return `Please enter a time\n\n` +
                `**Example**\n` +
                `• ${prefix}suspicioustime 1 day 5 hours 6 minutes 30 seconds\n` +
                `• ${prefix}suspicioustime 3 weeks`
        },
        success(suspiciousTime) {
            return `From now on, people whose accounts are opened in **${suspiciousTime}** will be seen as suspicious`
        }
    },
    tag: {
        noTag: "There is no tag set on the server",
        tagNoSet(prefix) {
            return `• Tag is not set on the server. To set it, you can type **${prefix}settag** \`yourtag\``;
        }
    },
    tagayarla: {
        enter(prefix) {
            return `• To set the tag **${prefix}settag <Your tag>**\n\n` +
                `• To reset, you can type **${prefix}settag reset**`
        },
        alreadyReset: "The tag I will add to members has already been reset",
        successReset: "The tag I will add to members has been successfully reset",
        maxError(maxLength) {
            return `There are too many characters! Your tag must be less than **${maxLength}** characters!`
        },
        sameTag: "The server's tag is the same as the tag you wrote",
        success({
            tag,
            example
        }) {
            return `The tag I will add to the members' names has been successfully set to **${tag}**\n\n` +
                `**Example:**\n` +
                `${example}`
        }
    },
    tempjail: {
        jailRole: "jail role",
        already: "This person is already jailed",
        enterTime({
            prefix,
            memberId
        }) {
            return `Please enter a time\n\n` +
                `**Example**\n` +
                `• ${prefix}tempjail <@${memberId}> 1 day, 5 hours, 6 minutes and 30 seconds, rest your mind for a while\n` +
                `• ${prefix}tempjail <@${memberId}> 30 minutes`
        },
        jailed({
            memberId,
            reason,
            msToHumanize
        }) {
            return `${EMOJIS.yes} <@${memberId}> along **${msToHumanize}** sent to Jail for__**${reason || "Reason not stated"}**__!`
        },
        embed: {
            descriptionJailed({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason,
                jailOpenAt
            }) {
                return `**🔇 <@${memberId}> has been __temporarily Jailed**\n\n` +
                    `🧰 **AUTHORITY WHO TEMPJAILED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **JAILED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Given role:** <@&${jailRoleId}>\n` +
                    `**• Reason:** ${reason || "Reason not stated"}\n` +
                    `**• Date of taking the role of Jail:** <t:${jailOpenAt}:F> - <t:${jailOpenAt}:R>`
            },
            descriptionUnjailed({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId,
                reason,
                jailedAt
            }) {
                return `🧰 **AUTHORITY WHO TEMPJAILED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **UNJAILED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Role taken:** <@&${jailRoleId}>\n` +
                    `**• Reason:** ${reason || "Reason not stated"}\n` +
                    `**• Date he was put in jail:** <t:${jailedAt}:F> - <t:${jailedAt}:R>`
            }
        },
        successRemove(memberId) {
            return `• <@${memberId}>'s Jail role has been successfully removed!`
        },
        errorGiveRole({
            memberId,
            error
        }) {
            return `• An error occurred while jailbreaking <@${memberId}>!\n\n` +
                `**Hata:**\n` +
                `\`\`\`js\n` +
                `${error}\`\`\``
        }
    },
    test: {
        embedDescription: "• Checking data, please wait a moment...",
        registerOff: "• My recording setting is disabled, you cannot perform any recording operations!",
        notSet: {
            unregister: "• The role to be given to unregistered members is not set!",
            member: "• The role to be given to members is not set!",
            boy: "• The role to be given to boys is not set!",
            girl: "• The role to be given to girls is not set!",
            bot: "• The role to be given to bots is not set!",
            registerAuth: "• The authorized role that registers members is not set!",
            registerChannel: "• The channel for recording is not set!",
            afterRegisterChannel: "• The channel to send a message after registration is not set!",
            registerLogChannel: "• The channel for recording logs is not set!",
        },
        permission: {
            manageNicknames: "• I don't have permission to edit names",
            manageRoles: "• I don't have permission to edit roles",
            administrator: "• For the bot to work properly, make sure you give me administrator rights",
            registerChannel: "• I don't have permission to send messages to the recording channel",
            afterRegisterChannel: "• I don't have permission to send messages to the channel after registration",
            registerLogChannel: "• I don't have permission to send messages to the recording log channel",
        },
        rolesAreHigher(roleIds) {
            return `• Since the roles named [${roleIds}] are higher than my role, I cannot give these roles to others`
        },
        fieldsNames: {
            permissions: "🧰 AUTHORITY ERRORS",
            roles: `${EMOJIS.role} ROLE ERRORS`,
            channels: `${EMOJIS.channel} CHANNEL ERRORS`,
            recommend: "💬 RECOMMENDATIONS"
        },
        successEmbed: {
            title: `${EMOJIS.crazy} That's it!!!`,
            description: `The bot works perfectly on this server (just like you...), you can register with peace of mind!`,
            footer: "I love you <3"
        },
        failEmbed: {
            title: "Sounds like there's some work that needs to be done?",
            footer: "I love you <3"
        }
    },
    tümisimler: {
        noData: "The table can't be displayed because no records have been made on this server before",
        description({
            userId,
            length
        }) {
            return `**• A total of __${length}__ name histories for <@${userId}> were found**`
        }
    },
    unban: {
        enter(prefix) {
            return `• Please enter a valid ID\n\n` +
                `**Example:**\n` +
                `• ${prefix}unban 1234567890123456`
        },
        errorPull: "An error occurred while retrieving the server's ban list! Please try again later.",
        already: "The member you tagged has not already been banned from the server",
        success({
            userName,
            userId
        }) {
            return `${EMOJIS.yes} Successfully unbanned **${userName} - (${userId})**!`
        },
        embed: {
            description({
                userId,
                authorId,
                authorDisplayName,
                unbanAt,
                userDisplayName
            }) {
                return `**${EMOJIS.party} <@${userId}>'s ban has been removed**\n\n` +
                    `🧰 **AUTHORITY WHO RECEIVED THE BANNING**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Date of unban:** <t:${unbanAt}:F> - <t:${unbanAt}:R>\n\n` +
                    `👤 **UNBANNED MEMBER**\n` +
                    `**• Name:** <@${userId}> - ${userDisplayName}`
            }
        },
        error(error) {
            return "An error occurred while unbanning the member you wanted to unban :(\n\n" +
                "**Reason:**" +
                `• ${error}`
        }
    },
    unjail: {
        notJailed: "The person you tagged is not already in jail",
        unjailed(memberId) {
            return `${EMOJIS.yes} <@${memberId}> has been released from jail!`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                memberDisplayName,
                jailRoleId
            }) {
                return `**🔊 Member <@${memberId}> has been released from jail**\n\n` +
                    `🧰 **AUTHORITY WHO UNJAILED MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n\n` +
                    `👤 **UNJAILED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}\n` +
                    `**• Given role:** <@&${jailRoleId}>`
            }
        }
    },
    unmute: {
        already: "The person you tagged is not already muted",
        successUnmute(authorTag) {
            return `Unmuted: ${authorTag}`
        },
        successMsg(memberId) {
            return `${EMOJIS.yes} <@${memberId}> successfully unmuted from text and audio channels!`
        },
        embed: {
            description({
                memberId,
                authorId,
                authorDisplayName,
                unmuteAt,
                memberDisplayName
            }) {
                return `**🔊 Member <@${memberId}> has been unmuted**\n\n` +
                    `🧰 **AUTHORITY WHO UNMUTED THE MEMBER**\n` +
                    `**• Name:** <@${authorId}> - ${authorDisplayName}\n` +
                    `**• Mute date:** <t:${unmuteAt}:F> - <t:${unmuteAt}:R>\n\n` +
                    `👤 **MUTED MEMBER**\n` +
                    `**• Name:** <@${memberId}> - ${memberDisplayName}`
            }
        }
    },
    vip: {
        hasVipRole: "The person you tagged already has a VIP role",
        hasNoVipRole: "The person you tagged doesn't have a VIP role",
        successGive(memberId) {
            return `${EMOJIS.yes} <@${memberId}> successfully given the VIP role!`
        },
        successRemove(memberId) {
            return `${EMOJIS.yes} <@${memberId}> successfully removed the VIP role!`
        },
        infoMessage(prefix) {
            return `• To give a person the VIP role, type **${prefix}vip @person**\n` +
                `• To take the VIP role from a person, type **${prefix}vip take @person**\n` +
                `• To set the VIP role, type **${prefix}vip role @role**\n` +
                `• To set the VIP authorized role, type **${prefix}vip authorized @role**`
        }
    },
    yardım: {
        nothingSelected: "Nothing was selected...",
        commandNotFound: "Command not found",
        links: {
            myLinks: "My connections",
            inviteMe: "Invite me",
            voteMe: "Vote me",
            supportServer: "My support server"
        }
    },
    yaşsınır: {
        alreadyReset: "Age limit has already been reset",
        successReset: "Age limit successfully reset",
        enter(prefix) {
            return `• To set the age limit **${prefix}agelimit <age>**\n\n` +
                `• To close it, you can type **${prefix}agelimit close**\n\n` +
                `**Example**\n` +
                `• ${prefix}agelimit 14\n` +
                `• ${prefix}agelimit 9`
        },
        notValid: "Please keep your age range between 0-100",
        successSet(age) {
            return `The server's age limit has been successfully changed to **${age}**! I will not allow people under this age to be registered`
        }
    },
    yaşzorunlu: {
        optionName: "Age requirement",
        enter(prefix) {
            return `• To turn on age requirement setting, you can type **${prefix}agerequired on**\n\n` +
                `• To close it, you can type **${prefix}agerequired off**`
        }
    },
    yazdır: {
        enter: "Please write the message you want me to write\n\n**• Heyy, if you want me to quote a message, just __quote the message while using the command__. I left an image below, take a look at it:3**",
        success: "The message you want me to write has been successfully sent!",
    },
    yetkiler: {
        hasAllPermissions(userId) {
            return `• <@${userId}> has all permissions!`;
        },
        hasAllPermissionsRole(roleId) {
            return `• <@&${roleId}> has all permissions!`;
        },
        permissionsData: {
            CreateInstantInvite: "Create instant invite",
            KickMembers: "Kick members",
            BanMembers: "Ban members",
            ManageChannels: "Manage channels",
            ManageGuild: "Manage guild",
            ViewAuditLog: "View audit log",
            SendTTSMessages: "Send TTS messages",
            ManageMessages: "Manage messages",
            EmbedLinks: "Embed links",
            AttachFiles: "Attach files",
            ReadMessageHistory: "Read message history",
            MentionEveryone: "@everyone and @here",
            ViewGuildInsights: "View guild insights",
            MuteMembers: "Mute members",
            DeafenMembers: "Deafen members",
            MoveMembers: "Move members",
            ChangeNickname: "Change nickname",
            ManageNicknames: "Manage nicknames",
            ManageRoles: "Manage roles",
            ManageWebhooks: "Manage webhooks",
            ManageEmojisAndStickers: "Manage emojis and stickers",
            ManageEvents: "Manage events",
            ManageThreads: "Manage threads",
            CreatePublicThreads: "Create public threads",
            ModerateMembers: "Moderate members",
        },
        titles: {
            guildPermissions: "GUILD PERMISSIONS",
            channelPermissions: "CHANNEL PERMISSIONS",
            memberPermissions: "MEMBER PERMISSIONS"
        }
    },
    yetkili: {
        authorized: "Authorized",
        noMember: "There is no member with the authorized role",
        allAuthorized: "All authorized",
        allAuthorizedRoles: "All authorized roles",
        notifNoGone: "*• **Roles and members** above __did not receive__ notification*",
        nooneHasRole: "Wellyy.. No one has the authorized role",
        enterFull(prefix) {
            return `• To set the authorized roles **${prefix}auth set**\n` +
                `• To reset the authorized roles **${prefix}auth reset**\n` +
                `• To tag all authorized members **${prefix}auth tag**\n` +
                `• To view all authorized members without tagging **${prefix}auth view**\n` +
                `• To see the authorized role **${prefix}auth role**`
        }
    },
    yetkilibilgi: {
        botError: "You're not really thinking about checking the bot's registration count, are you?",
        rankMessages: {
            author: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **The role(s) you gave:** ${registerInfo.roles}\n` +
                        `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **Your server rank:** ${usersGuildRank == 0 ?
                        `You have no ranking` :
                        `${usersGuildRank}`
                        } *(from ${fromPeople} person)*`
                },
                rank(totalCount) {
                    return `🔰 **Rank:** ${Util.getUserRank(totalCount) || "You have no rank"}`
                },
                registers: {
                    all: "People you registered",
                    info({
                        registerType,
                        memberCount,
                        boyCount,
                        girlCount,
                        botCount
                    }) {
                        return `**${registerType == "member" ?
                            `${EMOJIS.member} Member:** ${memberCount}` :
                            (`${EMOJIS.boy} Male:** ${boyCount}\n` +
                                `**${EMOJIS.girl} Girl:** ${girlCount}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${botCount}`;
                    },
                    activity: "Your registration activity",
                    first: "The first person you registered",
                    last: "The last person you saved",
                    lastRegisters: "Your last 5 registers"
                },
                footer: "I love you <3"
            },
            alisa: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **The role(s) I give:** ${registerInfo.roles}\n` +
                        `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **My server rank:** ${usersGuildRank == 0 ?
                        `I don't have a ranking` :
                        `${usersGuildRank}`
                        } *(from ${fromPeople} person)*`
                },
                rank() {
                    return `🔰 **My rank:** Bots have no rank :)`
                },
                registers: {
                    all: "People I registered",
                    info({
                        botCount
                    }) {
                        return `**${EMOJIS.bot} Bot:** ${botCount}`
                    },
                    activity: "My registration activity",
                    first: "The first person I registered",
                    last: "The last person I registered",
                    lastRegisters: "My last 5 registers"
                },
                footer: "I'm glad to have you <3"
            },
            user: {
                firstAndLastRegister(registerInfo) {
                    return `👤 **Registered person:** <@${registerInfo.memberId}>\n` +
                        `${EMOJIS.role} **The role(s) you gave:** ${registerInfo.roles}\n` +
                        `⏲️ **Date:** <t:${Math.round(registerInfo.timestamp)}:F>`
                },
                guildRank({
                    usersGuildRank,
                    fromPeople
                }) {
                    return `\n📈 **Server rank:** ${usersGuildRank == 0 ?
                        `No ranking` :
                        `${usersGuildRank}`
                        } *(from ${fromPeople} person)*`
                },
                rank(totalCount) {
                    return `🔰 **Rank:** ${Util.getUserRank(totalCount) || "No rank"}`
                },
                registers: {
                    all: "People he/she registered",
                    info({
                        registerType,
                        memberCount,
                        boyCount,
                        girlCount,
                        botCount
                    }) {
                        return `**${registerType == "member" ?
                            `${EMOJIS.member} Member:** ${memberCount}` :
                            (`${EMOJIS.boy} Male:** ${boyCount}\n` +
                                `**${EMOJIS.girl} Girl:** ${girlCount}`)
                            }\n` +
                            `**${EMOJIS.bot} Bot:** ${botCount}`;
                    },
                    activity: "Registration activity",
                    first: "The first person he/she registered",
                    last: "The last person he/she registered",
                    lastRegisters: "Last 5 registers"
                },
                footer: "I love you <3"
            },
            last: {
                onehour: "Last 1 hour",
                oneday: "Last 1 day",
                oneweek: "Last 1 week",
                onemonth: "Last 1 month"
            }
        }
    },
    yetkilietiket: {
        optionName: "Mention the registration authority",
        enter(prefix) {
            return `• To turn on the mention registration authority setting, you can type **${prefix}mentionauth on**\n\n` +
                `• To close it, you can type **${prefix}mentionauth off**`
        }
    },
    zengin: {
        owner: "I can't change the name of the server owner :(",
        higherRole: "I can't change your name because your role's rank is higher than my role's rank",
        enter: "Please write your new name",
        longName: "Server name can't exceed 32 characters! Please reduce the number of characters nad try again",
        success(name) {
            return `• Your server name has been successfully changed to **${name}**`
        }
    },
};

module.exports = allMessages;