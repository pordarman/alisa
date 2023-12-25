"use strict";
const database = require("../../../../Helpers/Database");
const {
    RESTJSONErrorCodes
} = require("discord.js");
const Util = require("../../../../Helpers/Util");

module.exports = {
    name: "unregister", // Komutun ismi
    id: "kayıtsız", // Komutun ID'si
    cooldown: 3, // Komutun bekleme süresi
    aliases: [ // Komutun diğer çağırma isimleri
        "unregister"
    ],
    description: "Unregisters the user", // Komutun açıklaması
    category: "Register commands", // Komutun kategorisi (yardım menüsü için)
    usage: "<px>unregister <@user or User ID>", // Komutun kullanım şekli
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
        guildMePermissions,
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

        // Eğer kayıt ayarı kapalıysa hata döndür
        if (guildDatabase.register.isRegisterOff) return errorEmbed(
            `Currently my recording setting is disabled so you __can't do any recording operations__` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• If you want to open my registry setting, you can type **${prefix}register open**` :
                "")
        );

        // Eğer botta bazı yetkiler yoksa hata döndür
        if (!guildMePermissions.has("ManageRoles")) return errorEmbed("Manage Roles", "botPermissionError")
        if (!guildMePermissions.has("ManageNicknames")) return errorEmbed("Manage Nicknames", "botPermissionError");

        const {
            unregister: unregisterRoleId
        } = guildDatabase.register.roleIds;

        // Eğer Kayıtsız rolü ayarlanmamışsa hata döndür
        if (!unregisterRoleId) return errorEmbed(
            `Unregister role is __ not setted__ on this server` +
            (msgMember.permissions.has("Administrator") ?
                `\n\n• To set it, you can type **${prefix}unregister-role @role** or instead of setting everything one by one, you can type **${prefix}set** and set up the entire registry system with a single command` :
                "")
        );

        const member = msg.mentions.members.first() || await Util.fetchMember(msg, args[0]);

        // Eğer kişiyi etiketlememişse
        if (!member) return errorEmbed(
            member === null ?
                "It looks like the person you tagged is not on the server or you typed the ID of something else :(" :
                "Please tag someone or enter their ID"
        );

        const memberId = member.id;

        // Eğer komutu botun üzerinde denemeye çalışıyorsa
        if (member.user.bot) return errorEmbed("This command is not used on bots");

        // Eğer kendi rollerini değiştirmeye çalışıyorsa
        if (memberId === authorId) return errorEmbed("You can't use this command on yourself, you stupid thing :)");

        // Eğer kişinin rolü komutu kullanan kişiden üstteyse
        const memberHighestRolePosition = member.roles.highest.position;
        if (memberHighestRolePosition >= msgMember.roles.highest.position && authorId !== guild.ownerId) return errorEmbed("You cannot do this because the role rank of the person you tagged is higher than your role rank");

        // Kişinin rolü botun sırasının üstündeyse hata döndür
        const highestRole = guildMe.roles.highest;
        if (memberHighestRolePosition >= highestRole.position) return errorEmbed(`The role rank of the person you tagged is higher than the rank of my role olduğu için onu kayıtsıza atamam`)

        // Eğer kayıtsız rolünün sırası botun üstündeyse hata döndür
        if (guild.roles.cache.get(unregisterRoleId)?.position >= highestRole.position) return errorEmbed("I can't assign the user to unregistered because the unregistered role's rank is higher than my role's rank");

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
                msg.reply(`• ⚒️ I took all the roles from <@${member.user.id}> and gave him/her the unregistered role successfully`);

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
                if (err.code == RESTJSONErrorCodes.MissingPermissions) return msg.reply(`I do not have the authority to edit the name and roles of <@${memberId}>. Please Move the role named <@&${Util.getBotOrHighestRole(guildMe).id}> to the top and try again`);

                console.log(err);
                return msg.reply(
                    `Ummm... There was an error, can you try again later??\n` +
                    `\`\`\`js\n` +
                    `${err}\`\`\``
                );
            });

    },
};