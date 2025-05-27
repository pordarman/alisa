"use strict";
const Util = require("../../../Helpers/Util.js");

module.exports = {
    name: { // Komutun ismi
        tr: "skomut",
        en: "skomut"
    },
    id: "skomut", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: { // Komutun diğer çağırma isimleri
        tr: [
            "skomut",
            "sk"
        ],
        en: [
            "skomut",
            "sk"
        ],
    },
    description: { // Komutun açıklaması
        tr: "Belirtilen komutu yönetici olarak kullanır",
        en: "Uses the specified command as an administrator"
    },
    category: { // Komutun kategorisi (yardım menüsü için)
        tr: "Sahip komutları",
        en: "Owner commands"
    },
    usage: { // Komutun kullanım şekli
        tr: "<px>skomut <Komut adı> [Komut argümanları]",
        en: "<px>skomut <Command name> [Command arguments]"
    },
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../Typedef").ExportsRunCommands} params 
     */
    async execute(params) {

        const {
            msg,
            guild,
            args,
            language,
            errorEmbed
        } = params;

        const commandName = args.shift();
        const command = Util.getCommand(Util.maps.prefixCommands.get(language), commandName);

        if (!command) return msg.reply("Komut bulunamadı");

        // Sunucu sahibini geçici olarak değiştir
        const ownerId = guild.ownerId;
        guild.ownerId = msg.author.id;
        try {
            await command.execute(params);
        } catch (error) {
            errorEmbed(error);
        } finally {
            // Sunucu sahibini geri değiştir
            guild.ownerId = ownerId;
        }
    },
};