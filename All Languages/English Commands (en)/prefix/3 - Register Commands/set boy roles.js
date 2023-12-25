"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "boyrole", // Komutun ismi
    id: "erkekrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "boyrole",
        "boy-role",
        "setboyrole",
        "set-boy-role"
    ],
    description: "You set boy roles", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>boyrole <@roles or Role IDs>", // Komutun kullanım şekli
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

        // Eğer sunucunun kayıt türü "Cinsiyet" olarak değilse ayarlıysa hata döndür
        if (guildDatabase.register.type != "gender") return errorEmbed(
            `My recording type is set to __**Normal Registration**__!\n\n` +
            `• If you want to register as male or female, you can write **${prefix}registertype gender**`
        );

        const content = args.join(" ");
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan erkek rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (roleIds.boy.length == 0) return errorEmbed("The roles given to boys have already been reset");

            roleIds.boy = [];
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Roles assigned to boys have been successfully reset", "success");
        }

        // Rolü ayarla
        const allRoles = Util.fetchRoles(msg);
        if (allRoles.size == 0) return errorEmbed(
            `• To set boy roles **${prefix}${this.name} @role @role @role**\n\n` +
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

        roleIds.boy = allRoles.map(role => role.id);
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on I will give boys role(s) named [${allRoles.map(role => `<@&${role.id}>`).join(" | ")}]`,
            "success"
        );

    },
};