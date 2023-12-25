"use strict";
const {
    Events,
} = require("discord.js");

module.exports = {
    name: Events.Warn,
    /**
     * 
     * @param {String} error 
     */
    async execute(error) {
        console.log(error);
    }
}