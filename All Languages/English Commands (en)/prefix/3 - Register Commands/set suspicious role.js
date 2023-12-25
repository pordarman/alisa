"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "suspiciousrole", // Komutun ismi
    id: "şüphelirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "suspiciousrole",
        "suspicious-role"
    ],
    description: "You set the suspect role", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>suspiciousrole <@role or Role ID>", // Komutun kullanım şekli
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
        const suspicious = guildDatabase.suspicious;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!suspicious.roleId) return errorEmbed("Suspect role has already been reset");

            suspicious.roleId = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Suspect role successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the suspect role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );
        const roleId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (suspicious.roleId === roleId) return errorEmbed("The suspect role is the same as the role you have already tagged");

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is a bot role. Please tag another role`);

        suspicious.roleId = roleId;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only people with **Administrator** authority or <@&${roleId}> role will be able to assign members to the suspect`,
            "success"
        );

    },
};