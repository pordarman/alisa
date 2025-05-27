"use strict";
const {
    Events,
    Message
} = require("discord.js");
const {
    ownerId
} = require("../../settings.json");
const messageCreate = require("./MessageCreate");

module.exports = {
    name: Events.MessageUpdate,
    /**
     *
     * @param {Message} _
     * @param {Message} newMessage
     */
    async execute(_, newMessage) {

        // Eğer kişi bot sahibiyse messageCreate eventini çalıştır
        if (newMessage.author?.id == ownerId) return messageCreate.execute(newMessage);
    }
}
