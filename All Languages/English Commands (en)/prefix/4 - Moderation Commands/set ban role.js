"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "banauth", // Komutun ismi
    id: "banyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "banauth",
    ],
    description: "You set the ban authorized role", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>banauth <@role or Role ID>", // Komutun kullanım şekli
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

        // Eğer ayarlanan ban rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.banAuth) return errorEmbed("The ban authority role has already been reset");

            roleIds.banAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Ban authority role has been successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the ban authority role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is the bot role. Please tag another role`);

        // Eğer etiketlediği rol ban yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.banAuth) return errorEmbed("The ban authorized role is the same as the role you have already tagged");

        roleIds.banAuth = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only those who have the <@&${role.id}> role or those who have the authority to Ban Members will be able to ban people`,
            "success"
        );

    },
};