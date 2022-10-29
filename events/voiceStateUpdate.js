const db = require("../modüller/database")
const { VoiceState } = require("discord.js")
const ayarlar = require("../ayarlar.json")
const DiscordVoice = require('@discordjs/voice')
module.exports = {
    name: "voiceStateUpdate",
    /**
     * 
     * @param {VoiceState} oldVoice 
     * @param {VoiceState} newVoice 
     */
    async run(oldVoice, newVoice) {
        if (oldVoice.member.id != newVoice.client.user.id) return;
        if (!newVoice.channelId) {
            try {
                setTimeout(async () => {
                    if (Object.values(db.buldosya("ses", "diğerleri")).some(a => a == oldVoice.channelId)) DiscordVoice.joinVoiceChannel({ channelId: oldVoice.channelId, guildId: newVoice.guild.id, adapterCreator: newVoice.guild.voiceAdapterCreator })
                }, 2000)
            } catch (e) { }
        }
    }
}