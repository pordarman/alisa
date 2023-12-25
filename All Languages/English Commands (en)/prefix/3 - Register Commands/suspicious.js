"use strict";
const {
    RESTJSONErrorCodes
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "suspicious", // Komutun ismi
    id: "şüpheli", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "suspicious"
    ],
    description: "Kick user to suspect", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>suspicious <@user or User ID>", // Komutun kullanım şekli
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
        guild,
        authorId,
        args,
        prefix,
        errorEmbed,
    }) {

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!msgMember["_roles"].includes(authorizedRoleId) && !msgMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!msgMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        const member = await Util.fetchMemberForce(int, args[0]);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer kullanıcı kendi kendini şüpheliye atmaya çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't make yourself a suspect, you stupid thing :)")

        // Eğer sunucu sahibini şüpheliye atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't assign the server owner as a suspect, you stupid thing :)");

        // Eğer şüpheli rolü ayarlanmamışsa
        const suspiciousRoleId = guildDatabase.suspicious.roleId;
        if (!suspiciousRoleId) return errorEmbed(
            `Suspicious roles are __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}suspicious-role @role**` :
                "")
        );

        // Eğer kullanıcıda şüpheli rol zate varsa
        if (member["_roles"].includes(suspiciousRoleId)) return errorEmbed("Heyyy, wait there! This person has already been placed under suspicion!");

        // Kullanıcıyı düzenle
        return await member.edit({
            roles: [suspiciousRoleId]
        })
            // Eğer düzenleme başarılıysa
            .then(() => {
                const NOW_TIME = Date.now();

                // Kullanıcının log bilgilerini güncelle
                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                userLogs.unshift({
                    type: "suspicious",
                    author: authorId,
                    timestamp: NOW_TIME,
                });

                // Database'yi kaydet
                database.writeFile(guildDatabase, guildId);

                msg.reply(`• ⛔ <@${memberId}> was posted to Suspect by <@${authorId}>!`)
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return msg.reply("• Wellyyy... I think this person is no longer on the server, you stupid thing :(");

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply({
                    content: `• I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            });

    },
};