"use strict";
const {
    VoiceState,
    Events
} = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../Helpers/Util.js");
const database = require("../../Helpers/Database.js");

module.exports = {
    name: Events.VoiceStateUpdate,
    /**
     * 
     * @param {VoiceState} oldVoice 
     * @param {VoiceState} newVoice 
     */
    async execute(oldVoice, newVoice) {
        try {

            // Eğer seste değişiklik yapan bir botsa
            if (newVoice.member.user.bot) {

                // Eğer bu bot Alisa ise ve sesten çıkmışsa
                if (newVoice.member.user.id == newVoice.client.user.id && !newVoice.channelId) {

                    // 1 saniye gecikmeli bir şekilde çalıştır
                    setTimeout(async () => {

                        const guildId = newVoice.guild.id;
                        const guildDatabase = await database.getGuild(guildId);

                        // Eğer bir hata oluştu da sesten çıkmışsa sese giriş yap
                        if (guildDatabase.channelIds.voice && oldVoice.channelId == guildDatabase.channelIds.voice) {
                            DiscordVoice.joinVoiceChannel({
                                channelId: guildDatabase.channelIds.voice,
                                guildId,
                                adapterCreator: newVoice.guild.voiceAdapterCreator,
                                selfDeaf: true,
                                selfMute: true
                            });
                        }

                    }, 1 * 1000);
                }

                return;
            }
            // Eğer ses kanalını değiştirmişse Database'ye kaydet
            else if (oldVoice.channelId != newVoice.channelId) {
                const memberId = newVoice.member.id;
                const guildId = newVoice.guild.id;

                const guildDatabase = await database.getGuild(guildId);

                // Eğer stat ayarı kapalıysa
                if (!guildDatabase.isStatOn) return;

                let memberData = guildDatabase.stats[memberId];
                let isNewUser = false;

                if (!memberData) {
                    memberData = guildDatabase.stats[memberId] = Util.DEFAULTS.memberStat;
                    isNewUser = true;
                }
                
                const NOW_TIME = Date.now();

                const setObject = {};
                const pushObject = {};

                // Eğer ses kanalına giriş yapmışsa (Yani önceki ses kanalı yoksa)
                if (!oldVoice.channelId) {
                    memberData.currVoice = setObject[`stats.${memberId}.currVoice`] = {
                        startedTimestamp: NOW_TIME,
                        channelId: newVoice.channelId
                    };
                }
                // Eğer ses kanalını değiştirmişse
                else if (memberData.currVoice.channelId) {
                    // Ses kanalı verisini çek ve veriyi sil
                    const {
                        startedTimestamp,
                        channelId
                    } = memberData.currVoice;

                    memberData.currVoice = setObject[`stats.${memberId}.currVoice`] = newVoice.channelId ? {
                        startedTimestamp: NOW_TIME,
                        channelId: newVoice.channelId
                    } : {};

                    // Seste kaldığı süre
                    const time = NOW_TIME - startedTimestamp;

                    // Database'ye kaydet
                    memberData.totals.voice = setObject[`stats.${memberId}.totals.voice`] = (memberData.totals.voice + time);

                    const voiceChannel = memberData.voice[channelId] ??= Util.DEFAULTS.memberVoiceStat;
                    voiceChannel.total = setObject[`stats.${memberId}.voice.${channelId}.total`] = (voiceChannel.total + time);

                    const voiceChannelObject = {
                        startedTimestamp: NOW_TIME,
                        endedTimestamp: NOW_TIME,
                        duration: time
                    };
                    voiceChannel.datas.unshift(voiceChannelObject);
                    pushObject[`stats.${memberId}.voice.${channelId}.datas`] = {
                        $each: [voiceChannelObject],
                        $position: 0
                    };
                }

                // Database'ye kaydet
                await database.updateGuild(guildId,
                    (
                        isNewUser ?
                            {
                                $set: {
                                    [`stats.${memberId}`]: memberData
                                }
                            } :
                            {
                                $set: setObject,
                                $push: pushObject
                            }
                    ),
                    isNewUser
                );
            }


        } catch (e) {
            console.error(e);
        }
    }
}