"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "memberrole", // Komutun ismi
    id: "kayıtrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "memberrole",
        "member-role",
        "normalrole",
        "normal-role",
        "normalrole",
        "set-normal-role"
    ],
    description: "You set member roles", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>memberrole <@roles or Role IDs>", // Komutun kullanım şekli
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
        guildMe,
        guildId,
        args,
        prefix,
        errorEmbed,
        language,
    }) {

        // Eğer kişide "Yönetici" yetkisi yoksa hata döndür
        if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer sunucunun kayıt türü "Normal Kayıt" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "normal") return errorEmbed(
            `My record type is set to __**Gender**__!\}n\n` +
            `• If you do not want to register as a boy or girl, you can write **${prefix}registertype normal**`
        );

        const content = args.join(" ");
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan üye rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (roleIds.normal.length == 0) return errorEmbed("The roles given to members have already been reset");

            roleIds.normal = [];
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Roles assigned to members have been successfully reset", "success");
        }

        // Rolü ayarla
        const allRoles = Util.fetchRoles(msg);
        if (allRoles.size == 0) return errorEmbed(
            `• To set member roles **${prefix}${this.name} @role @role @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );

        // Eğer rollerin içinde bot rolü varsa hata döndür
        if (allRoles.some(role => role.managed)) return errorEmbed(`I cannot give roles created by bots to others`);

        // Eğer rollerin içinde kayıtsız rolü varsa hata döndür
        const unregisterRoleId = roleIds.unregister
        if (allRoles.has(unregisterRoleId)) return errorEmbed(`The role named [<@&${unregisterRoleId}>] that you tagged is the role that will be given to unregistered members on this server. Please tag another role`);

        // Eğer rollerin içinde yetkili rolü varsa hata döndür
        const authorizedRoleId = roleIds.registerAuth
        if (allRoles.has(authorizedRoleId)) return errorEmbed(`The role named [<@&${authorizedRoleId}>] that you tagged is the role that registers the members on this server. Please tag another role`);

        // Eğer çok fazla rol etiketlemişse hata döndür
        if (allRoles.size > Util.MAX.mentionRoleForRegister) return errorEmbed(`Hey hey heyyy don't you think you tagged too many roles? You can set up to **${Util.MAX.mentionRoleForRegister}** roles`);

        // Bazı rollerin sırası botun rollerinden üstteyse hata döndür
        const highestRole = guildMe.roles.highest;
        const rolesAboveFromMe = allRoles.filter(role => role.position >= highestRole.position);
        if (rolesAboveFromMe.size != 0) return errorEmbed(`The rank of the role(s) named [${rolesAboveFromMe.map(role => `<@&${role.id}>`).join(" | ")}] that you tagged is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

        roleIds.normal = allRoles.map(role => role.id);
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on I will give members role(s) named [${allRoles.map(role => `<@&${role.id}>`).join(" | ")}]`,
            "success"
        );

    },
};