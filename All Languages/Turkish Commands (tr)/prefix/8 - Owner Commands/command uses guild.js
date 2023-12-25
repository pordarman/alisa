"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "s-sıra", // Komutun ismi
    id: "s-sıra", // Komutun ID'si
    cooldown: -1, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "s-sıra",
        "ssıra"
    ],
    description: "Bütün sunucuları komut kullanımına veya sunucu sayısına göre sıralar", // Komutun açıklaması
    category: "Sahip komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>s-sıra [komut/toplam/üye/bot] [çok/az]", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        alisa,
        guildDatabase,
        msg,
        msgMember,
        guildMe,
        guildId,
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
        language
    }) {

        // Hangi değere ve hangi sıraya göre sıralayacağını ayarla
        const sortTypeObject = {
            type: args[0] || "komut",
            sort: args[1] || "çok"
        }

        let sort;

        // Hangi değere göre sıralayacağını ayarla
        switch (sortTypeObject.type) {
            case "komut":
            case "k":
            case "kod":
            case "komutlar":
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return alisa.guildsCommandUses[b.id] - alisa.guildsCommandUses[a.id]
                    } :
                    (a, b) => {
                        return alisa.guildsCommandUses[a.id] - alisa.guildsCommandUses[b.id]
                    }
                break;

            case "toplam":
            case "total":
            case "t":
                sort = sortTypeObject.sort == "çok" ?
                    (a, b) => {
                        return b.memberCount - a.memberCount
                    } :
                    (a, b) => {
                        return a.memberCount - b.memberCount
                    }
                break;

            case "üye":
            case "kişi":

            default:
                break;
        }

    },
};