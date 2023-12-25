"use strict";
const {
    RESTJSONErrorCodes
} = require("discord.js");
const database = require("../../../../Helpers/Database");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "suspicious", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kick user to suspect", // Butonun açıklaması
    care: false, // Butonun bakım modunda olup olmadığını ayarlar
    ownerOnly: false, // Butonun sadece sahiplere özel olup olmadığını ayarlar
    premium: false, // Butonun sadece premium kullanıcılara özel olup olmadığını ayarlar

    /**
     * Parametrelerdeki isimlerin ne olduklarını tanımlar
     * @param {import("../../../../typedef").exportsRunButtons} params 
     */
    async execute({
        guildDatabase,
        int,
        customId,
        guild,
        guildId,
        authorId,
        errorEmbed,
    }) {

        const intMember = int.member;

        // Eğer yetkili rolü varsa yetkili rolünün olup olmadığını kontrol et
        const authorizedRoleId = guildDatabase.register.roleIds.registerAuth;
        if (authorizedRoleId) {
            // Eğer kullanıcıda yetkili rolü yoksa hata döndür
            if (!intMember["_roles"].includes(authorizedRoleId) && !intMember.permissions.has("Administrator")) return errorEmbed(`<@&${authorizedRoleId}> role **or** Administrator`, "memberPermissionError");
        }
        // Eğer yetkili rolü ayarlanmamışsa kullanıcının yönetici olup olmadığını kontrol et
        else if (!intMember.permissions.has("Administrator")) return errorEmbed("Administrator", "memberPermissionError");

        const guildMe = guild.members.me;

        // Eğer botta "Rolleri Yönet" yetkisi yoksa
        if (!guildMe.permissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError");

        const [_, memberId] = customId.split("-");
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Wellyyy... I think this person is no longer on the server, you stupid thing :(");

        // Eğer kullanıcı kendi kendini şüpheliye atmaya çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't make yourself a suspect, you stupid thing :)")

        // Eğer sunucu sahibini şüpheliye atmaya çalışıyorsa
        if (memberId == guild.ownerId) return errorEmbed("You can't assign the server owner as a suspect, you stupid thing :)");

        // Eğer şüpheli rolü ayarlanmamışsa
        const suspiciousRoleId = guildDatabase.suspicious.roleId;
        if (!suspiciousRoleId) return errorEmbed(
            `Suspicious roles are __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
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

                int.message.reply(`• ⛔ <@${memberId}> was posted to Suspect by <@${authorId}>!`)
                db.yazdosya(sunucudb, sunucuid)
                return;
            }).catch(err => {
                // Eğer kişi sunucuda değilse
                if (err.code == RESTJSONErrorCodes.UnknownMember) return int.reply({
                    content: "• Wellyyy... I think this person is no longer on the server, you stupid thing :(",
                    ephemeral: true
                });

                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `• I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                    ephemeral: true,
                    allowedMentions: {
                        roles: []
                    }
                });

                console.log(err)
                return int.reply({
                    content: `Ummm... There was an error, can you try again later??\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};