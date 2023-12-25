"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "muteauth", // Komutun ismi
    id: "muteyetkili", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "muteauth",
    ],
    description: "You set the mute authorized role", // Komutun açıklaması
    category: "Moderation commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>muteauth <@role or Role ID>", // Komutun kullanım şekli
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

        // Eğer ayarlanan mute rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.muteAuth) return errorEmbed("The mute authority role has already been reset");

            roleIds.muteAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Mute authority role has been successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the mute authority role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is the bot role. Please tag another role`);

        // Eğer etiketlediği rol mute yetkili rolüyle aynıysa hata döndür
        if (role.id == roleIds.muteAuth) return errorEmbed("The mute authorized role is the same as the role you have already tagged");

        roleIds.muteAuth = role.id;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only those who have the <@&${role.id}> role or those who have the authority to Mute Members will be able to mute people`,
            "success"
        );

    },
};