const afterRegisterMessages = [
    "<m> joined us",
    "Everybody greet <m>",
    "<m> came down from the skies",
    "<m> has been added to chat",
    "<m>say hello to everyone",
    "<m> don't be shy, say hello to your friends",
    "<m> well, you brought pizza, right?",
    "<m> came to our server from distant lands",
    "<m> stepped into the chat",
    "<m> you've taken one small step for humanity, one giant leap for the server",
    "<m> you came so beautiful that I had to wear sunglasses",
    "<m> you shine like the sun...",
    "Is this sweetness genetic <m>?",
    "There you are, <m> *tatatataaamm*",
    "Where's the pizza? <m> Don't say you forgot",
    "Pizza pizza pizza <m>",
    "You can't enter if you don't have pizza <m>",
    "I'll eat you <m>",
    "What's up <m>?",
    "You are like sweetness incarnate <m>",
    "Your friends were also waiting for you <m>",
    "No, no, I'm fine <m> It's just that your sweetness caught my eyes",
    "Oh, has someone joined us? Oh, is he/she here? <m> welcome",
    "Pizza or hamburger <m>?",
    "What would the pizza be like <m>?",
    "Did everyone bring their pizza? You brought it, right <m>?",
    "Since <m> has arrived, let the party begin",
    "I always waited for you to come <m>",
    "Get your pizza and come quickly <m>",
    "We were just talking about you <m>",
    "If the universe is infinite, how do we know it is infinite <m>?",
    "<m> this server wouldn't exist without you :)",
    "<m> I said there was a party and he/she came right away",
    "<m> After much research, I decided that it is very sweet",
    "<m> If the brain kno... just kidding, welcome",
    "<m> ||you are so sweet|| confidential information delete immediately",
    "<m> I dreamed of you coming here every night before I went to sleep",
    "Erm... <m> can I taste your cheeks? 👉👈",
    "<m> quickly say hello to everyone 🔫",
    "<m> ||I|| ||l||||o||||v||||e|| ||y||||o||||u|| :)",
    "<m> don't you ever get tired carrying this sweetness?",
    "<m> will the one who leaves lose or the one who stays...",
    "Sen <m> do you know Turkish?",
    "<m> What did you say, dear?",
    "<m>do you love him?",
    "<m> ||y||||o||||u|| ||a||||r||||e|| ||v||||e||||r||||y|| ||c||||u||||t||||e|| <3",
    "Friends, there is such a stranger among us, what should we do?",
    "<m> how are you you stupid thing :)",
    "<m> we don't need to fight, I lose anyway when you laugh...",
    "<m> The longest dream in the world was 16 seconds. I guess they didn't see you",
    "<m> If you could hear what they said behind your back, abooo",
    "<m> they call you beauty, is it true?",
    "<m> don't let anyone hear that you are inside me",
    "<m> do you like daisies?",
    "<m> do you know that I have feelings too and I can love you :)",
    "<m> Talking to you is the second thing I want most. The first one is you *kipss*",
    "<m> oh your beautiful eyes, they make my head spin...",
    "Everyone take your pizza <m> is here",
    "<m> Is there a party without pizza? Take the pizzas",
    "<m> pizza <3 me",
    "<m> I keep your heart ❤️ so you don't give it to anyone else",
    "Ayyayayayayaya<m> it's time, get out of the way",
    "It's an honor to welcome you here<m>",
    "<m> Is it you who seduces me?",
    "<m> it's here, where is the red carpet!?",
    "<m> our eyes are on the road",
    "<m>, you must be a magician because you just disappeared all my worries!",
    "<m>, oh look, our server just leveled up thanks to you!",
    "<m>, you didn’t forget to bring your sense of humor, right?",
    "<m>, the server’s vibe just got a thousand times better!",
    "<m>, you have that \"main character\" energy, don’t you?",
    "<m>, someone call NASA, a star just landed in our server!",
    "<m>, did it hurt when you fell from the meme heavens?",
    "<m>, quick, what’s the secret ingredient for being this cool?",
    "<m>, wait, is this the VIP section? Oh, it’s you!",
    "<m>, careful! Your awesomeness might crash the server!",
    "<m>, you’re the life of the party, aren’t you?",
    "<m>, you’re the reason why the server’s so lively right now!",
    "<m>, you’re the definition of **effortlessly awesome**",
];
const {
    discordInviteLink,
    EMOJIS
} = require("../../../../settings.json");
const Time = require("../../../Time");

