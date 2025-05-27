"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "wrong",
        en: "wrong"
    },
    id: "wrong", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "wrong",
            "wrongcommands",
        ],
        en: [
            "wrong",
            "wrongcommands",
        ],
    },
    description: { // Komutun açıklaması
        tr: "Kullanıcıların yanlış kullandığı komutları gösterir",
        en: "Shows the commands that users use incorrectly"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>wrong",
        en: "<px>wrong"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute({
        msg,
    }) {

        const allWrongCommands = await database.getFile("wrong commands");
        const allWrongCommandsArray = Object.entries(allWrongCommands).sort(([commandName1, { count: count1 }], [commandName2, { count: count2 }]) => count2 - count1 || commandName1.localeCompare(commandName2, "tr"));

        const clientAvatar = msg.client.user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: allWrongCommandsArray,
            async arrayValuesFunc({
                result: [wrongCommand, { count: wrongCommandCount, language: wrongCommandLanguage }],
                index,
            }) {
                return `• \`#${index + 1}\` **${wrongCommand} (${wrongCommandLanguage}):** ${Util.toHumanize(wrongCommandCount)} kere`;
            },
            embed: {
                author: {
                    name: msg.client.user.tag,
                    iconURL: clientAvatar
                },
                description: `Toplamda **${Util.toHumanize(allWrongCommandsArray.length)}** farklı yanlış komut kullanılmış!`,
                thumbnail: clientAvatar
            },
            VALUES_PER_PAGE: 20
        })
    },
};