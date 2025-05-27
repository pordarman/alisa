"use strict";
const {
    ContextMenuCommandBuilder,
    ApplicationCommandType
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "Mesaj ve ses istatistiği",
        en: "Message and voice statistics"
    },
    id: "ben", // Komutun ID'si
    cooldown: 5, // Komutun bekleme süresi
    data: { // Komutun nasıl çalışacağını ayarlama
        tr: new ContextMenuCommandBuilder()
            .setName("Mesaj ve ses istatistiği")
            .setType(
                ApplicationCommandType.User
            ),
        en: new ContextMenuCommandBuilder()
            .setName("Message and voice statistics")
            .setType(
                ApplicationCommandType.User
            )
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunUserContextMenu} params 
     */
    async execute(params) {
        const member = params.int.targetMember;

        Util.interactionToMessage(params, {
            mentions: {
                member
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);

    }
}