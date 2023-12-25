"use strict";
const database = require("../../../../Helpers/Database");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "kickUnregistered", // Butonun ismi
    cooldown: 3, // Butonun bekleme süresi
    description: "Kullanıcıyı kayıtsıza atar", // Butonun açıklaması
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

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        const guildMe = guild.members.me;
        const guildMePermissions = guildMe.permissions;
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Unregister role is __ not setted__ on this server` +
            (intMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}unregister-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        const memberId = int.customId.split("-")[1];
        const member = await Util.fetchMemberForce(int, memberId);

        // Eğer kişi sunucuda değilse
        if (!member) return errorEmbed("Wellyyy... I think this person is no longer on the server, you stupid thing :(");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't use this command on yourself, you stupid thing :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= intMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("You cannot do this because the role rank of the person you tagged is higher than your role rank");
        
        // Kişinin rolü botun sırasının üstündeyse hata döndür
        const highestRole = guildMe.roles.highest;
        if (memberHighestRolePosition >= highestRole) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role olduğu için onu kayıtsıza atamam`)

        // Eğer kayıtsız rolünün sırası botun üstündeyse hata döndür
        if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole) return errorEmbed("I can't assign the user to unregistered because the unregistered role's rank is higher than my role's rank");

        // Eğer kişi zaten kayıtsıza atılmışsa
        if (member["_roles"].length == 1 && member["_roles"].includes(unregisterRoleId)) return errorEmbed("The person you tagged is already unregistered");

        // Kişinin ismini ayarla
        const memberName = Util.customMessages.unregisterName({
            message: guildDatabase.register.customNames.guildAdd,
            guildDatabase,
            name: member.user.displayName
        }).slice(0, Util.MAX.usernameLength);

        // Kişiyi düzenle
        return await member.edit({
            roles: [unregisterRoleId],
            nick: memberName
        })
            // Eğer düzenleme başarılıysa
            .then(() => {
                int.message.reply(`• ⚒️ <@${authorId}>, I took all the roles from <@${memberId}> and gave her/him the unregistered role successfully`);

                const userLogs = guildDatabase.userLogs[memberId] ??= [];

                // Şimdi database'ye kaydedilecek şeyleri kaydediyoruz
                const NOW_TIME = Date.now();
                userLogs.unshift({
                    type: "unregister",
                    authorId,
                    timestamp: NOW_TIME
                });
                database.writeFile(guildDatabase, guildId);
            })
            // Eğer düzenleme başarısızsa
            .catch(err => {
                // Eğer yetki hatası verdiyse
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return int.reply({
                    content: `I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`,
                    ephemeral: true
                });

                console.log(err);
                return int.reply({
                    content: `Ummm... There was an error, can you try again later??\n` +
                        `\`\`\`js\n` +
                        `${err}\`\`\``,
                    ephemeral: true
                });
            });
    },
};