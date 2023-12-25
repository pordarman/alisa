"use strict";
const {
    VoiceState,
    Events
} = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const Util = require("../../Helpers/Util");

module.exports = {
    name: Events.VoiceStateUpdate,
    /**
     * 
     * @param {VoiceState} oldVoice 
     * @param {VoiceState} newVoice 
     */
    async execute(oldVoice, newVoice) {
        try {

            // Eğer seste değişiklik yapan bot değilse veya sesten çıkış yapmamışsa hiçbir şey yapma
            if (
                oldVoice.member.id != oldVoice.client.user.id ||
                newVoice.channelId !== null
            ) return;

            // 1 saniye gecikmeli bir şekilde çalıştır
            setTimeout(() => {

                const guildId = newVoice.guild.id;
                const guildDatabase = Util.getGuildData(newVoice.client, guildId);

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

        } catch (e) {
            console.log(e);
        }
    }
}