const Util = require("../Util.js");
const Time = require("../Time");

/**
 * 
 * @param {"tr" | "en"} language 
 * @returns 
 */
module.exports = function (language) {

    function duration(time) {
        return Time.duration(time, language, { dateStyle: "short" });
    }

    return {
        tr: {
            botError: "Gerçekten botların istatistiklerine bakmayı düşünmedin değil mi?",
            message: "Mesaj",
            descriptions: {
                allChannels: `**• Bütün kanalların istatistikleri**`,
                all(messageCount, duration) {
                    return `**• Bütün kanalların istatistikleri\n` +
                        `• Toplamda ${messageCount} mesaj atılmış ve ${duration} seste durulmuş**`
                },
                textChannel(channelId, messageCount) {
                    return `**• <#${channelId}> adlı kanalın bilgileri\n` +
                        `• Kanala toplamda mesaj ${messageCount} mesaj atılmış**`
                },
                voiceChannel(channelId, duration) {
                    return `**• <#${channelId}> adlı kanalın bilgileri\n` +
                        `• Kanalda toplamda ${duration} seste durulmuş**`
                },
                me(authorId) {
                    return `• <@${authorId}> adlı üyenin mesaj ve ses bilgileri`
                },
                allMembers: `**• Kullanıcıların istatistikleri!**`,
                allTextChannels(messageCount) {
                    return `**• Bütün yazı kanallarının istatistikleri!\n` +
                        `• Toplamda ${messageCount} mesaj atılmış**`
                },
                allVoiceChannels(duration) {
                    return `**• Bütün ses kanallarının istatistikleri!\n` +
                        `• Toplamda ${duration} seste durulmuş**`
                },
            },
            field: {
                names: {
                    message: "📝 Mesaj",
                    voice: "🔊 Ses",
                    messageStats: "📝 Mesaj İstatistikleri",
                    voiceStats: "🔊 Ses İstatistikleri",
                    topMessageMember(memberCount) {
                        return `📈 Top ${memberCount} üye`
                    },
                    topVoiceMember(memberCount) {
                        return `📈 Top ${memberCount} üye`
                    },
                    topMessageMemberExtra(memberCount) {
                        return `📈📝 Top ${memberCount} üye - Mesaj`
                    },
                    topVoiceMemberExtra(memberCount) {
                        return `📈🔊 Top ${memberCount} üye - Ses`
                    },
                    topMessageChannel(memberCount) {
                        return `📝 Top ${memberCount} kanal - Mesaj`
                    },
                    topVoiceChannel(memberCount) {
                        return `🔊 Top ${memberCount} kanal - Ses`
                    },
                },
                values: {
                    messageSent(messageCount) {
                        return `**• Atılan toplam mesaj:** ${messageCount} mesaj`
                    },
                    voiceTime(duration) {
                        return `**• Seslerde durulan toplam süre:** ${duration}`
                    },
                    allMessages(lastMessagesObject) {
                        return `📄 **Mesajlar**\n` +
                            `• __1 saat:__  **${Util.toHumanize(lastMessagesObject.hour)} mesaj**\n` +
                            `• __12 saat:__  **${Util.toHumanize(lastMessagesObject.hour12)} mesaj**\n` +
                            `• __24 saat:__  **${Util.toHumanize(lastMessagesObject.day)} mesaj**\n` +
                            `• __1 hafta:__  **${Util.toHumanize(lastMessagesObject.week)} mesaj**\n` +
                            `• __30 gün:__  **${Util.toHumanize(lastMessagesObject.month)} mesaj**`
                    },
                    allVoice(lastVoiceObject) {
                        return `🗣️ **Ses**\n` +
                            `• __1 saat:__  **${duration(lastVoiceObject.hour)}**\n` +
                            `• __12 saat:__  **${duration(lastVoiceObject.hour12)}**\n` +
                            `• __24 saat:__  **${duration(lastVoiceObject.day)}**\n` +
                            `• __1 hafta:__  **${duration(lastVoiceObject.week)}**\n` +
                            `• __30 gün:__  **${duration(lastVoiceObject.month)}**`
                    },
                    meMessage(messageCount) {
                        return `**• Toplamda ${messageCount} mesaj atmış**\n\n`
                    },
                    meVoice(duration) {
                        return `**• Toplamda ${duration} seste durulmuş**\n\n`
                    }
                }
            },
        },
        en: {
            botError: "You didn't really think about looking at the statistics of the bots, did you?",
            message: "Message",
            descriptions: {
                allChannels: `**• Statistics of all channels**`,
                all(messageCount, duration) {
                    return `**• Statistics of all channels\n` +
                        `• A total of ${messageCount} messages were sent and ${duration} time was spent in the voice**`
                },
                textChannel(channelId, messageCount) {
                    return `**• Information about the channel <#${channelId}>\n` +
                        `• Total messages sent to the channel: ${messageCount} messages**`
                },
                voiceChannel(channelId, duration) {
                    return `**• Information about the channel <#${channelId}>\n` +
                        `• Total time spent in the channel: ${duration}**`
                },
                me(authorId) {
                    return `• Message and voice information of the member <@${authorId}>`
                },
                allMembers: `**• User statistics!**`,
                allTextChannels(messageCount) {
                    return `**• Statistics of all text channels!\n` +
                        `• Total messages sent: ${messageCount} messages**`
                },
                allVoiceChannels(duration) {
                    return `**• Statistics of all voice channels!\n` +
                        `• Total time spent in the voice channels: ${duration}**`
                },
            },
            field: {
                names: {
                    message: "📝 Message",
                    voice: "🔊 Voice",
                    messageStats: "📝 Message Statistics",
                    voiceStats: "🔊 Voice Statistics",
                    topMessageMember(memberCount) {
                        return `📈 Top ${memberCount} members`
                    },
                    topVoiceMember(memberCount) {
                        return `📈 Top ${memberCount} members`
                    },
                    topMessageMemberExtra(memberCount) {
                        return `📈📝 Top ${memberCount} members - Message`
                    },
                    topVoiceMemberExtra(memberCount) {
                        return `📈🔊 Top ${memberCount} members - Voice`
                    },
                    topMessageChannel(memberCount) {
                        return `📝 Top ${memberCount} channels - Message`
                    },
                    topVoiceChannel(memberCount) {
                        return `🔊 Top ${memberCount} channels - Voice`
                    },
                },
                values: {
                    messageSent(messageCount) {
                        return `**• Total messages sent:** ${messageCount} messages`
                    },
                    voiceTime(duration) {
                        return `**• Total time spent in the voice channels:** ${duration}`
                    },
                    allMessages(lastMessagesObject) {
                        return `📄 **Messages**\n` +
                            `• __1 hour:__  **${Util.toHumanize(lastMessagesObject.hour)} messages**\n` +
                            `• __12 hours:__  **${Util.toHumanize(lastMessagesObject.hour12)} messages**\n` +
                            `• __24 hours:__  **${Util.toHumanize(lastMessagesObject.day)} messages**\n` +
                            `• __1 week:__  **${Util.toHumanize(lastMessagesObject.week)} messages**\n` +
                            `• __30 days:__  **${Util.toHumanize(lastMessagesObject.month)} messages**`
                    },
                    allVoice(lastVoiceObject) {
                        return `🗣️ **Voice**\n` +
                            `• __1 hour:__  **${duration(lastVoiceObject.hour)}**\n` +
                            `• __12 hours:__  **${duration(lastVoiceObject.hour12)}**\n` +
                            `• __24 hours:__  **${duration(lastVoiceObject.day)}**\n` +
                            `• __1 week:__  **${duration(lastVoiceObject.week)}**\n` +
                            `• __30 days:__  **${duration(lastVoiceObject.month)}**`
                    },
                    meMessage(messageCount) {
                        return `**• Total messages sent: ${messageCount}**\n\n`
                    },
                    meVoice(duration) {
                        return `**• Total time spent in the voice channels: ${duration}**\n\n`
                    }
                }
            },
        }
    }[language]
}