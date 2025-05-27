"use strict";
const {
    EMOJIS
} = require("../../../settings.json");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "event",
        en: "event"
    },
    id: "event", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "event"
        ],
        en: [
            "event"
        ],
    },
    description: { // Komutun açıklaması
        tr: "client.emit fonksiyonunu kullanarak event tetiklersiniz",
        en: "You trigger the event using the client.emit function"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>event <Event adı> <Event argümanları>",
        en: "<px>event <Event name> <Event arguments>"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: true, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
        guild,
        args,
        errorEmbed,
    }) {

        const eventName = args.shift();

        switch (eventName?.toLocaleLowerCase("tr")) {
            case "a":
            case "add":
            case "guildadd":
            case "guildmemberadd":
            case "memberadd":
                const member = msg.mentions.members.first() || await Util.fetchMember(guild, args[0]);
                if (!member) return errorEmbed("Lütfen bir üye veya üye ID'si girin");

                msg.client.emit("guildMemberAdd", member);
                break;

            default:
                return errorEmbed("Lütfen geçerli bir event adı girin (guildMemberAdd)");
        }

        return msg.react(EMOJIS.yes)
    },
};