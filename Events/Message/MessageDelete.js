"use strict";
const {
  Message,
  Events
} = require("discord.js");
const database = require("../../Helpers/Database.js");
const Util = require("../../Helpers/Util.js");

module.exports = {
  name: Events.MessageDelete,
  /**
   *
   * @param {Message} msg
   */
  async execute(msg) {

    // Eğer mesajın sahibi null ise veya botsa hiçbir şey yapma
    if (!msg.author || msg.author.bot) return;

    const guildDatabase = await database.getGuild(msg.guildId);

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
        others: 0
      },
    };

    // Mesajdaki dosyalarını kontrol eder ve neler olduğunu yazar
    let isHaveAttachment = false;
    for (const attachment of msg.attachments.values()) {
      isHaveAttachment = true;
      const [type] = attachment.contentType?.split("/") ?? [];

      messageData.attachments[type in messageData.attachments ? type : "other"] += 1;
    }

    // Snipe databasesini düzenle
    snipeDatabase.lastUserId = authorId;
    snipeDatabase[authorId] = messageData;

    const setObject = {
      [`snipe.${msg.channelId}.${authorId}`]: messageData
    };
    if (snipeDatabase.lastUserId !== authorId) setObject[`snipe.${msg.channelId}.lastUserId`] = authorId;

    // Snipe databasesini kaydeder
    await database.updateGuild(msg.guildId, {
      $set: setObject
    });

  },
};
