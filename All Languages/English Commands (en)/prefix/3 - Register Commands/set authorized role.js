"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "authrole", // Komutun ismi
    id: "yetkilirol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "authrole",
        "authorizedrole"
    ],
    description: "You set the authority role", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>authrole <@role or Role ID>", // Komutun kullanım şekli
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
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.registerAuth) return errorEmbed("Registration authority role has already been reset");

            roleIds.registerAuth = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Registration authority role successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the registration authority role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );
        const rolId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (roleIds.registerAuth === rolId) return errorEmbed("The registration authority role is the same as the role you have already tagged");

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`The role you tagged is a bot role. Please tag another role`);

        // Eğer rol başka bir role daha aitse hata döndür
        if (roleIds.boy.includes(rolId)) return errorEmbed(`The role you tagged is the role that will be given to men on this server. Please tag another role`)
        if (roleIds.girl.includes(rolId)) return errorEmbed(`The role you tagged is the role that will be given to the girls on this server. Please tag another role`)
        if (roleIds.normal.includes(rolId)) return errorEmbed(`The role you tagged is the role that will be given to the members on this server. Please tag another role`)
        if (roleIds.bot.includes(rolId)) return errorEmbed(`The role you tagged is the role that will be given to the bots on this server. Please tag another role`)
        if (roleIds.unregister == rolId) return errorEmbed(`The role you tagged is the unregistered role on this server. Please tag another role`);

        roleIds.registerAuth = rolId;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, only people with **Administrator** authority or <@&${roleId}> role will be able to register members`,
            "success"
        );

    },
};