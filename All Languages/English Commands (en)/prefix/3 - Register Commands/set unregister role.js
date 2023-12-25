"use strict";
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "unregisterrole", // Komutun ismi
    id: "kayıtsızrol", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unregisterrole",
        "unregisteredrole",
        "unregister-role",
        "unregistered-role"
    ],
    description: "You set the Unregistered role", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unregisterrole <@role or Role ID>", // Komutun kullanım şekli
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

        const content = args.join(" ");
        const roleIds = guildDatabase.register.roleIds;

        // Eğer ayarlanan kayıtsız rolünü sıfırlamak istiyorsa
        if (content.toLocaleLowerCase(language) == "reset") {
            // Eğer zaten sıfırlanmış ise
            if (!roleIds.unregister) return errorEmbed("Unregistered member role has already been reset");

            roleIds.unregister = "";
            database.writeFile(guildDatabase, guildId);
            return errorEmbed("Unregistered member role successfully reset", "success");
        }

        // Rolü ayarla
        const role = Util.fetchRole(msg);
        if (!role) return errorEmbed(
            `• To set the unregistered member role **${prefix}${this.name} @role**\n\n` +
            `• To reset, you can type **${prefix}${this.name} reset**`,
            "warn"
        );
        const roleId = role.id;

        // Eğer rol daha önceden ayarlanan rolle aynıysa hata döndür
        if (roleIds.unregister === roleId) return errorEmbed("The unregistered member role is the same as the role you have already tagged");

        // Eğer rol bot rolüyse hata döndür
        if (role.managed) return errorEmbed(`I cannot give roles created by bots to others`);

        // Eğer rol başka bir role daha aitse hata döndür
        if (roleIds.boy.includes(roleId)) return errorEmbed(`The role you tagged is the role that will be given to men on this server. Please tag another role`)
        if (roleIds.girl.includes(roleId)) return errorEmbed(`The role you tagged is the role that will be given to the girls on this server. Please tag another role`)
        if (roleIds.normal.includes(roleId)) return errorEmbed(`The role you tagged is the role that will be given to the members on this server. Please tag another role`)
        if (roleIds.bot.includes(roleId)) return errorEmbed(`The role you tagged is the role that will be given to the bots on this server. Please tag another role`)
        if (roleIds.yetkili == roleId) return errorEmbed(`The role you tagged is the role that registers the members on this server. Please tag another role`);

        // Rolün sırası botun sırasından yüksekse hata döndür
        const highestRole = guildMe.roles.highest;
        if (highestRole.position <= role.position) return errorEmbed(`The rank of the role <@&${roleId}> is higher than the rank of my role! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`)

        roleIds.unregister = roleId;
        database.writeFile(guildDatabase, guildId);
        return errorEmbed(
            `From now on, after registering the members, I will get the role named <@&${roleId}> from them\n\n` +
            `• ‼️ **Warning!** This role will only be granted when __**recording channel**__ is set${guildDatabase.register.channelIds.register ? "" : `• To set the recording channel, you can type **${prefix}registerchannel #channel**`}`,
            "success"
        );

    },
};