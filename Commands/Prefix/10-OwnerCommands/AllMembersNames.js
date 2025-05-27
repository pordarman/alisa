"use strict";
const database = require("../../../Helpers/Database.js");
const Util = require("../../../Helpers/Util.js");
const createMessageArrows = require("../../../Helpers/Functions/CreateMessageArrows");

module.exports = {
    name: { // Komutun ismi
        tr: "herkesinisimleri",
        en: "allmembersnames"
    },
    id: "herkesinisimleri", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "herkesinadları",
            "herkesinisimleri",
            "allmembersnames"
        ],
        en: [
            "allmembersnames"
        ]
    },
    description: { // Komutun açıklaması
        tr: "Kayıt edilmiş tüm üyelerin isimlerini gösterir",
        en: "Shows the names of all registered members"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>herkesinisimleri",
        en: "<px>allmembersnames"
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
    }) {

        const file = await database.getFile("members names");

        // Dosyadaki bütün verileri düzenle ve zamana göre sırala
        const data = [];
        for (const memberId in file) {
            const membersData = file[memberId];
            for (const guildId in membersData) {
                const guildDatas = membersData[guildId];
                for (let i = 0; i < guildDatas.length; i++) {
                    data.push({
                        memberId,
                        guildId,
                        ...guildDatas[i]
                    });
                }
            }
        };
        data.sort((a, b) => b.timestamp - a.timestamp);

        const clientAvatar = msg.client.user.displayAvatarURL();

        return createMessageArrows({
            msg,
            array: data,
            async arrayValuesFunc({
                result: {
                    memberId,
                    name,
                    gender,
                    timestamp
                },
                index,
                length
            }) {
                return `• \`#${length - index}\` ${Util.textToEmoji(gender)} <@${memberId}> - ${name} - <t:${Util.msToSecond(timestamp)}:F>`;
            },
            embed: {
                author: {
                    name: msg.client.user.tag,
                    iconURL: clientAvatar
                },
                description: `• Bot ile şu ana kadar kayıt edilmiş toplam **${data.length}** veri bulunmaktadır`,
                thumbnail: clientAvatar
            },
            forwardAndBackwardCount: 20,
            VALUES_PER_PAGE: 15,
            arrowTimeout: 1000 * 60 * 10 // 10 dakika
        });

    },
};