"use strict";
const {
    Events,
} = require("discord.js");

module.exports = {
    name: Events.Error,
    /**
     * 
     * @param {Error} error 
     */
    async execute(error) {
        console.error(error);
    }
}