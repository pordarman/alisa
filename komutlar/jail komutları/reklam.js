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
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        msg.client.commands.get("jail").run({ sunucudb, pre, alisa, msg, args: ["Reklam", ...args], sunucuid, prefix, hata, guild, msgMember, guildMe })
    }
}