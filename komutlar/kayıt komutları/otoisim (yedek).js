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
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        msg.client.commands.get("isim-özel").run({ sunucudb, pre, alisa, msg, args: ["giriş", ...args], sunucuid, prefix, hata, guild, msgMember, guildMe })
    }
}