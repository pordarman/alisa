"use strict";
const database = require("../../../../Helpers/Database");
const {
    EMOJIS
} = require("../../../../settings.json");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "vip", // Komutun ismi
    id: "vip", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "vip",
    ],
    description: "Shows VIP related commands", // Komutun açıklaması
    category: "Extra commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>vip <Options>", // Komutun kullanım şekli
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

        // Girdiği seçeneklere göre kodu çalıştır
        switch (args[0]?.toLocaleLowerCase()) {

            // Eğer vip rolü ayarlamak istiyorsa
            case "role":
            case "viprole": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

                const roleId = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (roleId.toLocaleLowerCase(language) == "reset") {

                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vip == "") return errorEmbed("VIP role has already been reset");

                    // Database'ye kaydet
                    guildDatabase.roleIds.vip = "";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("VIP role reset successfully", "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    `• To set VIP role **${prefix}${this.name} role @role**\n` +
                    `• To reset, you can type **${prefix}${this.name} role reset**`,
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(`I cannot give roles created by bots to others`);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vip === role.id) return errorEmbed("Vip role is the same as the role you have already tagged");

                // Eğer vip yetkili rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vipAuth) return errorEmbed(`The role you tagged is the VIP authorized role on this server. Please tag another role`);

                // Database'ye kaydet
                guildDatabase.roleIds.vip = role.id;
                database.writeFile(guildDatabase, guildId);
                return errorEmbed(`Vip role successfully set to <@&${role.id}>`, "success");
            }

            // Eğer vip yetkili rolünü ayarlamak istiyorsa
            case "authorizedrole":
            case "authorized": {
                // Eğer kullanıcıda "Yönetici" yetkisine sahip değilse hata döndür
                if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

                const roleId = args.join(" ");

                // Eğer rolü sıfırlamaya çalışıyorsa
                if (roleId.toLocaleLowerCase(language) == "reset") {

                    // Eğer zaten sıfırlanmışsa
                    if (guildDatabase.roleIds.vipAuth == "") return errorEmbed("VIP authorized role has already been reset");

                    // Database'ye kaydet
                    guildDatabase.roleIds.vipAuth = "";
                    database.writeFile(guildDatabase, guildId);

                    return errorEmbed("VIP authorized role successfully reset", "success");
                }

                // Rolü ayarla
                const role = Util.fetchRole(msg);

                // Eğer rolü etiketlememişse hata döndür
                if (!role) return errorEmbed(
                    `• To set VIP authorized role **${prefix}${this.name} authorized @role**\n` +
                    `• To reset, you can type **${prefix}${this.name} authorized reset**`,
                    "warn"
                );

                // Eğer bot rolü etiketlemişse hata döndür
                if (role.managed) return errorEmbed(`I cannot give roles created by bots to others`);

                // Eğer ayarlanan rolü etiketlemişse hata döndür
                if (guildDatabase.roleIds.vip === role.id) return errorEmbed("Vip role is the same as the role you have already tagged");

                // Eğer vip rolünü etiketlemişse hata döndür
                if (role.id == guildDatabase.roleIds.vip) return errorEmbed(`The role you tagged is the VIP role on this server. Please tag another role`);

                // Database'ye kaydet
                guildDatabase.roleIds.vipAuth = role.id;
                database.writeFile(guildDatabase, guildId);
                return errorEmbed(`Vip role successfully set to <@&${role.id}>`, "success");
            }

            // Eğer vip rolünü almak istiyorsa
            case "get":
            case "take": {
                const memberId = args[1];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed("Please tag someone");

                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    `No vip role __set__ on this server` +
                    (msgMember.permissions.has("Administrator") ?
                        `\n\n• To set it you can type **${prefix}${this.name} role @role**` :
                        "")
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                        "Please tag someone or enter their ID"
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed("You can't get the VIP role from the bots, you stupid thing :)");

                if (!member["_roles"].includes(vipRoleId)) return errorEmbed(`The person you tagged does not already have a VIP role`);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId).position >= highestRole.position) return errorEmbed(`The rank of role <@&${vipRoleId}> is higher than my role's rank! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                // Kullanıcıdan rolü almayı dene
                return await member.roles.remove(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        msg.react(EMOJIS.yes)
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I don't have permission to edit <@${member.id}>'s roles. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                        console.log(err);
                        return msg.reply(
                            `Ummm... There was an error, can you try again later??\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``
                        );
                    })
            }

            // Eğer hiçbir şey girmemişse
            default: {
                const memberId = args[0];

                // Eğer bir kişiyi etiketlememişse
                if (!memberId) return errorEmbed(
                    `• To give vip role to someone **${prefix}${this.name} @person**\n` +
                    `• To get the VIP role from someone **${prefix}${this.name} get @person**\n` +
                    `• To set VIP role **${prefix}${this.name} role @role**\n` +
                    `• To set the VIP authorized role, you can type **${prefix}${this.name} authorized @role**`,
                    "warn"
                );

                // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
                const authorizedRoleId = guildDatabase.roleIds.vipAuth;
                if (authorizedRoleId) {
                    // Eğer kullanıcıda yetkili rolü yoksa hata döndür
                    if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
                }
                // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
                else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

                // Vip rolünün ayarlanıp ayarlanmadığını kontrol et
                const vipRoleId = guildDatabase.roleIds.vip
                if (!vipRoleId) return errorEmbed(
                    `No vip role __set__ on this server` +
                    (msgMember.permissions.has("Administrator") ?
                        `\n\n• To set it you can type **${prefix}${this.name} role @role**` :
                        "")
                );

                // Eğer botta "Rolleri yönet" yetkisi yoksa hata döndür
                if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

                const member = msg.mentions.members.first() || await Util.fetchMember(msg, memberId);
                if (!member) return errorEmbed(
                    member === null ?
                        "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                        "Please tag someone or enter their ID"
                );

                // Eğer kullanıcı bota
                if (member.bot) return errorEmbed("You can't give bots the VIP role, you stupid thing :)");

                if (member["_roles"].includes(vipRoleId)) return errorEmbed(`The person you tag already has a VIP role`);

                // Eğer vip rolü botun rolünün üstündeyse hata döndür
                const highestRole = guildMe.roles.highest;
                if (guild.roles.cache.get(vipRoleId).position >= highestRole.position) return errorEmbed(`The rank of role <@&${vipRoleId}> is higher than my role's rank! Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                // Kullanıcıya rolü vermeyi dene
                return await member.roles.add(vipRoleId)
                    // Eğer başarılı olursa
                    .then(() => {
                        msg.react(EMOJIS.yes)
                    })
                    // Eğer bir hata oluşursa
                    .catch(err => {
                        // Eğer yetki hatası verdiyse
                        if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I don't have permission to edit <@${member.id}>'s roles. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                        console.log(err);
                        return msg.reply(
                            `Ummm... There was an error, can you try again later??\n` +
                            `\`\`\`js\n` +
                            `${err}\`\`\``
                        );
                    })
            }
        }

    },
};