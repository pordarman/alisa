const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    aliases: ["otoisim", "oto-isim"],
    name: "isimleri düzenle",
    cooldown: 5,
    y: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        msg.client.commands.get("isim-özel").run({ guildDatabase, pre, alisa, msg, args: ["giriş", ...args], guildId, prefix, hata, guild, msgMember, guildMe })
    }
}