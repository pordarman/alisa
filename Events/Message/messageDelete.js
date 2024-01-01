"use strict";
const {
  Message,
  Events
} = require("discord.js");
const database = require("../../Helpers/Database");
const Util = require("../../Helpers/Util");

module.exports = {
  name: Events.MessageDelete,
  /**
   *
   * @param {Message} msg
   */
  async execute(msg) {

    // Eğer mesajın sahibi null ise veya botsa hiçbir şey yapma
    if (!msg.author || msg.author.bot) return;

    const guildDatabase = Util.getGuildData(msg.client, msg.guildId);

    const snipeDatabase = guildDatabase.snipe[msg.channelId] ??= {};
    const authorId = msg.author.id;
    const messageData = {
      content: msg.content,
      createdTimestamp: msg.createdTimestamp,
      deletedTimestamp: Date.now(),
      attachments: {
        image: 0,
        video: 0,
        audio: 0,
        text: 0,
        font: 0,
        other: 0
      },
    };

    // Mesajdaki dosyalarını kontrol eder ve neler olduğunu yazar
    let isHaveAttachment = false;
    for (const attachment of msg.attachments.values()) {
      isHaveAttachment = true;
      const [type] = attachment.contentType.split("/");

      messageData.attachments[type in messageData.attachments ? type : "other"] += 1;
    }

    // Snipe databasesini düzenle
    snipeDatabase.lastUserId = authorId;
    snipeDatabase[authorId] = messageData;

    // Snipe databasesini kaydeder
    database.writeFile(guildDatabase, msg.guildId);
  },
};