function msToSecond(ms) {
    return Math.round(ms / 1000);
}

function getOrdinalNumber(num) {
    const lastDigit = num % 10; // Son basamağı al
    const lastTwoDigits = num % 100; // Son iki basamağı al (11-13 kontrolü için)

    if ([11, 12, 13].includes(lastTwoDigits)) {
        return `${num}th`; // Özel istisnalar
    }

    switch (lastDigit) {
        case 1: return `${num}st`;
        case 2: return `${num}nd`;
        case 3: return `${num}rd`;
        default: return `${num}th`;
    }
}

// Dil
const language = "en";

const allMessages = {
    // Sunucudaki roller ve kanallar kontrol edilirken gösterilecek mesajlar
    rolesAndChannels: {
        unregister: "Unregistered role",
        registerAuth: "Authority role",
        boy: {
            all: "All boy roles",
            some: "Some of the boy roles",
            single: "Boy role"
        },
        girl: {
            all: "All girl roles",
            some: "Some of the girl roles",
            single: "Girl role"
        },
        member: {
            all: "All member roles",
            some: "Some of the member roles",
            single: "Member role"
        },
        bot: {
            all: "All bot roles",
            some: "Some of the bot roles",
            single: "Bot role"
        },
        registerAuth: {
            all: "All authorized roles",
            some: "Some of the authorized roles",
            single: "Authorized role"
        },
        partner: "Partner role",
        suspicious: "Suspicious role",
        registerChannel: "Registration channel",
        afterRegisterChannel: "After registration channel",
        registerLogChannel: "Register log channel",
        moderationLogChannel: "Moderation log channel",
        voice: "Voice channel",
        jailRole: "Jail role",
        jailAuthRole: "Jail authorized role",
        jailLogChannel: "Jail log channel",
        vipRole: "Vip role",
        vipAuthRole: "Vip authorized role",
        muteAuthRole: "Mute authorized role",
        banAuthRole: "Ban authorized role",
        kickAuthRole: "Kick authorized role",
        thRankRole(rankCount) {
            return `Rank role with ${getOrdinalNumber(rankCount)} record count`
        },
        embed: {
            title: "Information",
            channelDescription({
                guildName,
                guildId,
                informationMessage,
                channelName
            }) {
                return `• The channel named **#${channelName}**, which is __${informationMessage}__ on server **${guildName} - (${guildId})**, has been deleted. Please set another channel`
            },
            roleDescription({
                guildName,
                guildId,
                informationMessage,
                roleName
            }) {
                return `• The role **@${roleName}** from server **${guildName} - (${guildId})** __${informationMessage}__ has been deleted. Please set another role`
            },
            roleAndChannelDescription({
                guildName,
                guildId,
                informationMessage,
            }) {
                return `• The previously registered __${informationMessage}__ on server **${guildName} - (${guildId})** has been deleted. Please set another role or channel`
            },
        }
    },

    // Kayıt sonrası mesajlarda yazılacak bütün yazıları gösterir
    afterRegister: {
        boy: [
            ...afterRegisterMessages,
            `You are as charismatic as they say <m>`,
            `<m> A handsome man has joined us`,
            'You are like charisma incarnate <m>',
            'When I say man, you come to mind <m>',
            "No, no, I'm fine <m> It's just that your handsomeness caught my eyes",
            '<m> After much research, I decided that he is very handsome',
            `<m> excuse me, did I come to the charisma hall?`,
            `<m> Excuse me sir, have you ever thought of participating in a handsomeness contest?`,
            `<m> Don't you ever get tired while carrying this handsome man?`,
            `<m> sir, with your permission, I will walk to you`,
            `<m> They call you handsome, is it true?`,
            "<m>, you’ve got that \"leading man\" glow, how do you do it?",
            "<m>, did someone order a boatload of charm? Oh, it’s you!",
            "<m>, your presence just broke the cool meter!",
            "<m>, you’re the definition of **effortlessly handsome**"
        ],
        girl: [
            ...afterRegisterMessages,
            '<m> What is this beauty that catches my eye?',
            'You are like beauty incarnate <m>',
            'When I say beauty, you come to mind <m>',
            "No, no, I'm fine <m> It's just that your beauty caught my eyes",
            '<m> After much research, I decided that it is very beautiful',
            `<m> excuse me, did I come to the beauty salon?`,
            `<m> Excuse me, ma'am, have you ever thought of participating in a beauty contest?`,
            `<m> Don't you ever get tired while carrying this beauty?`,
            `<m> Madam, with your permission, I will walk to you`,
            "Well <m> I have a request from you. Will you trample my foot at the wedding table?",
            "<m>, the server just turned into a fairytale castle!",
            "<m>, how do you even manage to be this enchanting?",
            "<m>, if kindness were a person, it’d be you!",
            "<m>, you just raised the elegance level of this server by 100%!",
            "<m>, you're the definition of **effortlessly beautiful**"
        ],
        member: afterRegisterMessages
    },

    // Eventlerde kullanılacak mesajlar
    events: {
        ready: {
            premiumFinised(guildName) {
                return `• Heyy it seems like the premium of the ${guildName} server has expired :(\n\n` +
                    `• If you are satisfied with the premium or want to buy it again, you can come to my support server!!\n\n` +
                    `• ${discordInviteLink}`
            }
        },

        messageOrInteractionCreate: {
            afk: {
                authorIsBack(authorId, startedTimestamp) {
                    return `• <@${authorId}>, is back! Not AFK anymore! You were AFK for exactly **${Time.duration(Date.now() - startedTimestamp, language)}**`
                },
                memberIsAfk(userId, afkData) {
                    return `‼️ Hey hey heyyy, <@${userId}> is AFK for **${afkData.reason || "No reason stated"}**! • <t:${msToSecond(afkData.timestamp)}:R>`
                }
            },
            thankYouMessage: {
                title: "Thank you",
                description({
                    prefix,
                    clientId,
                    joinedTimestamp
                }) {
                    return `• Thank you for using me on this server since **<t:${joinedTimestamp}:F>**\n` +
                        `• My language on this server is **English 🇬🇧**\n` +
                        `• My prefix on this server is **${prefix}** or <@${clientId}>\n` +
                        `• You can access the help menu by typing **${prefix}help** or **<@${clientId}>help**\n` +
                        `• If you need help, you can write **${prefix}support**`
                },
                footer: "I'm glad to have you <3",
                buttons: {
                    inviteMe: "Invite me",
                    supportGuild: "My support server",
                    voteMe: "Vote me"
                }
            },
            warnedFromBot(reason, isLastWarn) {
                return `• You have been warned by the bot for violating __some__ rules of the bot :(\n` +
                    (isLastWarn ?
                        `• After this **last warning** your access to the bot's commands will be revoked\n` :
                        `• If you continue to violate the rules, you will be banned from the bot\n`) +
                    `**• The reason you got warned from the bot:** __${reason}__`
            },
            tempBannedFromBot(reason, time) {
                return `• You have been temporarily banned from the bot for violating __some__ rules of the bot :(\n` +
                    `• You will not be able to access any commands of the bot for **${Time.duration(time, language)}**\n` +
                    `**• The reason you got temporarily banned from the bot:** __${reason}__\n` +
                    `**• If you think we made a mistake, you can come to the bot's support server and ask why it got banned**\n` +
                    `• ${discordInviteLink}`
            },
            bannedFromBot(reason) {
                return `• Sorry, you have been denied access to the bot's commands by violating __some__ rules of the bot :(\n` +
                    `• From now on you will not be able to access any commands of the bot\n` +
                    `**• The reason you got banned from the bot:** __${reason}__\n` +
                    `**• If you think we made a mistake, you can come to the bot's support server and ask why it got banned**\n` +
                    `• ${discordInviteLink}`
            },
            embedLinkError: "‼️ Warning! In order to use the bot, the bot must first have 'Embed link' permission",
            care: "🛠️ This command is currently in maintenance mode, please try again later",
            premium(prefix) {
                return `${EMOJIS.premiumCommands} This command is only for premium users. If you want to buy premium, you can write **${prefix}premium**`
            },
            waitCommand(ms) {
                return `⏰ You must wait ** ${(ms / 1000).toFixed(1)} seconds ** to use this command`
            },
            waitChannel: "❗ This channel is very challenging for me, please use my commands a little slower :(",
            errorEmbed: {
                errorTitle: "Error",
                memberPermissionError(permission) {
                    return `• You must have **${permission}** to use this command, you stupid thing`
                },
                botPermissionError(permission) {
                    return `• You stupid thing that __I have __ **${permission}** to use this command`
                },
                warn: "Missing command",
                success: "Successful"
            },
            commandError(authorId) {
                return `**‼️ <@${authorId}> An error occurred in the command! Please try again later!**`
            },
            commandErrorOwner(errorStack) {
                return `**‼️ An error occurred in the command!\n\n` +
                errorStack
                    ?.split?.("\n")
                    ?.map?.(line => `• ${line}`)
                    ?.join?.("\n")
                    ?.split?.("Alisa") + "**";
            }
        },

        guildMemberAdd: {
            permissionsErrors: {
                manageRoles: `• I do not have **Manage Roles** authority!`,
                manageNicknames: `• I do not have **Manage Nicknames** authority!`,
                suspiciousRole(roleId) {
                    return `• The rank of the suspicious role <@&${roleId}> is higher than the rank of my role!`
                },
                errorGivingSuspiciousRole(memberId, roleId) {
                    return `• An error occurred when assigning the suspicious role <@&${roleId}> to <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                },
                unregisterRole(roleId) {
                    return `• The rank of the unregistered role <@&${roleId}> is higher than the rank of my role!`
                },
                errorGivingUnregisterRole(memberId, roleId) {
                    return `• An error occurred when assigning the unregistered role <@&${roleId}> to <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                },
                memberAboveFromMe(memberId) {
                    return `• <@${memberId}>'s role rank is higher than my role rank!`
                },
                errorGivingRole(memberId) {
                    return `• An error occurred while editing the roles and name of <@${memberId}>! Please make sure that I am given **Administrator** authority and that you are at the top of my role`
                }
            },
            errorEmbed: {
                errorTitle: "Error",
                reasons: "REASONS",
                information: "Information"
            },
            buttonLabels: {
                member: "Register as a member",
                boy: "Register as male",
                girl: "Register as a girl",
                bot: "Register as bot",
                again: "Re-register",
                suspicious: "Kick suspicious"
            },
            roleNotSetted: "__**ROLE IS NOT SET**__",
            welcomeEmbed: {
                member: {
                    again: "Welcome Back",
                    welcome: "Welcome",
                    embed: {
                        description({
                            guildName,
                            toHumanize,
                            createdTimestampSecond,
                            security
                        }) {
                            return `**${EMOJIS.crazy} Welcome to our server named \`${guildName}\`!!\n\n` +
                                `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                                `${EMOJIS.drink} Authorities will register you shortly. Please have some patience\n\n` +
                                `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                                `> Account ${security}**`
                        },
                        footer: "How are you"
                    }
                },
                bot: {
                    welcome: {
                        welcome: "Welcome Bot",
                        embed: {
                            description({
                                guildName,
                                toHumanize,
                                createdTimestampSecond,
                            }) {
                                return `**${EMOJIS.crazy} \`${guildName}\` Welcome to our server, bot!!\n\n` +
                                    `${EMOJIS.woah} With you, we become exactly ${toHumanize} person\n\n` +
                                    `${EMOJIS.kiss} I hope you can be a good help to the server, I love you\n\n` +
                                    `> Your account was created on <t:${createdTimestampSecond}:F>\n` +
                                    `> Account Bot ${EMOJIS.bot}**`
                            }
                        }
                    },
                }
            },
            security: {
                unsafe: "Unsafe",
                suspicious: "Suspicious",
                safe: "Safe",
                openAt(createdTimestamp) {
                    return `the person's account was opened in **${Time.duration(createdTimestamp, language, { toNow: true })}**`
                },
                accountIs(security) {
                    return `because the person is **${security}**`
                }
            },
            suspicious: {
                kickMember(memberId, message) {
                    return `• Kicked to Suspect for ${message} named <@${memberId}>!`
                },
                noRole(memberId) {
                    return `• <@${memberId}>'s account is suspicious, but since no __suspicious role__ is set on this server, I couldn't assign him as suspect!`
                }
            }
        },

        guildCreate: {
            description({
                guildName,
                prefix
            }) {
                return `• Thank you for adding me to your server **${guildName}** <3 you can be sure that I will never let you down\n\n` +
                    `*• Bu arada botu **Türkçe** dilinde kullanmak istiyorsanız **${prefix}lang tr** yazabilirsiniz!*\n\n` +
                    `• Now, to briefly talk about myself, I am just one of the bots that should be on every public server. I have many features and systems inside\n\n` +
                    `**__Here are a few of my features__**\n` +
                    ` ├> Button registration system\n` +
                    ` ├> Advanced customized login message\n` +
                    ` ├> Ability to customize the name to be edited when registering as you wish\n` +
                    ` ├> Advanced last save and Jail system\n` +
                    ` ├> Make the bot enter the voice channel you want and welcome the members\n` +
                    ` ├> There are many different features such as the ship command, the command to write the text you want to the bot, the auto-reply command\n` +
                    ` └> Reset everything anytime and much more!\n\n` +
                    `• Thanks to the new premium system, many new commands specific to premiums have been added! If you want to get more information about Premium, you can write **${prefix}pre**\n\n` +
                    `*• 5x faster than other bots!*\n\n` +
                    `• If you have any problems, you can get help by typing **${prefix}support** or coming to my [Support Server](${discordInviteLink})!\n\n` +
                    `**YOUR BOT, YOUR RULES**`
            },
            footer: "Pst pst I love you <3"
        }
    },

    // Mesaj beklemeli mesajlarda gözükecek bütün mesajlar
    wait: {
        register: `Since the bot has been restarted, the **Register user** command you used before has been started again\n\n` +
            `• Please **only** enter the user's name`,
        chaneName: `Since the bot has been restarted, the **Change the user's name** command you used before has been started again\n\n` +
            `• Please **only** enter the user's name`
    },

    // Yardım komutunda gösterilecek emojileri ve açıklamalar
    helpCommandHelper: {
        "All commands": {
            emoji: EMOJIS.allCommands,
            description: "Shows all commands"
        },
        "Bot commands": {
            emoji: EMOJIS.botCommands,
            description: "Shows bot commands"
        },
        "Information commands": {
            emoji: EMOJIS.informationCommands,
            description: "Shows information commands"
        },
        "Statistics commands": {
            emoji: EMOJIS.statCommands,
            description: "Shows stat commands"
        },
        "Register commands": {
            emoji: EMOJIS.registerCommands,
            description: "Shows recording commands"
        },
        "Moderation commands": {
            emoji: EMOJIS.moderationCommands,
            description: "Shows moderation commands"
        },
        "Authorized commands": {
            emoji: EMOJIS.authorizedCommands,
            description: "Shows authorized commands"
        },
        "Jail commands": {
            emoji: EMOJIS.jailCommands,
            description: "Shows jail commands"
        },
        "Premium commands": {
            emoji: EMOJIS.premiumCommands,
            description: "Shows premium commands"
        },
        "Fun commands": {
            emoji: EMOJIS.funCommands,
            description: "Shows fun commands"
        },
        "Owner commands": {
            emoji: "👑",
            description: "Shows owner commands"
        }
    },

    yerOrNoButtons: {
        yes: "Yes",
        no: "No"
    },
    embedFooters: {
        register: "Alisa Registration system",
        log: "Alisa Log system",
    },
    roleNames: {
        role: "Role",
        boy: "Boy",
        girl: "Girl",
        member: "Member",
        bot: "Bot",
        jail: "Jail",
        auth: "Authority",
        vip: "VIP",
        suspicious: "Suspicious",
        registerAuth: "Registrar",
        banAuth: "Ban authority",
        kickAuth: "Kick authority",
        muteAuth: "Mute authority",
        jailAuth: "Jail authority",
        vipAuth: "VIP authority",
        unregister: "Unregistered",
    },
    channelNames: {
        register: "Register",
        afterRegister: "After registration",
        registerLog: "Register Log",
        moderationLog: "Moderation Log",
        jailLog: "Jail Log",
        voice: "Voice",
    },
    commandHelpers: {
        set: "set",
        authorized: "authorized",
        role: "role",
        remove: "remove",
    },
    commandNames: {
        suspiciousRole: "suspiciousrole",
        unregisterRole: "unregisterrole",
        jailRole: "jailrole",
    },

    nothingThere: "• There is nothing to show here...",
    somethingWentWrong: "• Something went wrong...",
    waitThere: "Heyyy, wait there!",
    noMessage: "• You did not send any message or the content of the message is empty, so the process has been canceled",
    timeIsUp(authorId) {
        return `⏰ <@${authorId}>, your time is up!`
    },
    and: "and",
    allCommands: "All commands",
};

module.exports = allMessages;