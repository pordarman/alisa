"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kickauth", // Komutun ismi
    id: "kickyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "kickauth",
    ],
    description: "You set the kick authorized role", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>kickauth <@role or Role ID>", // Komutun kullanım şekli
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
        const roleIds = guildDatabase.moderation.roleIds;

        // Eğer ayarlanan kick rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.kickAuth) return errorEmbed("The kick authority role has already been reset");

            roleIds.kickAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Kick authority role has been successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the kick authority role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is the bot role. Please tag another role`);

        // Eğer etiketlediği rol kick yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.kickAuth) return errorEmbed("The kick authorized role is the same as the role you have already tagged");

        roleIds.kickAuth = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only those who have the <@&${role.id}> role or those who have the authority to Kick Members will be able to kick people`,
            "success"
        );

    },
};