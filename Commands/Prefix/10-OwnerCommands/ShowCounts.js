"use strict";
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "göster",
        en: "göster"
    },
    id: "göster", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "göster",
            "show"
        ],
        en: [
            "göster",
            "show"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Bot ile yapılan kayıtların yapıldığı zamanı gösterir",
        en: "Shows the time of the registrations made with the bot"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>göster",
        en: "<px>show"
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
        alisa,
        msg,
    }) {

        const registersCount = { ...alisa.registersCount };

        // Toplam kayıt sayısını bir yerde depola ve değişkenden sil
        const totalRegisters = registersCount.nowTotal;
        delete registersCount.nowTotal;

        const registerCountArray = Object.entries(registersCount).reverse();

        const clientAvatar = msg.client.user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: registerCountArray,
            async arrayValuesFunc({
                result: [count, timestamp]
            }) {
                return `• **${count}:** <t:${Util.msToSecond(timestamp)}:F>`
            },
            embed: {
                author: {
                    name: msg.client.user.tag,
                    iconURL: clientAvatar
                },
                description: `• **Şu anki toplam kayıt sayısı:** ${Util.toHumanize(totalRegisters, "tr")}`,
                thumbnail: clientAvatar,
            },
            forwardAndBackwardCount: 10,
            VALUES_PER_PAGE: 15
        });
    },
};