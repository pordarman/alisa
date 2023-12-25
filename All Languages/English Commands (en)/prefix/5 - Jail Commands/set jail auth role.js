"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "jailauth", // Komutun ismi
    id: "jailyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "jailauth",
    ],
    description: "You set the jail authorized role", // Komutun açıklaması
    category: "Jail commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>jailauth <@role or Role ID>", // Komutun kullanım şekli
    care: false, // Komutun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Komutun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Komutun sadece premium kullanıcılara özel olup olmadığını ayarlar
    addHelpCommand: true, // Komutun yardım komuta eklenip eklenmeyeceğini ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunCommands} params 
     */
    async execute({
        guildDatabase,
        msg,
        msgMember,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const content = args.join(" ");
        const jail = guildDatabase.jail;

        // Eğer ayarlanan mute rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!jail.authRoleId) return errorEmbed("Jail authority role has already been reset");

            jail.authRoleId = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Jail authorized role successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the jail authorized role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is the bot role. Please tag another role`);

        // Eğer etiketlediği rol mute yetkili rolüyle aynıysa hata döndür
        if (role.id == jail.authRoleId) return errorEmbed("Jail authorized role is the same as the role you have already tagged");

        jail.authRoleId = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only people with **Administrator** authority or <@&${role.id}> role will be able to Jail members`,
            "success"
        );

    },
};