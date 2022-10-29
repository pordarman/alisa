const db = require("../modüller/database")
const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const ayarlar = require("../ayarlar.json")
module.exports = {
    name: "messageDelete",
    /**
     * 
     * @param {Message} msg 
     */
    async run(msg) {
        if (!msg.guild || msg.author.bot) return;
        let snipeDosya = db.buldosya("snipe", "diğerleri")
        if (!snipeDosya) return;
        let id = msg.author.id
            , object = { i: msg.content, z: msg.createdTimestamp, s: Date.now(), sa: id, resim: msg.attachments.first()?.proxyURL }
            , snipe = snipeDosya[msg.channelId] || {}
        snipe[id] = object
        snipe.son = id
        snipeDosya[msg.channelId] = snipe
        db.yazdosya(snipeDosya, "snipe", "diğerleri")
    }
}