"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "jailrol", // Komutun ismi
    id: "jailrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jailrol",
        "jailrole",
    ],
    description: "Jail rolü ayarlarsınız", // Komutun açıklaması
    category: "Jail komutları", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jailrol <@rol veya Rol ID'si>", // Komutun kullanım şekli
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
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Yönetici", "memberPermissionError");

        const content = args.join(" ");
        const jail = guildDatabase.jail;

        // Eğer ayarlanan mute rolünü sıfırlamak istiyorsa
        if (["sıfırla", "sifirla"].includes(content.toLocaleLowerCase(language))) {
            // Eğer zaten sıfırlanmış ise
            if (!jail.roleId) return errorEmbed("Jail rolü zaten sıfırlanmış durumda");

            jail.roleId = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Jail rolü başarıyla sıfırlandı", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• Jail rolünü ayarlamak için **${prefix}${this.name} @rol**\n\n` +
            `• Sıfırlamak için ise **${prefix}${this.name} sıfırla** yazabilirsiniz`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`Etiketlediğiniz rol bot rolüdür. Lütfen başka bir rol etiketleyiniz`);

        // Eğer etiketlediği rol mute yetkili rolüyle aynıysa hata döndür
        if (role.id == jail.roleId) return errorEmbed("Jail rolü zaten etiketlediğiniz rolle aynı");

        jail.roleId = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `Bundan sonra Jail'e atılan kişilere <@&${role.id}> adlı rolü vereceğim`,
            "success"
        );

    },
};