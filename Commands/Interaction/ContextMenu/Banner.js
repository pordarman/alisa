"use strict";
const {
    ContextMenuCommandBuilder,
    ApplicationCommandType
} = require("discord.js");
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "Banner",
        en: "Banner"
    },
    id: "banner", // Komutun ID'si
    cooldown: 5, // Komutun bekleme süresi
    data: { // Komutun nasıl çalışacağını ayarlama
        tr: new ContextMenuCommandBuilder()
            .setName("Banner")
            .setType(
                ApplicationCommandType.User
            ),
        en: new ContextMenuCommandBuilder()
            .setName("Banner")
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
        const user = params.int.targetUser;

        Util.interactionToMessage(params, {
            mentions: {
                user
            }
        });

        return Util.maps.prefixCommandIds.get(this.id).execute(params);

    }
}