const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 3,
    name: "jail",
    aliases: "reklam",
    y: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        msg.client.commands.get("jail").run({ guildDatabase, pre, alisa, msg, args: ["Reklam", ...args], guildId, prefix, hata, guild, msgMember, guildMe })
    }
}